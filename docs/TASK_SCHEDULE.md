# Task Schedule (Aug 7 – Aug 12)

Deadline: **Wed Aug 12**. 6 working days. Every member follows the Git Workflow: work on own branch → commit → push → PR (base `dev`, reviewer: lead) → lead merges.

Each day ends with a 15-minute standup: done / next / blockers.

---

## Legend

- 🚧 = in-progress milestone to reach by end of day
- ✅ = deliverable (must be mergeable to `dev` by end of day)
- All members: pull latest `dev` at start of each day, resolve conflicts, keep own branch synced.

---

## Day 1 — Fri Aug 7 · Setup & Scaffolding

**Goal:** every machine runs the project; backend and frontend skeletons exist; DB connected; shared components ready.

### Hakimullah (Backend)
- [x] Follow SETUP_GUIDE.md — Node, MongoDB, `.env`
- [x] Create `backend/` scaffold: `src/config/`, `src/server.js`
- [x] Connect MongoDB (mongoose), handle connection errors
- [x] `/api/health` endpoint → `{ success: true }`
- [x] `express-validator`, `helmet`, `morgan`, `cors` wired in
- [x] ✅ PR: backend skeleton + health endpoint

### Shafqat ullah (Backend)
- [x] Create all Mongoose models per DATABASE_SCHEMA.md:
  - [x] `users` (email unique, role, passwordHash)
  - [x] `students`
  - [x] `attendance`
  - [x] `teams`
  - [x] `projects`
  - [x] `tasks`
- [x] Global error-handling middleware + standard response envelope
- [x] Indexes on email, `{ studentId, date }`, foreign keys
- [x] ✅ PR: models + error handler

### Abdullah (Frontend)
- [x] Create `frontend/` (Vite), install axios + react-router-dom + MUI stack
- [x] Router with all 15 routes from FRONTEND_DESIGN.md §2
- [x] `ProtectedRoute` (admin + student roles)
- [x] Auth context (token store, login/logout state)
- [x] Admin shell layout (sidebar 240px + topbar + content)
- [x] ✅ PR: frontend scaffold + routing + shell

### Shahzad (Frontend)
- [x] Shared component library per FRONTEND_DESIGN.md §3:
  - [x] `DataTable`, `SearchBar`, `FilterBar`, `Pagination`
  - [x] `Modal`, `ConfirmDialog`, `FormField`
  - [x] `Badge`, `Avatar`, `StatCard`
  - [x] `LoadingState`, `EmptyState`, `ErrorState`, `Toast`
- [x] ✅ PR: shared components
- **⚠️ BLOCKER:** imports `@tanstack/react-table` (DataTable), `sonner` (Toast), `react-hook-form` + `zod` (FormField) — **not in `package.json` / `node_modules`**. Frontend cannot build until installed.

### Team Lead
- [ ] Verify every member completed SETUP_GUIDE (running apps)
- [ ] Create GitHub milestone "Aug 12 release"
- [ ] Review + merge all 4 day-1 PRs into `dev`
- [ ] Run app locally; confirm nothing broken
- [ ] Evening: 15-min standup

---

## Day 2 — Sat Aug 8 · Phase 2 Foundation

**Goal:** secure login works end-to-end; admin sees dashboard layout.

