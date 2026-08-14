# Database Schema

Database: MongoDB (Mongoose ODM). Collection names are plural lowercase. Field names are `camelCase`. All references use `ObjectId`.

## ER Overview

```
users ────────────────┐
  │ role: 'admin'     │
  │                   │
students ─────────────┤  (students extend users via role)
  │                   │
  ├── teamId ───────▶ teams ──┬── projectId ──▶ projects
  │                           │                  │
  └── studentId ────┐         │                  ├── teamId ──▶ (back-reference)
                     ▼         ▼                  ▼
                 attendance   tasks ─────────────┘ (projectId)
                 (per student, per day)
```

Relationships:
- `students.teamId` → `teams._id` (one team has many students)
- `teams.projectId` → `projects._id` (one project per team)
- `attendance.studentId` → `students._id`
- `tasks.projectId` → `projects._id`; `tasks.assignedTo` → `students._id`

## Collections

### users

Single collection with `role` discriminator for admin/student authentication.

```js
{
  _id: ObjectId,
  email: String,          // unique, required, indexed
  passwordHash: String,   // bcryptjs, required
  role: String,           // 'admin' | 'student'
  createdAt: Date,
  updatedAt: Date
}
```

Indexes: `email` (unique).

### students

```js
{
  _id: ObjectId,
  userId: ObjectId,       // ref users
  name: String,           // required
  email: String,          // unique, required, indexed
  rollNo: String,         // unique, required (e.g. 'WM-1002' or computed fallback 'STU-XXXX')
  phone: String,
  batch: String,          // e.g. 'SMIT-Bootcamp-LMS3'
  teamId: ObjectId,       // ref teams (nullable until assigned)
  status: String,         // 'active' | 'inactive'
  createdAt: Date,
  updatedAt: Date
}
```

Indexes: `email` (unique), `rollNo` (unique), `batch`, `teamId`, `name`.

### attendance

```js
{
  _id: ObjectId,
  studentId: ObjectId,    // ref students, required
  date: Date,             // required, indexed
  status: String,         // 'present' | 'absent', required
  markedBy: ObjectId,     // ref users (admin who marked)
  createdAt: Date,
  updatedAt: Date
}
```

Indexes: composite `{ studentId: 1, date: 1 }` (unique) — one record per student per day.

### teams

```js
{
  _id: ObjectId,
  name: String,           // required, unique
  projectId: ObjectId,    // ref projects (nullable until assigned)
  createdAt: Date,
  updatedAt: Date
}
```

Indexes: `name` (unique).

### projects

```js
{
  _id: ObjectId,
  title: String,          // required
  description: String,
  teamId: ObjectId,       // ref teams
  status: String,         // 'active' | 'completed' | 'on-hold'
  deadline: Date,
  createdAt: Date,
  updatedAt: Date
}
```

Indexes: `status`, `teamId`.

### tasks

```js
{
  _id: ObjectId,
  projectId: ObjectId,    // ref projects, required
  assignedTo: ObjectId,   // ref students (nullable — team task)
  title: String,          // required
  description: String,
  status: String,         // 'pending' | 'in-progress' | 'completed', default 'pending'
  priority: String,       // 'low' | 'medium' | 'high'
  deadline: Date,
  createdAt: Date,
  updatedAt: Date
}
```

Indexes: `projectId`, `assignedTo`, `status`.

## Design Rules

- No duplicate nested data — always reference by `ObjectId`.
- Deleting a team/project must handle dependent students/tasks (decide: block delete or null the reference — confirm in review).
- Attendance uniqueness enforced via the `{ studentId, date }` unique index.
- All timestamps auto-managed via Mongoose `timestamps: true`.
