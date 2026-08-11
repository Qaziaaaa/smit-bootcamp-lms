# My APIs — Complete Guide (Shafqatullah)

A single file with **all my APIs** (Day 2–4) and a plain explanation of **how each one works** on the server, plus request/response examples so you can test every one.

---

## Table of Contents
1. [How the Backend Works (in simple words)](#1-how-the-backend-works)
2. [Response Format](#2-response-format)
3. [Authentication (Login + Token)](#3-authentication)
4. [Student APIs — Day 2](#4-student-apis--day-2)
5. [Team APIs — Day 3](#5-team-apis--day-3)
6. [Project APIs — Day 3](#6-project-apis--day-3)
7. [Task APIs — Day 4](#7-task-apis--day-4)
8. [Dashboard API — Day 4](#8-dashboard-api--day-4)
9. [Student Progress API — Day 4](#9-student-progress-api--day-4)
10. [How to Know an API is Working](#10-how-to-know-an-api-is-working)

---

## 1. How the Backend Works

Every API request follows the same path:

```
Postman (request)
   ↓  URL + Method + Token + Body
Route (checks the URL)
   ↓
Validation (checks the input)
   ↓
authenticate + authorize (checks token + role)
   ↓
Controller (receives the request)
   ↓
Service (does the real work / business logic)
   ↓
Model (Mongoose) → MongoDB Atlas
   ↓
Response (JSON) back to Postman
```

- **Route** = the URL path (e.g. `/api/students`).
- **Validation** = express-validator checks the input (required fields, correct IDs, allowed status values).
- **authenticate** = verifies the JWT token (who is logged in).
- **authorize** = checks the role (admin or student).
- **Controller** = catches the request and sends back the response.
- **Service** = the brain — talks to the database, applies rules, throws errors if something is wrong.

---

## 2. Response Format

**Every API always answers in the same shape:**

```json
{
  "success": true,
  "data": { },
  "message": "Human readable message",
  "errors": []
}
```

- `"success": true` → the API worked.
- `"success": false` → something failed; read `message` and `errors`.

---

## 3. Authentication

All my APIs are protected — you **must** be logged in.

### How to log in
```
POST  /api/auth/login
Body:
{
  "email": "admin@lms.com",
  "password": "password123"
}
```
Response gives a **token**. Send it in the header:
```
Authorization: Bearer <token>
```
- Token missing / invalid → `401`
- Admin APIs + a student token → `403`

---

## 4. Student APIs — Day 2

### 4.1 `GET /api/students` — List students
**How it works:** The service asks MongoDB for all students, with optional filters and pagination, then returns them.
- Filters: `?search=ali&status=active&batch=2026&page=1&limit=10`
- Response: `200`, `{ students: [...], pagination: { total, pages } }`

### 4.2 `POST /api/students` — Create a student
**How it works:** The service:
1. Validates the input.
2. Hashes the password (bcrypt).
3. Creates a `User` account (role `student`) **and** a `Student` record **in one transaction** — if either fails, both are rolled back.
- Body:
```json
{
  "name": "Ali Khan",
  "email": "ali.khan@lms.com",
  "phone": "03001234567",
  "password": "secret123"
}
```
- Response: `201`, `"Student created successfully"`, returns the student with `_id`.

### 4.3 `GET /api/students/:id` — Get one student
**How it works:** The service finds the student by `_id` and also calculates an attendance summary (present/absent/percentage).
- Response: `200` with student + attendance summary. Wrong ID → `404`.

### 4.4 `PUT /api/students/:id` — Update a student
**How it works:** Updates only the whitelisted fields (name, phone, etc.). If the email changes, the linked `User` email is updated too.
- Body: `{ "name": "Ali Khan Updated" }`
- Response: `200`, `"Student updated successfully"`.

### 4.5 `DELETE /api/students/:id` — Delete a student
**How it works:** Deletes the student **and** cascades: removes their attendance records and their linked `User` account.
- Response: `200`, `"Student deleted successfully"`.

### 4.6 `GET /api/students/:id/attendance` — Attendance history
**How it works:** Finds all attendance records for the student, then computes present count, absent count and percentage.
- Response: `200`, `{ records: [...], summary: { present, absent, totalDays, percentage } }`.

---

## 5. Team APIs — Day 3

### 5.1 `POST /api/teams` — Create a team
**How it works:** Checks the name is unique, then saves the team.
- Body: `{ "name": "Team A" }`
- Response: `201`, `"Team created successfully"`.

### 5.2 `GET /api/teams` — List teams
**How it works:** Uses a MongoDB aggregation (`$lookup`) to count each team's members, and supports search.
- Filters: `?search=team`
- Response: `200`, `{ teams: [{ ..., memberCount }], pagination }`.

### 5.3 `POST /api/teams/:id/students` — Assign students
**How it works:** For every student ID, checks it exists, then sets the student's `teamId` to this team.
- Body: `{ "studentIds": ["<studentId1>", "<studentId2>"] }`
- Response: `200`, `"Students assigned to team successfully"`.

### 5.4 `GET /api/teams/:id` — Get one team
**How it works:** Loads the team, its members (students) and its linked project.
- Response: `200`, `{ team, members, project }`. Wrong ID → `404`.

### 5.5 `PUT /api/teams/:id` — Update a team
**How it works:** Updates the team name (checked for duplicates).
- Body: `{ "name": "Team A Renamed" }`
- Response: `200`.

### 5.6 `DELETE /api/teams/:id` — Delete a team
**How it works:** Removes the team and unlinks all its students (`teamId` set to null).
- Response: `200`, `"Team deleted successfully"`.

---

## 6. Project APIs — Day 3

### 6.1 `POST /api/projects` — Create a project
**How it works:** Validates input and saves the project.
- Body:
```json
{
  "title": "LMS Website",
  "description": "Bootcamp project",
  "status": "active"
}
```
- Response: `201`. Status values: `active`, `completed`, `on-hold`.

### 6.2 `GET /api/projects` — List projects
**How it works:** Returns projects with pagination and filters.
- Filters: `?status=active&search=lms`
- Response: `200`, `{ projects, pagination }`.

### 6.3 `GET /api/projects/:id` — Get one project
**How it works:** Loads the project, its team and its tasks.
- Response: `200`. Wrong ID → `404`.

### 6.4 `PUT /api/projects/:id` — Update a project
**How it works:** Updates allowed fields. Can also link a team via `teamId`.
- Body: `{ "status": "completed" }`
- Response: `200`.

### 6.5 `DELETE /api/projects/:id` — Delete a project
**How it works:** Deletes the project, **deletes all its tasks**, and unlinks the team (`teamId` set to null).
- Response: `200`, `"Project deleted successfully"`.

---

## 7. Task APIs — Day 4

### 7.1 `POST /api/tasks` — Create a task
**How it works:** The service first checks that the `projectId` belongs to a real project and (if given) `assignedTo` is a real student, then creates the task.
- Body:
```json
{
  "projectId": "<projectId>",
  "title": "Build login page",
  "description": "Create the login UI",
  "assignedTo": "<studentId>",
  "priority": "high",
  "status": "pending",
  "deadline": "2026-08-20"
}
```
- Response: `201`. Priority: `low`, `medium`, `high`. Status: `pending`, `in-progress`, `completed`.
- If the project/student does not exist → `404`.

### 7.2 `GET /api/tasks` — List tasks
**How it works:** Returns tasks with pagination and filters.
- Filters: `?projectId=...&status=pending&assignedTo=...&search=login`
- Response: `200`, `{ tasks, pagination }`.

### 7.3 `GET /api/tasks/:id` — Get one task
**How it works:** Loads the task and populates the project title and assigned student (name, email).
- Response: `200`. Wrong ID → `404`.

### 7.4 `PUT /api/tasks/:id` — Update a task
**How it works:** Updates allowed fields. If `projectId`/`assignedTo` change, it checks they exist.
- Body: `{ "status": "in-progress", "priority": "medium" }`
- Response: `200`.

### 7.5 `DELETE /api/tasks/:id` — Delete a task
**How it works:** Finds the task, deletes it, and returns success.
- Response: `200`, `"Task deleted successfully"`.

---

## 8. Dashboard API — Day 4

### 8.1 `GET /api/dashboard` — Stats for the admin dashboard
**How it works:** The service runs several count queries at the same time (Promise.all):
1. total students
2. total teams
3. total projects
4. total tasks
5. tasks split by status (pending / in-progress / completed)
6. today's attendance (present / absent)
7. latest 5 students
8. latest 5 tasks
- Response: `200`:
```json
{
  "counts": { "students": 2, "teams": 1, "projects": 1, "tasks": 3 },
  "taskStatus": { "pending": 1, "inProgress": 1, "completed": 1 },
  "todayAttendance": { "present": 5, "absent": 1 },
  "recentStudents": [],
  "recentTasks": []
}
```

---

## 9. Student Progress API — Day 4

### 9.1 `PUT /api/student/tasks/:id/progress` — Student updates own task
**How it works:** (student role only)
1. Finds the logged-in student (from the token).
2. Loads the task.
3. **Security rule:** if the task is not assigned to this student → `403`.
4. Updates the task status and saves.
- Body: `{ "status": "completed" }`
- Response: `200`, `"Task progress updated successfully"`.

---

## 10. How to Know an API is Working

| HTTP Code | Meaning | Is it working? |
|---|---|---|
| `200` / `201` | Success | ✅ Yes — check `"success": true` |
| `400` | Bad input (validation failed) | ❌ Fix the body / check `errors` |
| `401` | Missing/invalid/expired token | ❌ Log in again |
| `403` | Wrong role | ❌ Use the correct account (admin vs student) |
| `404` | Wrong URL or ID does not exist | ❌ Check the URL / ID |
| `500` | Server error | ❌ Bug — report to the team |

**Golden rule:** Every working API returns `"success": true`. If you ever see `"success": false`, the request did not complete — read the `message` and `errors` to know why.

---

## Fast Test Flow (5 minutes)

1. `POST /api/auth/login` (admin) → copy token
2. `POST /api/students` → save `studentId`
3. `POST /api/teams` → save `teamId`
4. `POST /api/teams/:teamId/students` `{ "studentIds": [studentId] }`
5. `POST /api/projects` → save `projectId`
6. `POST /api/tasks` (projectId + studentId) → save `taskId`
7. `GET /api/tasks/:taskId` → see project + student populated
8. `GET /api/dashboard` → see counts grow
9. Student login → `PUT /api/student/tasks/:taskId/progress` `{ "status": "completed" }`
10. All return `success: true` → ✅ everything works!