### Hakimullah (Backend)
- [x] Auth APIs: `POST /auth/login`, `GET /auth/me`
- [x] JWT sign/verify middleware + role guard
- [x] bcryptjs hashing, express-validator on login
- [x] Seed an admin user for testing
- [x] ✅ PR: auth API (#72)
- [x] Student CRUD APIs (`GET/POST/PUT/DELETE /students`)
- [x] Pagination + `search/batch/teamId` filters
- [x] `GET /students/:id` + `GET /students/:id/attendance`
- [x] ✅ PR: student APIs (#47)

### Shafqatullah (Backend)
- [x] Assist Hakimullah with student API testing / input validation

### Abdullah (Frontend)
- [x] Login page (FRONTEND_DESIGN.md §4.1)
- [x] Wire auth context → login → redirect by role
- [x] 401/403 handling + redirect to `/login`
- [x] Admin dashboard layout with StatCards
- [x] ✅ PR: login + dashboard shell (#34)

### Shahzad (Frontend)
- [x] Students list page: SearchBar, FilterBar, DataTable, Pagination
- [x] Student form modal (create/edit) with validation display
- [x] ✅ PR: students module UI (against mock/API contract)
- **⚠️ BLOCKER:** page uses mock data + missing deps (see Day 1). Route `/students` wired via PR #83.

### Team Lead
- [ ] Review auth security (JWT, hashing, validation)
- [ ] Protect `dev`: members push only via PR
- [ ] Merge all day-2 PRs
- [ ] Standup

---

## Day 3 — Sun Aug 9 · Core Modules I

**Goal:** students + attendance fully working (API + UI).

### Hakimullah (Backend)
- [x] Attendance APIs: `POST /attendance`, `GET /attendance`, `PUT /attendance/:id`
- [x] Attendance upsert per `{ studentId, date }`
- [x] `GET /attendance/summary` (percentages by batch)
- [x] ✅ PR: attendance APIs (#72)

### Shafqatullah (Backend)
- [x] Team APIs: CRUD + `POST /teams/:id/students`
- [x] Project APIs: CRUD
- [x] ✅ PR: team + project APIs (#58)

### Abdullah (Frontend)
- [x] Admin Dashboard wired to `GET /dashboard`
- [x] ✅ PR: live dashboard (#94)

### Shahzad (Frontend)
- [x] Attendance page: date/batch/status filters + mark present/absent toggle
- [x] Teams list + team detail + assign-students picker
- [x] ✅ PR: attendance + teams UI
- **⚠️ BLOCKER:** mock data + missing deps (see Day 1). Routes `/attendance`, `/teams`, `/teams/:id` wired via PR #83.

### Team Lead
- [ ] Verify API contract matches FRONTEND_DESIGN.md for attendance/teams
- [ ] Merge day-3 PRs
- [ ] Standup

---

## Day 4 — Mon Aug 10 · Core Modules II + Student Portal

**Goal:** projects/tasks done; student portal reads real data.

### Hakimullah (Backend)
- [x] Student-scoped endpoints: `/student/profile`, `/student/attendance`, `/student/team`, `/student/tasks`
- [x] Row-level security: queries scoped to logged-in student
- [x] ✅ PR: student portal APIs (#72)

### Shafqatullah (Backend)
- [x] Task APIs: CRUD + filters (`projectId/status/assignedTo/search`)
- [x] `GET /dashboard` (counts + recent activity)
- [x] `PUT /student/tasks/:id/progress`
- [x] ✅ PR: tasks + dashboard APIs (#74)

### Abdullah (Frontend)
- [x] Student portal pages: dashboard, attendance, team, tasks (read-only)
- [x] ✅ PR: student portal UI (#100)
- **ℹ️ Backend ready (PR #72) — no dependency left.**

### Shahzad (Frontend)
- [x] Projects list + project detail (+ tasks subview)
- [x] Tasks list with filters + status badge + edit
- [x] ✅ PR: projects + tasks UI (#83)
- **⚠️ BLOCKER:** mock data + missing deps (see Day 1). All admin routes wired via PR #83, but frontend cannot build until deps installed.

### Team Lead
- [ ] Security review: student cannot reach admin endpoints (403 test)
- [x] Merge day-4 PRs (#74, #83)
- [ ] Standup

---

## Day 5 — Tue Aug 11 · Integration & QA

**Goal:** every screen works against the real backend; stable release candidate.

### All Members
- [ ] Connect every frontend screen to its API (remove mocks)
- [ ] Fix integration bugs found
- [ ] Every data region has loading/empty/error state
- [ ] Forms validate client-side + show server errors
- [ ] Responsive pass (mobile/tablet/desktop)
- [ ] Security checks: invalid token, wrong role, bad input
- [ ] Remove all `console.log`, unused code
- [ ] ✅ PRs: integration + bug-fix PRs

### Shafqatullah + Lead
- [ ] Prepare production env vars (`.env`, Mongo Atlas)
- [ ] Backend build/start in production mode

### Team Lead
- [ ] Full end-to-end walkthrough (login → admin flows → student flows)
- [ ] Run QA checklist (login, CRUD, attendance %, student restrictions)
- [ ] Log all bugs in a shared checklist; assign fixes
- [ ] Freeze `dev` for new features
- [ ] Merge day-5 PRs
- [ ] Standup

---

## Day 6 — Wed Aug 12 · Deployment & Presentation (DEADLINE)

**Goal:** live application + final presentation.

### Shafqatullah + Lead
- [ ] Deploy: frontend build + backend host (Render/Railway/Netlify/Vercel)
- [ ] Point to production MongoDB (Atlas)
- [ ] Smoke test live URL (login, dashboard, one full flow)

### All Members
- [ ] Contribute to project report + presentation slides
- [ ] Rehearse demo (5-min walkthrough, admin + student)

### Team Lead
- [ ] Final release: submit live URL + GitHub repo
- [ ] Complete docs (README, setup) confirmed accurate
- [ ] Final standup + submission

---

## Global Rules

- One PR per task; lead reviews and merges same day.
- Field names / endpoints exactly per API_DOCUMENTATION.md + FRONTEND_DESIGN.md.
- Never commit directly to `dev`; never touch `main`.
- If blocked more than 1 hour → ask the lead immediately.
- Definition of done: merged via PR, no console errors, works against fresh setup.
