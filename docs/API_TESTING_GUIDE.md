# API Testing Guide — Shafqatullah's APIs

All the APIs built by Shafqatullah (Day 2 to Day 4), with step-by-step instructions to test them in **Postman** and how to confirm each one is working.

---

## 0. Before You Start

### 1. Start the backend server
Open a terminal inside the `backend` folder and run:
```
npm start
```
You should see:
```
[INFO] MongoDB connected at ...mongodb.net
[INFO] API server running at http://localhost:5000 (development)
```
The server is now ready at: **http://localhost:5000**

### 2. Log in and get a token (REQUIRED for every API)
Every API is protected by JWT. Without a token you get `401`.

In Postman:
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/auth/login`
- **Body (JSON):**
```json
{
  "email": "admin@lms.com",
  "password": "password123"
}
```
- **Send**

**Success response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": "...", "email": "admin@lms.com", "role": "admin" }
  },
  "message": "Login successful",
  "errors": []
}
```

### 3. Add the token to Postman
1. Copy the `token` value.
2. Click the **Authorization** tab (below the URL bar).
3. Type **Bearer Token** in the "Type" dropdown.
4. Paste the token in the field.

Now every request you send will include the token automatically.

> If you get `401` on any API below, your token is missing/expired — log in again.

---

## 1. How to Read the API List

Each API below is written like this:

```
METHOD  /endpoint      ← what to type in Postman
Body (if any)          ← what to paste in the Body tab (raw → JSON)
Expected response      ← what proves the API works
```

---

## 2. Student APIs (Day 2)

### 2.1 List Students
```
GET  http://localhost:5000/api/students
```
- No body needed.
- **Works if:** you get `200` and a response like:
```json
{
  "success": true,
  "data": {
    "students": [],
    "pagination": { "page": 1, "limit": 10, "total": 0, "pages": 0 }
  },
  "message": "Students retrieved successfully"
}
```
- **Optional filters** (add to URL with `?`):
  - `?search=ali` — search by name/email
  - `?status=active`
  - `?page=1&limit=5` — pagination

### 2.2 Create a Student
```
POST  http://localhost:5000/api/students
```
- **Body (JSON):**
```json
{
  "name": "Ali Khan",
  "email": "ali.khan@lms.com",
  "phone": "03001234567",
  "password": "secret123"
}
```
- **Works if:** you get `201` with `"message": "Student created successfully"` and the student data (with `_id`) is returned.

### 2.3 Get Student by ID
```
GET  http://localhost:5000/api/students/6a7b...studentId
```
- Replace the ID with the `_id` you got from step 2.2.
- **Works if:** `200` and the student data is returned.

### 2.4 Update a Student
```
PUT  http://localhost:5000/api/students/6a7b...studentId
```
- **Body (JSON):**
```json
{
  "name": "Ali Khan Updated"
}
```
- **Works if:** `200` with `"message": "Student updated successfully"` and the updated name is in the response.

### 2.5 Delete a Student
```
DELETE  http://localhost:5000/api/students/6a7b...studentId
```
- No body.
- **Works if:** `200` with `"message": "Student deleted successfully"`.

### 2.6 Student Attendance
```
GET  http://localhost:5000/api/students/6a7b...studentId/attendance
```
- No body.
- **Works if:** `200` with attendance records and a summary (present/absent/percentage).

---

## 3. Team APIs (Day 3)

### 3.1 Create a Team
```
POST  http://localhost:5000/api/teams
```
- **Body (JSON):**
```json
{
  "name": "Team A"
}
```
- **Works if:** `201`, message `"Team created successfully"`, and the team has an `_id`. **Save this `_id`** — you need it below.

### 3.2 List Teams
```
GET  http://localhost:5000/api/teams
```
- No body.
- **Works if:** `200` and the response contains `teams` with `memberCount` (how many students are in each team).

### 3.3 Assign Students to a Team
```
POST  http://localhost:5000/api/teams/6a7b...teamId/students
```
- **Body (JSON):**
```json
{
  "studentIds": ["6a7b...studentId1", "6a7b...studentId2"]
}
```
- **Works if:** `200` with `"message": "Students assigned to team successfully"`.

### 3.4 Get Team by ID
```
GET  http://localhost:5000/api/teams/6a7b...teamId
```
- **Works if:** `200` with team + its members + project.

### 3.5 Update a Team
```
PUT  http://localhost:5000/api/teams/6a7b...teamId
```
- **Body (JSON):**
```json
{
  "name": "Team A Renamed"
}
```
- **Works if:** `200` and the new name is returned.

### 3.6 Delete a Team
```
DELETE  http://localhost:5000/api/teams/6a7b...teamId
```
- **Works if:** `200` with `"message": "Team deleted successfully"`.

---

## 4. Project APIs (Day 3)

### 4.1 Create a Project
```
POST  http://localhost:5000/api/projects
```
- **Body (JSON):**
```json
{
  "title": "LMS Website",
  "description": "Bootcamp project",
  "status": "active"
}
```
- **Works if:** `201`, `"Project created successfully"`, and an `_id` is returned. **Save the `_id`.**

