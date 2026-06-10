# API Documentation

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

### Authentication

Protected routes require a JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer <your_token>
```

Tokens are obtained via the `/register` or `/login` endpoints. Admin-only routes additionally require the authenticated user to have the `admin` role.

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

### User / Auth

#### Register

Creates a new user account and returns a JWT token. To create an admin account, include the `adminToken` field matching the `ADMIN_CREATION_TOKEN` environment variable.

|                  |                              |
| ---------------- | ---------------------------- |
| **URL**          | `POST /api/v1/user/register` |
| **Auth**         | None                         |
| **Content-Type** | `application/json`           |

**Request Body**

| Field             | Type     | Required | Description                                                                          |
| ----------------- | -------- | -------- | ------------------------------------------------------------------------------------ |
| `name`            | `string` | ✅       | User's display name                                                                  |
| `email`           | `string` | ✅       | Valid email address (must be unique)                                                 |
| `password`        | `string` | ✅       | Min 8, max 64 chars; must include uppercase, lowercase, digit, and special character |
| `passwordConfirm` | `string` | ✅       | Must match `password`                                                                |
| `photo`           | `string` | ❌       | Optional profile photo URL                                                           |
| `adminToken`      | `string` | ❌       | Secret token to create an admin account (see `ADMIN_CREATION_TOKEN` env var)         |

**Response** `201 Created`

```json
{
  "success": true,
  "message": "User Created Succesfully",
  "data": { "token": "<jwt_token>" }
}
```

**Error Responses**

| Status | Condition                          | Body                                                                                                       |
| ------ | ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `400`  | Missing required fields            | `{ "success": false, "error": "Missing Required Fields" }`                                                 |
| `400`  | Duplicate email                    | `{ "success": false, "error": "a user with the same email already exists" }`                               |
| `401`  | Passwords don't match              | `{ "success": false, "error": "Passwords Does not Match" }`                                                |
| `401`  | Password too short/long            | `{ "success": false, "error": "Password Must be Between 8 and 64 Characters" }`                            |
| `401`  | Password missing required char set | `{ "success": false, "error": "Password Must Contain Uppercase, Lowercase, Digit and Special Character" }` |

**Example (cURL)**

```bash
curl -X POST http://localhost:3000/api/v1/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Secret@123",
    "passwordConfirm": "Secret@123"
  }'
```

---

#### Login

Authenticates an existing user and returns a JWT token.

|                  |                           |
| ---------------- | ------------------------- |
| **URL**          | `POST /api/v1/user/login` |
| **Auth**         | None                      |
| **Content-Type** | `application/json`        |

**Request Body**

| Field      | Type     | Required | Description      |
| ---------- | -------- | -------- | ---------------- |
| `email`    | `string` | ✅       | Registered email |
| `password` | `string` | ✅       | Account password |

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Signed in Successfully",
  "data": { "token": "<jwt_token>" }
}
```

**Error Responses**

| Status | Condition                 | Body                                                         |
| ------ | ------------------------- | ------------------------------------------------------------ |
| `400`  | Missing email or password | `{ "success": false, "error": "Missing Required Fields" }`   |
| `401`  | Invalid credentials       | `{ "success": false, "error": "Invalid Email or Password" }` |

**Example (cURL)**

```bash
curl -X POST http://localhost:3000/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "john@example.com", "password": "Secret@123" }'
```

---

#### Forgot Password

Sends a password reset token to the provided email address. The token is valid for **10 minutes**.

|                  |                                     |
| ---------------- | ----------------------------------- |
| **URL**          | `POST /api/v1/user/forget-password` |
| **Auth**         | None                                |
| **Content-Type** | `application/json`                  |

**Request Body**

| Field   | Type     | Required | Description      |
| ------- | -------- | -------- | ---------------- |
| `email` | `string` | ✅       | Registered email |

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Reset Token Sent Successfully",
  "data": []
}
```

**Error Responses**

| Status | Condition       | Body                                                         |
| ------ | --------------- | ------------------------------------------------------------ |
| `401`  | Missing email   | `{ "success": false, "error": "Invalid Email" }`             |
| `401`  | Email not found | `{ "success": false, "error": "Invalid Email or Password" }` |

**Example (cURL)**

```bash
curl -X POST http://localhost:3000/api/v1/user/forget-password \
  -H "Content-Type: application/json" \
  -d '{ "email": "john@example.com" }'
