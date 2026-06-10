# Express API server for the AI Face Recognition Attendance system.

---

## Prerequisites

- **Node.js v24** — Download from [nodejs.org](https://nodejs.org)
  - To check your version, run: `node -v`
  - If you use [nvm](https://github.com/nvm-sh/nvm), just run `nvm use` in this folder and it will pick up the correct version automatically.
- **Docker & Docker Compose** — Required to run Redis and the AI service.
- **MongoDB Atlas Account** — A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster is required because the app uses `$vectorSearch` (Atlas Vector Search), which is **not** available in self-hosted / Community MongoDB.

---

## Getting Started

```bash
# 1) Start Redis and the AI service
docker compose up -d

# 2) Install dependencies
npm install

# 3) Copy the env file
cp .env.example .env

# 4) Add your MongoDB Atlas URL, JWT secret, and SMTP credentials in .env

# 5) Run the server in development mode
npm run dev
```

Once running, open [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health) in your browser. You should see:

```json
{ "success": "ok" }
```

---

## Docker Compose

The `docker-compose.yaml` file spins up Redis and the AI microservice. Run it **before** starting the Node.js server.

> **Note:** MongoDB is **no longer** included in Docker Compose. The application requires [MongoDB Atlas](https://www.mongodb.com/atlas) because it relies on **Atlas Vector Search** (`$vectorSearch`) for face-recognition matching, a feature that is not available in the self-hosted Community edition of MongoDB.

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

| Service   | Image                                     | Container Name          | Host Port | Description                                                                                                 |
| --------- | ----------------------------------------- | ----------------------- | --------- | ----------------------------------------------------------------------------------------------------------- |
| **redis** | `redis:7-alpine`                          | `face-recog-redis`      | `6379`    | In-memory cache used to store temporary upload tokens (face-encoding sessions). Data is persisted with AOF. |
| **ai**    | `mohamedfouad71/ai_facenet_service:1.0.0` | `face-recog-ai-service` | `5000`    | Python-based AI microservice that extracts face embeddings from uploaded images using a FaceNet model.      |

### Volumes

| Volume Name  | Used By | Purpose                              |
| ------------ | ------- | ------------------------------------ |
| `redis_data` | Redis   | Persists cached data across restarts |

---

## API Documentation

For detailed information on the available endpoints, request/response formats, and examples, please refer to the [API Documentation](docs/api-documentation.md).

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
│   ├── app.ts            # Express app setup & middleware
│   ├── controllers/      # Route handlers (auth, student, attendance, image, error)
│   ├── routes/           # Express route definitions
│   ├── models/           # Mongoose schemas (User, Student, Attendance)
│   ├── services/         # Business logic (AuthService, AttendanceService)
│   ├── middlewares/      # Rate limiter, sanitizer, body existence check
│   ├── config/           # DB & Redis connection setup
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility / helper functions (sendEmail, operationalError, startServer)
│   └── __tests__/        # Test files (*.spec.ts)
├── docker-compose.yaml   # Redis & AI service
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

For a list of required and optional environment variables and their descriptions, see [Environment Variables](docs/environment-variables.md).

---

## Contribution

- This repo automatically runs tests before each commit to keep the repository clean, if you faced any problem after
  using the command `git commit`, Do not panic, just use `npm run format` and `npm run lint:fix`, you may also check type
  errors in your code.

- If you have faced any problem, please feel free to contact me at mohamed.fouad.softwareengineer@gmail.com