### 4.2 List Projects
```
GET  http://localhost:5000/api/projects
```
- No body.
- **Works if:** `200` with `projects` + pagination.
- **Filters:** `?status=active`, `?search=lms`

### 4.3 Get Project by ID
```
GET  http://localhost:5000/api/projects/6a7b...projectId
```
- **Works if:** `200` with the project + its team + tasks.

### 4.4 Update a Project
```
PUT  http://localhost:5000/api/projects/6a7b...projectId
```
- **Body (JSON):**
```json
{
  "status": "completed"
}
```
- **Works if:** `200` and the new status is returned.

### 4.5 Delete a Project
```
DELETE  http://localhost:5000/api/projects/6a7b...projectId
```
- **Works if:** `200` with `"Project deleted successfully"`.

---

## 5. Task APIs (Day 4)

### 5.1 Create a Task
```
POST  http://localhost:5000/api/tasks
```
- **Body (JSON):**
```json
{
  "projectId": "6a7b...projectId",
  "title": "Build login page",
  "description": "Create the login UI",
  "assignedTo": "6a7b...studentId",
  "priority": "high",
  "status": "pending",
  "deadline": "2026-08-20"
}
```
- **Works if:** `201`, `"Task created successfully"`, and an `_id` is returned. **Save the `_id`.**
- `projectId` must belong to a real project, and `assignedTo` to a real student — otherwise you get `404`.

### 5.2 List Tasks (with filters)
```
GET  http://localhost:5000/api/tasks
```
- No body.
- **Works if:** `200` with `tasks` + pagination.
- **Filters (example):** `?status=pending&assignedTo=6a7b...studentId`

### 5.3 Get Task by ID
```
GET  http://localhost:5000/api/tasks/6a7b...taskId
```
- **Works if:** `200` with the task + project title + assigned student name.

### 5.4 Update a Task
```
PUT  http://localhost:5000/api/tasks/6a7b...taskId
```
- **Body (JSON):**
```json
{
  "status": "in-progress",
  "priority": "medium"
}
```
- **Works if:** `200` and the new values are returned.

### 5.5 Delete a Task
```
DELETE  http://localhost:5000/api/tasks/6a7b...taskId
```
- **Works if:** `200` with `"Task deleted successfully"`.

---

## 6. Dashboard API (Day 4)

### 6.1 Get Dashboard Stats
```
GET  http://localhost:5000/api/dashboard
```
- No body.
- **Works if:** `200` and the response has counts:
```json
{
  "success": true,
  "data": {
    "counts": { "students": 2, "teams": 1, "projects": 1, "tasks": 3 },
    "taskStatus": { "pending": 1, "inProgress": 1, "completed": 1 },
    "todayAttendance": { "present": 5, "absent": 1 },
    "recentStudents": [],
    "recentTasks": []
  },
  "message": "Dashboard stats retrieved successfully"
}
```

---

## 7. Student Progress API (Day 4)

This API is used by a **student** (not admin). You need a student token.

### 7.1 Create a student account (as admin) — already done above
### 7.2 Log in as that student
```
POST  http://localhost:5000/api/auth/login
```
- **Body:**
```json
{
  "email": "ali.khan@lms.com",
  "password": "secret123"
}
```
- Copy the new token and replace it in the Authorization tab.

### 7.3 See your own tasks
```
GET  http://localhost:5000/api/student/tasks
```
- **Works if:** `200` with only the tasks assigned to this student.

### 7.4 Update your task progress
```
PUT  http://localhost:5000/api/student/tasks/6a7b...taskId/progress
```
- **Body (JSON):**
```json
{
  "status": "completed"
}
```
- **Works if:** `200` with `"Task progress updated successfully"` and the new status.
- Allowed statuses: `pending`, `in-progress`, `completed`.

> If the task is NOT assigned to this student, you get `403` (correct behaviour).
> If you log in as **admin** and call this, you get `403` (students only).

---

## 8. How to Confirm an API is Working (Quick Rules)

| What you see | Meaning |
|---|---|
| HTTP `200` or `201` | ✅ API worked. Check `"success": true` |
| HTTP `400` | ❌ Bad input — validation failed. Read the `errors` array |
| HTTP `401` | ❌ No token / invalid or expired token |
| HTTP `403` | ❌ Wrong role (e.g. student tried an admin API) |
| HTTP `404` | ❌ Wrong URL, or the ID does not exist |
| HTTP `500` | ❌ Server error — tell Shafqatullah immediately |

**Every success response always has this shape:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Some message",
  "errors": []
}
```
If `"success": false`, the API did **not** work — read `message` and `errors`.

---

## 9. Recommended Test Order (full flow in 10 minutes)

1. Login as admin → get token
2. `POST /students` → save student `_id`
3. `POST /teams` → save team `_id`
4. `POST /teams/:id/students` with your student `_id`
5. `POST /projects` → save project `_id`
6. `POST /tasks` with project `_id` + student `_id` → save task `_id`
7. `GET /tasks/:id` → see populated project + student
8. `PUT /tasks/:id` → change status
9. `GET /dashboard` → see the counts increase
10. Login as the student → `PUT /student/tasks/:id/progress` → set completed

If steps 2–10 all return `200/201` with `"success": true`, **every API is working.**
