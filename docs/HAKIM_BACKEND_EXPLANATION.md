# Hakim — Backend Auth & Student APIs: File-by-File Explanation

---

## 1. MODELS (Database Schemas)

### `backend/src/models/user.model.js` — User Schema

This file defines **who can log in**. Every user (admin or student) has a User document.

| Field | Type | Purpose |
|-------|------|---------|
| `email` | String | Login email, unique, lowercase, trimmed |
| `passwordHash` | String | Bcrypt-hashed password (never plain text) |
| `role` | String | Either `'admin'` or `'student'` (default: `'student'`) |
| `timestamps` | auto | Adds `createdAt` and `updatedAt` automatically |

**Key concept:** Students have TWO documents — a `User` (for login) and a `Student` (for profile). They are linked via `Student.userId → User._id`.

---

### `backend/src/models/student.model.js` — Student Schema

This file defines the **student profile** — everything about a student except their login credentials.

| Field | Type | Purpose |
|-------|------|---------|
| `userId` | ObjectId → User | Links to the User account for login |
| `name` | String | Full name, indexed for fast search |
| `email` | String | Unique, lowercase, trimmed |
| `phone` | String | Optional phone number |
| `rollNo` | String | Unique roll number (e.g., "001") |
| `batch` | String | Batch name string (e.g., "Batch 2026"), indexed |
| `teamId` | ObjectId → Team | Which team this student belongs to (null = unassigned) |
| `status` | String | `'active'` or `'inactive'` (default: `'active'`) |

**Key concept:** `batch` is a **string**, not an ObjectId. It matches the `Batch.name` field. This is a design choice — students are linked to batches by name.

---

### `backend/src/models/attendance.model.js` — Attendance Schema

This file tracks **one attendance record per student per day**.

| Field | Type | Purpose |
|-------|------|---------|
| `studentId` | ObjectId → Student | Which student |
| `date` | Date | Which day |
| `status` | String | `'present'` or `'absent'` |
| `markedBy` | ObjectId → User | Which admin recorded this |

**Key feature:** A compound unique index on `{ studentId, date }` prevents marking the same student twice on the same day. If you mark again, it **updates** (upsert).

---

### `backend/src/models/batch.model.js` — Batch Schema

This file represents a **bootcamp cohort** (e.g., "Batch 2026").

| Field | Type | Purpose |
|-------|------|---------|
| `name` | String | Unique batch name, indexed |
| `description` | String | Optional description |
| `startDate` | Date | When the batch started (for "Day X of 90" calculations) |
| `endDate` | Date | When the batch ends |
| `status` | String | `'active'`, `'inactive'`, or `'completed'` |

**Key concept:** Only one batch should be `'active'` at a time. The `student.service.js` looks up the active batch when creating students.

---

## 2. MIDDLEWARES

### `backend/src/middlewares/authenticate.js` — JWT Verification

**Workflow:**
1. Reads the `Authorization: Bearer <token>` header
2. If missing or wrong format → returns **401 Unauthorized**
3. Calls `jwt.verify(token, jwtSecret)` to decode the token
4. If valid → attaches `{ userId, role }` to `req.user` and calls `next()`
5. If expired → returns **401 "Token has expired"**
6. If invalid → returns **401 "Invalid token"**

**This middleware must run BEFORE any route that requires a logged-in user.**

---

### `backend/src/middlewares/authorize.js` — Role-Based Access Control

**Usage:** `authorize('admin')` or `authorize('admin', 'student')`

**Workflow:**
1. Checks if `req.user` exists (set by `authenticate` middleware)
2. If `req.user.role` is NOT in the allowed roles list → returns **403 Forbidden**
3. If allowed → calls `next()`

**Key concept:** This is a **higher-order function** — it returns a middleware function. It must always be used AFTER `authenticate`.

---

### `backend/src/middlewares/validate.js` — Input Validation

This is a **large file** containing all validation rules for every endpoint. It uses `express-validator`.

