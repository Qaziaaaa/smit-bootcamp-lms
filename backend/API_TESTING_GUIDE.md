# Bootcamp LMS — API Testing Guide (Hakimullah's Modules)

Complete step-by-step guide to test every backend API in Postman (or Thunder Client).

---

## Table of Contents

1. [Setup](#1-setup)
2. [Postman Basics — GET / POST / PUT](#2-postman-basics)
3. [How to Confirm an API is Working](#3-how-to-confirm-an-api-is-working)
4. [Test Sequence (in order)](#4-test-sequence)
5. [All Endpoints Checklist](#5-all-endpoints-checklist)
6. [Security Tests](#6-security-tests)
7. [Error / Validation Tests](#7-error--validation-tests)
8. [Quick Troubleshooting](#8-quick-troubleshooting)

---

## 1. Setup

Run these commands in a terminal (PowerShell):

```powershell
cd "C:\Users\Hakimm Ullah\Desktop\Hakimullah LMS Project\Saylani-Bootcamp-LMS3\backend"
npm install
npm run seed
npm run dev
```

**Working check:** You should see:
```
MongoDB connected at ...
API server running at http://localhost:5000 (development)
```

Keep this terminal window open while testing.

---

## 2. Postman Basics

### How to open a request
1. Open Postman.
2. Click **New** (top left) → **HTTP Request**.
3. Choose the **method** from the dropdown (GET / POST / PUT / DELETE).
4. Type the **URL**.
5. Click **Send**.

### How to set a Body (for POST / PUT)
1. Click the **Body** tab (below the URL bar).
2. Select **raw** radio button.
3. Change the dropdown from `Text` to **JSON**.
4. Paste your JSON.
5. Click **Send**.

### How to set the Authorization header (Bearer token)
There are two ways:

**Way 1 — Authorization tab:**
1. Click the **Authorization** tab.
2. Type: `Bearer Token`.
3. Paste your JWT token in the "Token" box.

**Way 2 — Headers tab:**
1. Click the **Headers** tab.
2. Add row: Key = `Authorization`, Value = `Bearer <paste-token-here>`.
3. Click **Send**.

> **Tip:** After logging in, copy the token and store it as a variable. Edit your collection → Variables tab → add `token`. Then use `Bearer {{token}}` in every request.

---

## 3. How to Confirm an API is Working

### For a SUCCESS response
Check these three things:

1. **HTTP Status Code** (shown top-right, green = 2xx):
   - `200 OK`, `201 Created` = success.

2. **Body contains `"success": true`** — e.g.:
   ```json
   {
     "success": true,
     "data": { ... },
     "message": "...",
     "errors": []
   }
   ```

3. **The data looks correct** — the fields you sent are reflected back.

### For an ERROR response
- Red status code: `400`, `401`, `403`, `404`, `409`, `500`.
- Body contains `"success": false` and a `"message"`.

### Quick rule of thumb
| What you sent | Good result | Bad result |
|---|---|---|
| Valid POST with new data | `201` + `success: true` | `400` (invalid) or `409` (duplicate) |
| GET without token | `200` + data | `401` (missing token) |
| GET with student token on admin route | — | `403` (wrong role) |
| Wrong login password | — | `401` |
| Nonexistent ID | — | `404` |

---

## 4. Test Sequence (do in this order)

### STEP 1 — Health (GET, no auth)

- **URL:** `http://localhost:5000/api/health`
- **Method:** GET
- **Headers:** none

**Working if:** Status `200`, `"success": true`, `"status": "ok"`.

---

### STEP 2 — Admin Login (POST, no auth)

- **URL:** `http://localhost:5000/api/auth/login`
- **Method:** POST
- **Body (raw → JSON):**
  ```json
  {
    "email": "admin@lms.com",
    "password": "password123"
  }
  ```

**Working if:** Status `200`, `"success": true`, and `data.token` is a long JWT string.

**Action:** Copy `data.token` → use as Bearer token for all Admin APIs below.

---

### STEP 3 — Get Current User (GET, admin token)

- **URL:** `http://localhost:5000/api/auth/me`
- **Method:** GET
- **Auth:** Bearer token

**Working if:** `"role": "admin"` and email is `admin@lms.com`. No `passwordHash` shown.

---

### STEP 4 — Create Student (POST, admin token)

- **URL:** `http://localhost:5000/api/students`
- **Method:** POST
- **Auth:** Bearer token
- **Body (raw → JSON):**
  ```json
  {
    "name": "Ali Khan",
    "email": "ali@example.com",
    "password": "password123",
    "phone": "03000000000",
    "batch": "SMIT-Bootcamp-LMS3"
  }
  ```

**Working if:** Status `201`, `"success": true`, response contains the new student `_id`. **Save this `_id`** — you need it for later tests.

Create a second student too:
```json
{
  "name": "Sara Ahmed",
  "email": "sara@example.com",
  "password": "password123",
  "phone": "03111112222",
  "batch": "SMIT-Bootcamp-LMS3"
}
```

---

### STEP 5 — List Students (GET, admin token)

- **URL:** `http://localhost:5000/api/students`
- **Method:** GET

**Working if:** `data.students` array contains Ali and Sara, and `pagination.total` = 2.

---

### STEP 6 — Search / Filter / Pagination (GET, admin token)

- **URL:** `http://localhost:5000/api/students?search=Ali`
- **URL:** `http://localhost:5000/api/students?batch=SMIT-Bootcamp-LMS3`
- **URL:** `http://localhost:5000/api/students?page=1&limit=1`

**Working if:** Search returns only Ali; batch filter returns both; page with `limit=1` returns 1 student + `pagination.pages` = 2.

---

### STEP 7 — Get One Student (GET, admin token)

- **URL:** `http://localhost:5000/api/students/REPLACE_WITH_STUDENT_ID`
- **Method:** GET

**Working if:** Returns that student's full record. Try a fake ID → expect `404`.

---

### STEP 8 — Update Student (PUT, admin token)

- **URL:** `http://localhost:5000/api/students/REPLACE_WITH_STUDENT_ID`
- **Method:** PUT
- **Body (raw → JSON):**
  ```json
  {
    "phone": "03221112233",
    "batch": "SMIT-Bootcamp-LMS3"
  }
  ```

**Working if:** Status `200`, response shows the new phone number.

---

### STEP 9 — Mark Attendance Present (POST, admin token)

- **URL:** `http://localhost:5000/api/attendance`
- **Method:** POST
- **Body (raw → JSON):**
  ```json
  {
    "studentId": "REPLACE_WITH_STUDENT_ID",
    "date": "2026-08-08",
    "status": "present"
  }
  ```

**Working if:** Status `200`, `data.status` = `present`, `data._id` returned.

---

### STEP 10 — Mark Same Day Absent (POST again — UPSERT test)

- **URL:** `http://localhost:5000/api/attendance`
- **Method:** POST
- **Body (raw → JSON):**
  ```json
  {
    "studentId": "REPLACE_WITH_STUDENT_ID",
    "date": "2026-08-08",
    "status": "absent"
  }
  ```

**Working if:** Status `200` AND the returned `_id` is the **SAME** as Step 9 (it updated, not duplicated). This proves one-record-per-student-per-day works.

Mark Sara present too (for summary tests):
```json
{
  "studentId": "REPLACE_WITH_SARA_ID",
  "date": "2026-08-08",
  "status": "present"
}
```

---

### STEP 11 — List Attendance (GET, admin token)

- **URL:** `http://localhost:5000/api/attendance`
- **Method:** GET

**Working if:** Returns both attendance records.

### STEP 12 — Attendance Filters (GET)

- **URL:** `http://localhost:5000/api/attendance?date=2026-08-08`
- **URL:** `http://localhost:5000/api/attendance?status=present`
- **URL:** `http://localhost:5000/api/attendance?status=absent`
- **URL:** `http://localhost:5000/api/attendance?batch=SMIT-Bootcamp-LMS3`
- **URL:** `http://localhost:5000/api/attendance?studentId=REPLACE_WITH_STUDENT_ID`

**Working if:** Each returns only matching records.

---

### STEP 13 — Edit Attendance (PUT, admin token)

- **URL:** `http://localhost:5000/api/attendance/REPLACE_WITH_ATTENDANCE_ID`
- **Method:** PUT
- **Body (raw → JSON):**
  ```json
  { "status": "present" }
  ```
*(Get an attendance `_id` from Step 11 response.)*

**Working if:** Status `200`, status updated to `present`.

---

### STEP 14 — Attendance Summary (GET, admin token)

- **URL:** `http://localhost:5000/api/attendance/summary`
- **URL:** `http://localhost:5000/api/attendance/summary?batch=SMIT-Bootcamp-LMS3`
- **Method:** GET

**Working if:** `data.students` shows per-student `present`, `absent`, `totalDays`, `percentage` and `data.overall` totals. Percentage = present/total × 100.

---

### STEP 15 — Student Attendance History (GET, admin token)

- **URL:** `http://localhost:5000/api/students/REPLACE_WITH_STUDENT_ID/attendance`
- **Method:** GET

**Working if:** Returns `records`, `summary.present`, `summary.absent`, `summary.totalDays`, `summary.percentage`.

---

### STEP 16 — Student Login (POST, no auth)

- **URL:** `http://localhost:5000/api/auth/login`
- **Body (raw → JSON):**
  ```json
  {
    "email": "ali@example.com",
    "password": "password123"
  }
  ```

**Working if:** `200` + `data.user.role` = `"student"`. **Save this token** — use for Student Portal tests.

---

### STEP 17 — Student Profile (GET, student token)

- **URL:** `http://localhost:5000/api/student/profile`
- **Method:** GET

**Working if:** Returns Ali's own profile (name/email/batch). No `passwordHash`.

### STEP 18 — Student Attendance (GET, student token)

- **URL:** `http://localhost:5000/api/student/attendance`
- **Method:** GET

**Working if:** Returns only Ali's attendance + summary.

### STEP 19 — Student Team (GET, student token)

- **URL:** `http://localhost:5000/api/student/team`
- **Method:** GET

**Working if:** `200`. Returns `null` if no team assigned yet (expected until Teams module adds one).

### STEP 20 — Student Tasks (GET, student token)

- **URL:** `http://localhost:5000/api/student/tasks`
- **Method:** GET

**Working if:** `200` and `data` is an array (empty `[]` until Tasks module adds tasks).

---

### STEP 21 — Logout (POST, any token)

- **URL:** `http://localhost:5000/api/auth/logout`
- **Method:** POST
- **Auth:** Bearer token

**Working if:** `200` + `"message": "Logged out successfully..."`. (JWT logout is client-side — just delete the token.)

---

## 5. All Endpoints Checklist

| # | Method | URL | Auth | Tested (✓) |
|---|--------|-----|------|------------|
| 1 | GET | `/api/health` | none | |
| 2 | POST | `/api/auth/login` | none | |
| 3 | GET | `/api/auth/me` | Bearer | |
| 4 | POST | `/api/auth/logout` | Bearer | |
| 5 | POST | `/api/students` | Bearer + admin | |
| 6 | GET | `/api/students` | Bearer + admin | |
| 7 | GET | `/api/students/:id` | Bearer + admin | |
| 8 | PUT | `/api/students/:id` | Bearer + admin | |
| 9 | DELETE | `/api/students/:id` | Bearer + admin | |
| 10 | GET | `/api/students/:id/attendance` | Bearer + admin | |
| 11 | POST | `/api/attendance` | Bearer + admin | |
| 12 | GET | `/api/attendance` | Bearer + admin | |
| 13 | PUT | `/api/attendance/:id` | Bearer + admin | |
| 14 | GET | `/api/attendance/summary` | Bearer + admin | |
| 15 | GET | `/api/student/profile` | Bearer + student | |
| 16 | GET | `/api/student/attendance` | Bearer + student | |
| 17 | GET | `/api/student/team` | Bearer + student | |
| 18 | GET | `/api/student/tasks` | Bearer + student | |

---

## 6. Security Tests

**With the STUDENT token active:**

| Test | URL | Expected |
|------|-----|----------|
| Student hits admin list | `GET /api/students` | **403** `"success": false` |
| Student hits attendance | `GET /api/attendance` | **403** |
| Student marks attendance | `POST /api/attendance` | **403** |
| Student deletes student | `DELETE /api/students/:id` | **403** |

**With the ADMIN token active:**

| Test | URL | Expected |
|------|-----|----------|
| Admin hits student portal | `GET /api/student/profile` | **403** |

**With NO token:**

| Test | URL | Expected |
|------|-----|----------|
| No token on admin route | `GET /api/students` | **401** |
| No token on `/me` | `GET /api/auth/me` | **401** |
| No token on student route | `GET /api/student/profile` | **401** |
| Garbage token | `GET /api/auth/me` with `Bearer abc123` | **401** |

---

## 7. Error / Validation Tests

| Test | Request Body / URL | Expected |
|------|-------------------|----------|
| Wrong password | POST `/api/auth/login` → `{"email":"admin@lms.com","password":"wrong"}` | 401 |
| Unknown email | POST `/api/auth/login` → `{"email":"ghost@x.com","password":"password123"}` | 401 |
| Missing password | POST `/api/auth/login` → `{"email":"admin@lms.com"}` | 400 |
| Invalid email format | POST `/api/auth/login` → `{"email":"not-an-email","password":"x"}` | 400 |
| Bad student ID | GET `/api/students/123` | 400 |
| Nonexistent student | GET `/api/students/000000000000000000000000` | 404 |
| Duplicate email | POST `/api/students` with existing `ali@example.com` | 409 |
| Short password | POST `/api/students` → `"password":"123"` | 400 |
| Missing name | POST `/api/students` without `name` | 400 |
| Invalid date | POST `/api/attendance` → `"date":"not-a-date"` | 400 |
| Invalid status | POST `/api/attendance` → `"status":"late"` | 400 |
| Missing status | PUT `/api/attendance/:id` → `{}` | 400 |
| Update unknown student | PUT `/api/students/000000000000000000000000` | 404 |
| Delete unknown student | DELETE `/api/students/000000000000000000000000` | 404 |

---

## 8. Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| `Cannot connect to localhost:5000` | Server not running. Run `npm run dev` and keep terminal open. |
| `ECONNREFUSED ... mongodb.net` | No internet / Atlas blocked. Check network, or use `MONGO_URI=mongodb://127.0.0.1:27017/lms` with local MongoDB. |
| Always getting `401` | Token missing/expired/wrong. Re-login and copy fresh token. |
| Always getting `403` | Using admin token on student route (or vice-versa). Use the correct role's token. |
| `404 Route not found` | URL typo. Endpoints are under `/api/` (e.g., `/api/students`, not `/students`). |
| Duplicate email `409` | That email already exists. Use a new email. |
