# Express API server for the AI Face Recognition Attendance system.

---

## Prerequisites

- **Node.js v24** — Download from [nodejs.org](https://nodejs.org)
  - To check your version, run: `node -v`
  - If you use [nvm](https://github.com/nvm-sh/nvm), just run `nvm use` in this folder and it will pick up the correct version automatically.
- **Docker & Docker Compose** — Required to run MongoDB, Redis, and the AI service.

---

## Getting Started

```bash
# 1) Start the databases and AI service
docker compose up -d

# 2) Install dependencies
npm install

# 3) Copy the env file (edit values if needed)
cp .env.example .env

# 4) Run the server in development mode
npm run dev
```

Once running, open [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health) in your browser. You should see:

```json
{ "success": "ok" }
```

---

## Docker Compose

The `docker-compose.yaml` file spins up all the external services the API depends on. Run it **before** starting the Node.js server.

```bash
# Start all services in the background
docker compose up -d

# Check running containers
docker compose ps

# View logs for a specific service
docker compose logs -f <service-name>

# Stop all services
docker compose down

# Stop all services AND delete stored data (fresh start)
docker compose down -v
```

### Services

| Service     | Image                                     | Container Name          | Host Port | Description                                                                                                 |
| ----------- | ----------------------------------------- | ----------------------- | --------- | ----------------------------------------------------------------------------------------------------------- |
| **redis**   | `redis:7-alpine`                          | `face-recog-redis`      | `6379`    | In-memory cache used to store temporary upload tokens (face-encoding sessions). Data is persisted with AOF. |
| **mongodb** | `mongo:7.0`                               | `face-recog-mongodb`    | `27018`   | Primary database for students and attendance records. Credentials are read from `.env` automatically.       |
| **ai**      | `mohamedfouad71/ai_facenet_service:1.0.0` | `face-recog-ai-service` | `5000`    | Python-based AI microservice that extracts face embeddings from uploaded images using a FaceNet model.      |

### Port Mapping

> **Note:** MongoDB is mapped to host port **27018** (not the default 27017) to avoid conflicts with any local MongoDB installation.

### Environment Variables

Docker Compose automatically reads the `.env` file. The following variables are used by the **mongodb** service:

| Variable              | Description           | Example                     |
| --------------------- | --------------------- | --------------------------- |
| `MONGO_ROOT_USER`     | MongoDB root username | `admin`                     |
| `MONGO_ROOT_PASSWORD` | MongoDB root password | `super_secret_password_123` |

### Volumes

| Volume Name    | Used By | Purpose                                 |
| -------------- | ------- | --------------------------------------- |
| `redis_data`   | Redis   | Persists cached data across restarts    |
| `mongodb_data` | MongoDB | Persists database files across restarts |

---

## API Documentation

**Base URL:** `http://localhost:3000/api/v1`

All responses follow this shape:

```json
{
  "success": true | false,
  "message": "...",
  "data": { ... },
  "error": "..."
}
```

---

### Health Check

Check if the server is running.

|          |                      |
| -------- | -------------------- |
| **URL**  | `GET /api/v1/health` |
| **Auth** | None                 |

**Response** `200 OK`

```json
{ "success": "ok" }
```

---

### Images

#### Upload Image & Extract Face Encoding

Uploads a student photo, sends it to the AI service for face detection, and returns a temporary `upload_token`. This token is stored in Redis (valid for **15 minutes**) and must be used when creating the student record.

|                  |                              |
| ---------------- | ---------------------------- |
| **URL**          | `POST /api/v1/images/upload` |
| **Auth**         | None                         |
| **Content-Type** | `multipart/form-data`        |

**Request Body**

| Field           | Type   | Required | Description                             |
| --------------- | ------ | -------- | --------------------------------------- |
| `student_image` | `file` | ✅       | A photo containing **exactly one** face |

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Image processed successfully",
  "data": {
    "upload_token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

**Error Responses**

| Status | Condition                                         | Body                                                                             |
| ------ | ------------------------------------------------- | -------------------------------------------------------------------------------- |
| `400`  | No image provided                                 | `{ "success": false, "error": "image is not provided" }`                         |
| `400`  | Zero or multiple faces detected                   | `{ "success": false, "error": "the image must at least one and only one face" }` |
| `500`  | AI service error or `AI_EXTRACT_FACE_URL` not set | `{ "success": false, "error": "Internal server error" }`                         |

**Example (cURL)**

```bash
curl -X POST http://localhost:3000/api/v1/images/upload \
  -F "student_image=@./photo.jpg"
```

---

### Students

#### Create Student

Registers a new student. Requires a valid `upload_token` obtained from the image upload endpoint — this links the student record to their face encoding.

|                  |                         |
| ---------------- | ----------------------- |
| **URL**          | `POST /api/v1/students` |
| **Auth**         | None                    |
| **Content-Type** | `application/json`      |

**Request Body**

```json
{
  "fullName": "John Doe",
  "studentNo": "123456789",
  "department": "Computer Science",
  "email": "john.doe@example.com",
  "phone": "123456789",
  "upload_token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

| Field          | Type     | Required | Description                      |
| -------------- | -------- | -------- | -------------------------------- |
| `fullName`     | `string` | ✅       | Student's full name              |
| `studentNo`    | `string` | ✅       | Student number / ID              |
| `department`   | `string` | ✅       | Department name                  |
| `email`        | `string` | ✅       | Student email (must be unique)   |
| `phone`        | `string` | ✅       | Phone number                     |
| `upload_token` | `string` | ✅       | Token from the image upload step |

**Response** `201 Created`

```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "studentNo": "123456789",
    "fullName": "John Doe",
    "department": "Computer Science",
    "email": "john.doe@example.com",
    "phone": "123456789"
  }
}
```

**Error Responses**

| Status | Condition                | Body                                                                     |
| ------ | ------------------------ | ------------------------------------------------------------------------ |
| `400`  | Missing `upload_token`   | `{ "success": false, "error": "upload_token is required" }`              |
| `400`  | Missing required fields  | `{ "success": false, "error": "Missing required fields" }`               |
| `400`  | Token expired or invalid | `{ "success": false, "error": "image session is expired or not valid" }` |

**Example (cURL)**

```bash
curl -X POST http://localhost:3000/api/v1/students \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "studentNo": "123456789",
    "department": "Computer Science",
    "email": "john.doe@example.com",
    "phone": "123456789",
    "upload_token": "YOUR_UPLOAD_TOKEN"
  }'