```

---

#### Reset Password

Resets the user's password using the token received by email.

|                  |                                                 |
| ---------------- | ----------------------------------------------- |
| **URL**          | `PATCH /api/v1/user/reset-password/:resetToken` |
| **Auth**         | None                                            |
| **Content-Type** | `application/json`                              |

**URL Parameters**

| Parameter    | Description                             |
| ------------ | --------------------------------------- |
| `resetToken` | The plain-text token received via email |

**Request Body**

| Field             | Type     | Required | Description                           |
| ----------------- | -------- | -------- | ------------------------------------- |
| `password`        | `string` | ✅       | New password (same rules as register) |
| `passwordConfirm` | `string` | ✅       | Must match `password`                 |

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Password Reset Successfully",
  "data": []
}
```

**Error Responses**

| Status | Condition                | Body                                                        |
| ------ | ------------------------ | ----------------------------------------------------------- |
| `400`  | Missing fields           | `{ "success": false, "error": "Missing Required Fields" }`  |
| `401`  | Invalid or expired token | `{ "success": false, "error": "Invalid or Expired Token" }` |
| `403`  | Missing reset token      | `{ "success": false, "error": "Missing Reset Token" }`      |

**Example (cURL)**

```bash
curl -X PATCH http://localhost:3000/api/v1/user/reset-password/YOUR_RESET_TOKEN \
  -H "Content-Type: application/json" \
  -d '{ "password": "NewSecret@123", "passwordConfirm": "NewSecret@123" }'
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

> **Note:** All student endpoints require authentication. Create and mutating operations (`POST`, `PATCH`, `DELETE`) additionally require the `admin` role.

#### Create Student

Registers a new student. Requires a valid `upload_token` obtained from the image upload endpoint — this links the student record to their face encoding.

|                  |                         |
| ---------------- | ----------------------- |
| **URL**          | `POST /api/v1/students` |
| **Auth**         | Bearer Token (admin)    |
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
| `401`  | Missing or invalid token | `{ "success": false, "error": "Unauthorized Access" }`                   |

**Example (cURL)**

```bash
curl -X POST http://localhost:3000/api/v1/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
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

#### Get All Students

Retrieves a list of all registered students. Face-encoding data and `__v` are excluded from the response.

|          |                        |
| -------- | ---------------------- |
| **URL**  | `GET /api/v1/students` |
| **Auth** | Bearer Token           |

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Students fetched successfully",
  "data": [
    {
      "_id": "664f1a2b3c4d5e6f7a8b9c0d",
      "fullName": "John Doe",
      "studentNo": "123456789",
      "department": "Computer Science",
      "email": "john.doe@example.com",
      "phone": "123456789"
    }
  ]
}
```

**Example (cURL)**

```bash
curl http://localhost:3000/api/v1/students \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

#### Get Student by ID

Retrieves a single student by their MongoDB `_id`.

|          |                            |
| -------- | -------------------------- |
| **URL**  | `GET /api/v1/students/:id` |
| **Auth** | Bearer Token               |

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Student fetched successfully",
  "data": {
    "_id": "664f1a2b3c4d5e6f7a8b9c0d",
    "fullName": "John Doe",
    "studentNo": "123456789",
    "department": "Computer Science",
    "email": "john.doe@example.com",
    "phone": "123456789"
  }
}
```

**Error Responses**

| Status | Condition         | Body                                                   |
| ------ | ----------------- | ------------------------------------------------------ |
| `400`  | Missing `id`      | `{ "success": false, "error": "id is required" }`      |
| `401`  | Unauthorized      | `{ "success": false, "error": "Unauthorized Access" }` |
| `404`  | Student not found | `{ "success": false, "error": "student not found" }`   |

**Example (cURL)**

```bash
curl http://localhost:3000/api/v1/students/664f1a2b3c4d5e6f7a8b9c0d \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

#### Update Student

Updates the fields of an existing student. Only the provided fields are modified.

|                  |                              |
| ---------------- | ---------------------------- |
| **URL**          | `PATCH /api/v1/students/:id` |
| **Auth**         | Bearer Token (admin)         |
| **Content-Type** | `application/json`           |

**Request Body** _(all fields optional)_