**How it works:**
- Each validator is an **array** of rules + a final `handleValidationErrors` function
- Rules check things like: is email valid? Is password 8+ chars? Is this a valid MongoDB ID?
- If any rule fails → returns **400** with an array of error messages
- If all pass → calls `next()`

**Validators relevant to your task:**

| Validator | Used For |
|-----------|----------|
| `validateLogin` | Login form: requires valid email + password |
| `validateChangePassword` | Change password: requires old password + new password (min 8) + confirm match |
| `validateResetStudentPassword` | Admin reset: requires studentId (MongoId) + new password (min 8) |
| `validateStudentCreate` | Create student: requires name, email, password |
| `validateStudentUpdate` | Update student: optional fields, validates MongoId param |
| `validateStudentId` | Any route with `:id` param: validates it's a MongoId |
| `validateStudentsQuery` | List students: validates search, batch, pagination params |
| `validateAttendanceMark` | Mark attendance: handles both single + bulk (array) with custom logic |
| `validateAttendanceUpdate` | Update attendance: requires valid ID + present/absent status |
| `validateAttendanceQuery` | Query attendance: validates date, batch, status, pagination |

---

## 3. SERVICES (Business Logic)

### `backend/src/services/auth.service.js` — Auth Logic

This file handles **everything related to authentication and user management**.

**Functions:**

| Function | What It Does |
|----------|-------------|
| `generateToken(user)` | Creates a JWT with `{ userId, role }`, expires per `jwtExpiresIn` config |
| `login(email, password, expectedRole)` | Finds user by email → bcrypt.compare password → checks role matches login form → returns token + user info |
| `getMe(userId)` | Returns current user info (excludes passwordHash) |
| `createUser({ email, passwordHash, role })` | Creates a new User document, checks for duplicate email |
| `findUserByEmail(email)` | Looks up user by email |
| `findUserById(id)` | Looks up user by ID (no passwordHash) |
| `updateUserPassword(userId, newPasswordHash)` | Directly updates password hash |
| `changePassword(userId, oldPassword, newPassword)` | Verifies old password first, then hashes + sets new one |
| `resetStudentPassword(studentId, newPassword)` | Admin resets: finds Student → finds linked User → hashes + sets new password (no old password needed) |

**Login workflow in detail:**
1. Find user by email (lowercase)
2. If not found → throw 401
3. `bcrypt.compare(plainPassword, user.passwordHash)` → if false → throw 401
4. If `expectedRole` is provided and doesn't match → throw 403 (prevents student logging into admin form)
5. Generate JWT token → return `{ token, user: { id, email, role } }`

---

### `backend/src/services/student.service.js` — Student CRUD Logic

This is the **largest service file** — handles all student operations.

**Functions:**

| Function | What It Does |
|----------|-------------|
| `generateEmail(name, session?)` | Auto-generates email: "Ahmed Khan" → "ahmedkhan01@lms.com". Increments number until unique |
| `getActiveBatchName()` | Finds the most recent active batch, falls back to "Batch 2026" |
| `createStudent(data)` | Creates both User + Student in a **transaction**. Default password: "student123" |
| `getStudents(filters, pagination)` | Lists students with search (name/rollNo prefix match), batch/team/status filters, pagination |
| `getStudentById(id)` | Gets one student with populated team |
| `updateStudent(id, data)` | Updates student + syncs User.email in a **transaction** |
| `deleteStudent(id)` | Removes from tasks, deletes Student + User + Attendance in a **transaction** |
| `getStudentAttendance(studentId)` | Gets all attendance records + summary (present/absent/percentage) |
| `findStudentByUserId(userId)` | Finds student by their User ID (used in student portal) |
| `bulkImportStudents(students)` | Imports from CSV: creates User + Student for each row in one **transaction** |
| `getNextRollNo()` | Calculates next roll number (finds max, adds 1, zero-pads to 3 digits) |

