# API Documentation

Base URL: `http://localhost:5000/api`

All endpoints return the standard envelope:

```json
{ "success": true, "data": {}, "message": "optional", "errors": [] }
```

Errors: `{ "success": false, "message": "...", "errors": [...] }`

## Authentication

All protected routes require header: `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Body | Description |
|---|---|---|---|---|
| POST | `/auth/login` | public | `{ email, password }` | Login; returns `{ token, user }` |
| POST | `/auth/logout` | any | – | Client-side token discard |
| GET | `/auth/me` | admin, student | – | Current user profile from token |

**Response (login):**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "user": { "id": "…", "email": "admin@lms.com", "role": "admin" }
  }
}
```

Error cases: 400 missing fields, 401 invalid credentials, 401 missing/invalid token (on protected routes).

## Admin Module (role: admin)

### Students

| Method | Endpoint | Body | Description |
|---|---|---|---|
| GET | `/students` | query: `search, batch, teamId, page, limit` | List + search/filter (paginated) |
| GET | `/students/:id` | – | Get one student with attendance summary |
| POST | `/students` | `{ name, email, password, phone?, batch?, teamId? }` | Create student (+ auth user) |
| PUT | `/students/:id` | any of the above | Update student |
| DELETE | `/students/:id` | – | Delete student |
| GET | `/students/:id/attendance` | – | Attendance history + percentage |

Error cases: 400 validation, 404 not found, 409 duplicate email.

### Attendance

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/attendance` | `{ studentId, date, status }` | Mark present/absent (upsert per day) |
| GET | `/attendance` | query: `date, batch, status, studentId` | Filter attendance records |
| PUT | `/attendance/:id` | `{ status }` | Edit a record |
| GET | `/attendance/summary` | query: `batch` | Aggregate percentages |

### Teams

| Method | Endpoint | Body | Description |
|---|---|---|---|
| GET | `/teams` | query: `search` | List teams (with member count) |
| GET | `/teams/:id` | – | Team with members + project |
| POST | `/teams` | `{ name }` | Create team |
| PUT | `/teams/:id` | `{ name }` | Update team |
| DELETE | `/teams/:id` | – | Delete team |
| POST | `/teams/:id/students` | `{ studentIds: [] }` | Assign students to team |

### Projects

| Method | Endpoint | Body | Description |
|---|---|---|---|
| GET | `/projects` | query: `status, search` | List projects |
| GET | `/projects/:id` | – | Project with team + tasks |
| POST | `/projects` | `{ title, description?, teamId?, deadline? }` | Create project |
| PUT | `/projects/:id` | any of the above | Update project |
| DELETE | `/projects/:id` | – | Delete project |

### Tasks

| Method | Endpoint | Body | Description |
|---|---|---|---|
| GET | `/tasks` | query: `projectId, status, assignedTo, search` | List tasks |
| GET | `/tasks/:id` | – | Get task |
| POST | `/tasks` | `{ projectId, title, description?, assignedTo?, priority?, deadline? }` | Create task |
| PUT | `/tasks/:id` | any of the above | Update task |
| DELETE | `/tasks/:id` | – | Delete task |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Counts: students, today's attendance, teams, tasks; recent activity |

## Student Module (role: student)

All student reads are scoped server-side to the logged-in student (row-level security).

| Method | Endpoint | Description |
|---|---|---|
| GET | `/student/profile` | Own profile |
| GET | `/student/attendance` | Own attendance history + percentage |
| GET | `/student/team` | Own team + project |
| GET | `/student/tasks` | Own tasks |
| PUT | `/student/tasks/:id/progress` | `{ status }` — update own task progress |

Student cannot reach any `/students`, `/teams`, `/projects`, `/attendance` (admin-only) endpoint — 403.

## Status Codes Summary

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Validation error / bad request |
| 401 | Unauthenticated / invalid token |
| 403 | Authenticated but forbidden (wrong role) |
| 404 | Resource not found |
| 409 | Duplicate (email, name) |
| 500 | Server error |

## Validation Rules

- `email`: valid email format, required, unique.
- `password`: min 8 chars, required on create.
- `date`: ISO `YYYY-MM-DD`.
- `status` (attendance): `present` | `absent`.
- `status` (task): `pending` | `in-progress` | `completed`.
- `role`: server derives role from the token — never accept `role` from the client.