```

---

### Registration Flow

The student registration is a **two-step process**:

```
1. Upload photo  ──►  POST /api/v1/images/upload
                       │
                       ▼
               Receive upload_token (valid 15 min)
                       │
                       ▼
2. Create student ──►  POST /api/v1/students  (include upload_token)
```

---

## Available Scripts

| Command            | What it does                                       |
| ------------------ | -------------------------------------------------- |
| `npm run dev`      | Start the dev server (auto-reload on file changes) |
| `npm run build`    | Compile TypeScript into plain JavaScript (`dist/`) |
| `npm start`        | Run the compiled JavaScript (run `build` first)    |
| `npm test`         | Run tests in watch mode                            |
| `npm run test:run` | Run tests once and exit                            |
| `npm run lint`     | Check code for linting errors                      |
| `npm run lint:fix` | Auto-fix linting errors                            |
| `npm run format`   | Auto-format all files with Prettier                |

---

## Project Structure

```
Api/
├── src/
│   ├── server.ts         # App entry point
│   ├── controllers/      # Route handlers (business logic)
│   ├── routes/           # Express route definitions
│   ├── models/           # Mongoose schemas (Student, Attendance)
│   ├── middlewares/      # Rate limiter, sanitizer
│   ├── config/           # DB & Redis connection setup
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility / helper functions
│   └── __tests__/        # Test files (*.spec.ts)
├── docker-compose.yaml   # Redis, MongoDB & AI service
├── Dockerfile            # Multi-stage production build
├── .env.example          # Template for env variables
├── package.json          # Dependencies & scripts
├── tsconfig.json         # TypeScript config
├── eslint.config.js      # Linting rules
├── vitest.config.js      # Test runner config
└── .prettierrc           # Code formatting rules
```

---

## Environment Variables

Copy `.env.example` to `.env` and adjust the values as needed:

| Variable              | Default                                                                                                  | Description                         |
| --------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `MONGO_ROOT_USER`     | `admin`                                                                                                  | MongoDB root username (for Docker)  |
| `MONGO_ROOT_PASSWORD` | `super_secret_password_123`                                                                              | MongoDB root password (for Docker)  |
| `PORT`                | `3000`                                                                                                   | Port the Express server listens on  |
| `MONGO_URI`           | `mongodb://admin:super_secret_password_123@localhost:27018/attendence-face-recognition?authSource=admin` | MongoDB connection string           |
| `REDIS_URI`           | `redis://localhost:6379`                                                                                 | Redis connection string             |
| `AI_EXTRACT_FACE_URL` | `http://localhost:5000/api/v1/extract-faces`                                                             | AI face extraction service endpoint |

---

## Contribution

- This repo automatically runs tests before each commit to keep the repository clean, if you faced any problem after
  using the command `git commit`, Do not panic, just use `npm run format` and `npm run lint:fix`, you may also check type
  errors in you code.

- if there you have faced any problem, please feel free to contact me at mohamed.fouad.softwareengineer@gmail.com