**Key design patterns:**
- **Transactions**: Create, update, and delete all use MongoDB sessions/transactions so User + Student stay in sync
- **Default password**: All new students get password "student123" (hashed with bcrypt)
- **Email auto-generation**: Strips non-alpha chars from name, joins, truncates to 10 chars, appends "01", "02", etc.

---

### `backend/src/services/attendance.service.js` — Attendance Logic

**Functions:**

| Function | What It Does |
|----------|-------------|
| `markAttendance({ studentId, date, status, markedBy })` | Upserts one record: finds existing for that student+date, updates or creates |
| `markAttendanceBulk(records)` | Maps over array, calls `markAttendance` logic for each (parallel with Promise.all) |
| `getAttendance(filters, pagination)` | **Two modes**: (1) If `date` provided → left-joins all active students with attendance for that day (shows unmarked students too). (2) If no date → returns students with their **most recent** attendance record |
| `updateAttendance(id, status)` | Updates a single attendance record's status |
| `getAttendanceSummary(batch)` | Aggregation pipeline: groups all attendance by student, calculates present/absent/total/percentage per student + overall stats |

**Key design patterns:**
- **Upsert**: `findOneAndUpdate` with `upsert: true` — if record exists for student+date, update it; otherwise create it
- **Left join approach**: When querying by date, it starts from ALL active students and left-joins attendance. This means students with NO attendance show up with `status: null` — useful for showing "not yet marked"
- **Aggregation pipelines**: Complex MongoDB aggregations for summary stats

---

## 4. CONTROLLERS (Request Handlers)

### `backend/src/controllers/auth.controller.js` — Auth Request Handlers

**Thin layer** — extracts data from `req`, calls service, sends response.