| Field        | Type     | Description         |
| ------------ | -------- | ------------------- |
| `fullName`   | `string` | Student's full name |
| `studentNo`  | `string` | Student number / ID |
| `department` | `string` | Department name     |
| `email`      | `string` | Student email       |
| `phone`      | `string` | Phone number        |

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Student updated successfully",
  "data": {
    "_id": "664f1a2b3c4d5e6f7a8b9c0d",
    "fullName": "Jane Doe",
    "studentNo": "123456789",
    "department": "Computer Science",
    "email": "jane.doe@example.com",
    "phone": "987654321"
  }
}
```

**Error Responses**

| Status | Condition         | Body                                                   |
| ------ | ----------------- | ------------------------------------------------------ |
| `400`  | Missing `id`      | `{ "success": false, "error": "id is required" }`      |
| `401`  | Unauthorized      | `{ "success": false, "error": "Unauthorized Access" }` |
| `404`  | Student not found | `{ "success": false, "error": "student not found" }`   |

**Example (cURL)**

```bash
curl -X PATCH http://localhost:3000/api/v1/students/664f1a2b3c4d5e6f7a8b9c0d \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{ "fullName": "Jane Doe", "email": "jane.doe@example.com" }'
```

---

#### Delete Student

Deletes a student by their MongoDB `_id`.

|          |                               |
| -------- | ----------------------------- |
| **URL**  | `DELETE /api/v1/students/:id` |
| **Auth** | Bearer Token (admin)          |

**Response** `204 No Content`

_(empty body)_

**Error Responses**

| Status | Condition         | Body                                                   |
| ------ | ----------------- | ------------------------------------------------------ |
| `400`  | Missing `id`      | `{ "success": false, "error": "id is required" }`      |
| `401`  | Unauthorized      | `{ "success": false, "error": "Unauthorized Access" }` |
| `404`  | Student not found | `{ "success": false, "error": "student not found" }`   |

**Example (cURL)**

```bash
curl -X DELETE http://localhost:3000/api/v1/students/664f1a2b3c4d5e6f7a8b9c0d \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
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

### Attendance

#### Record Attendance (Face Recognition)

Uploads a photo, extracts face embeddings via the AI service, and matches them against stored student face encodings using **Atlas Vector Search**. If a match is found, an attendance record is created for each recognized student.

|                  |                            |
| ---------------- | -------------------------- |
| **URL**          | `POST /api/v1/attendances` |
| **Auth**         | None                       |
| **Content-Type** | `multipart/form-data`      |

**Request Body**

| Field           | Type   | Required | Description                                  |
| --------------- | ------ | -------- | -------------------------------------------- |
| `student_image` | `file` | ✅       | A photo containing one or more student faces |

**Response** `200 OK` _(matches found)_

```json
{
  "success": true,
  "msg": "Succesfully registered 1 students",
  "data": [
    {
      "_id": "664f1a2b3c4d5e6f7a8b9c0e",
      "status": "Present",
      "student": "664f1a2b3c4d5e6f7a8b9c0d",
      "createdAt": "2026-05-02T19:00:00.000Z",
      "updatedAt": "2026-05-02T19:00:00.000Z"
    }
  ]
}
```

**Response** `200 OK` _(no match)_

```json
{
  "success": true,
  "msg": "No matching face found",
  "data": []
}
```

**Error Responses**

| Status | Condition                                         | Body                                                     |
| ------ | ------------------------------------------------- | -------------------------------------------------------- |
| `400`  | No image provided                                 | `{ "success": false, "error": "image is not provided" }` |
| `500`  | AI service error or `AI_EXTRACT_FACE_URL` not set | `{ "success": false, "error": "Internal server error" }` |

**Example (cURL)**

```bash
curl -X POST http://localhost:3000/api/v1/attendances \
  -F "student_image=@./classroom_photo.jpg"
```

---

#### Get All Attendance Records

Retrieves all attendance records, sorted by newest first. Each record is populated with the student's `studentNo` and `fullName`.

|          |                           |
| -------- | ------------------------- |
| **URL**  | `GET /api/v1/attendances` |
| **Auth** | None                      |

**Response** `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "_id": "664f1a2b3c4d5e6f7a8b9c0e",
      "status": "Present",
      "createdAt": "2026-05-02T19:00:00.000Z",
      "student": {
        "studentNo": "123456789",
        "fullName": "John Doe"
      }
    }
  ]
}
```

**Example (cURL)**

```bash
curl http://localhost:3000/api/v1/attendances
```

---

#### Delete Attendance Record

Deletes a single attendance record by its `_id`.

|          |                                  |
| -------- | -------------------------------- |
| **URL**  | `DELETE /api/v1/attendances/:id` |
| **Auth** | None                             |

**Response** `204 No Content`

_(empty body)_

**Error Responses**

| Status | Condition            | Body                                                    |
| ------ | -------------------- | ------------------------------------------------------- |
| `404`  | Attendance not found | `{ "success": false, "error": "Attendance not found" }` |

**Example (cURL)**

```bash
curl -X DELETE http://localhost:3000/api/v1/attendances/664f1a2b3c4d5e6f7a8b9c0e
```