| Handler | Route | What It Does |
|---------|-------|-------------|
| `login` | POST /auth/login | Gets email/password/role from body → calls `authService.login()` → returns token |
| `getMe` | GET /auth/me | Gets userId from `req.user` (set by authenticate middleware) → returns user info |
| `logout` | POST /auth/logout | Just tells client to remove token (server doesn't track tokens) |
| `changePassword` | POST /auth/change-password | Gets oldPassword/password from body → calls `authService.changePassword()` |
| `resetStudentPassword` | POST /auth/reset-student-password | Gets studentId/newPassword from body → calls `authService.resetStudentPassword()` |

---

### `backend/src/controllers/student.controller.js` — Student Request Handlers

| Handler | Route | What It Does |
|---------|-------|-------------|
| `createStudent` | POST /students | Gets student data from body → calls service |
| `getStudents` | GET /students | Gets query params (search, batch, etc.) → calls service with filters + pagination |
| `getStudentById` | GET /students/:id | Gets ID from params → calls service |
| `updateStudent` | PUT /students/:id | Gets ID from params + data from body → calls service |
| `deleteStudent` | DELETE /students/:id | Gets ID from params → calls service |
| `getStudentAttendance` | GET /students/:id/attendance | Gets student ID → calls service to get attendance records |
| `bulkImportStudents` | POST /students/bulk-import | Reads CSV file from `req.file.buffer` → parses with `csv-parse/sync` → calls service |
| `getNextRollNo` | GET /students/utils/next-roll-no | Calls service to calculate next roll number |

---

### `backend/src/controllers/attendance.controller.js` — Attendance Request Handlers

| Handler | Route | What It Does |
|---------|-------|-------------|
| `markAttendance` | POST /attendance | Detects if body has `records` array (bulk) or single fields → calls appropriate service method. Attaches `req.user.userId` as `markedBy` |
| `getAttendance` | GET /attendance | Gets query params → calls service with filters + pagination |
| `updateAttendance` | PUT /attendance/:id | Gets ID + new status → calls service |
| `getAttendanceSummary` | GET /attendance/summary | Gets optional batch filter → calls aggregation service |

---

## 5. ROUTES (Endpoint Definitions)

### `backend/src/routes/auth.routes.js` — Auth Endpoints

```
POST   /auth/login                       → validateLogin → authController.login
GET    /auth/me                          → authenticate → authController.getMe
POST   /auth/logout                      → authenticate → authController.logout
POST   /auth/change-password             → authenticate → validateChangePassword → authController.changePassword
POST   /auth/reset-student-password      → authenticate → authorize('admin') → validateResetStudentPassword → authController.resetStudentPassword
```

**Middleware chain:** validation runs BEFORE controller (blocks bad input early).

---

### `backend/src/routes/student.routes.js` — Student Endpoints

```
router.use(authenticate, authorize('admin'))   ← ALL routes below are admin-only

POST   /students                       → validateStudentCreate → createStudent
GET    /students                       → validateStudentsQuery → getStudents
POST   /students/bulk-import           → multer(file) → bulkImportStudents
GET    /students/utils/next-roll-no     → getNextRollNo
GET    /students/:id                   → validateStudentId → getStudentById
PUT    /students/:id                   → validateStudentUpdate → updateStudent
DELETE /students/:id                   → validateStudentId → deleteStudent
GET    /students/:id/attendance        → validateStudentId → getStudentAttendance
```

**IMPORTANT — Route ordering:**
- `/bulk-import` and `/utils/next-roll-no` are **static routes** and MUST come before `/:id`
- If `/:id` came first, Express would treat "bulk-import" as an ID parameter
- `router.use(authenticate, authorize('admin'))` at the top protects ALL routes

---

### `backend/src/routes/attendance.routes.js` — Attendance Endpoints

```
router.use(authenticate, authorize('admin'))   ← ALL routes below are admin-only

POST   /attendance                     → validateAttendanceMark → markAttendance
GET    /attendance                     → validateAttendanceQuery → getAttendance
PUT    /attendance/:id                 → validateAttendanceUpdate → updateAttendance
GET    /attendance/summary             → validateAttendanceSummaryQuery → getAttendanceSummary
```

**Route ordering note:** `/summary` is a static route. In this file it comes AFTER `/:id`, which could be a problem — Express might try to match "summary" as an `:id` param. This is a potential bug to watch for.

---

## 6. OVERALL WORKFLOW SUMMARY

### Login Flow
```
Client → POST /auth/login { email, password, role }
       → validateLogin middleware (checks email format, password not empty)
       → authController.login()
       → authService.login()
           → User.findOne({ email })
           → bcrypt.compare(password, user.passwordHash)
           → checks role matches (admin can't login as student)
           → jwt.sign({ userId, role })
       → returns { token, user: { id, email, role } }
```

### Student Creation Flow
```
Admin → POST /students { name, email, phone, ... }
      → authenticate → authorize('admin')
      → validateStudentCreate
      → studentController.createStudent()
      → studentService.createStudent()
          → generateEmail(name) if no email provided
          → check duplicate email + rollNo
          → getActiveBatchName()
          → bcrypt.hash("student123")
          → MongoDB transaction:
              → User.create({ email, passwordHash, role: 'student' })
              → Student.create({ userId, name, email, ... })
          → commit transaction
      → returns { student, generatedPassword: "student123" }
```

### Attendance Marking Flow
```
Admin → POST /attendance { studentId, date, status }
      → authenticate → authorize('admin')
      → validateAttendanceMark
      → attendanceController.markAttendance()
          → attaches markedBy = req.user.userId
      → attendanceService.markAttendance()
          → Student.findById(studentId) — verify exists
          → normalize date to midnight
          → Attendance.findOneAndUpdate(
              { studentId, date },
              { status, markedBy },
              { upsert: true }   ← create or update
          )
      → returns attendance record
```

### Protected Route Pattern
Every protected endpoint follows this middleware chain:
```
authenticate (verifies JWT, sets req.user)
  → authorize('admin') (checks role)
    → validate* (checks input)
      → controller (extracts data, calls service)
        → service (business logic, database operations)
```
