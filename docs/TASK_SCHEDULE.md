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
- [ ] Follow SETUP_GUIDE.md — Node, MongoDB, `.env`
- [ ] Create `backend/` scaffold: `src/config/`, `src/server.js`
- [ ] Connect MongoDB (mongoose), handle connection errors
- [ ] `/api/health` endpoint → `{ success: true }`
- [ ] `express-validator`, `helmet`, `morgan`, `cors` wired in
- [ ] ✅ PR: backend skeleton + health endpoint

### Shafqatullah (Backend)
- [ ] Create all Mongoose models per DATABASE_SCHEMA.md:
  - [ ] `users` (email unique, role, passwordHash)
  - [ ] `students`
  - [ ] `attendance`
  - [ ] `teams`
  - [ ] `projects`
  - [ ] `tasks`
- [ ] Global error-handling middleware + standard response envelope
- [ ] Indexes on email, `{ studentId, date }`, foreign keys
- [ ] ✅ PR: models + error handler

### Abdullah (Frontend)
- [ ] Create `frontend/` (CRA), install axios + react-router-dom
- [ ] Router with all 15 routes from FRONTEND_DESIGN.md §2
- [ ] `ProtectedRoute` (admin + student roles)
- [ ] Auth context (token store, login/logout state)
- [ ] Admin shell layout (sidebar 240px + topbar + content)
- [ ] ✅ PR: frontend scaffold + routing + shell

### Shahzad (Frontend)
- [ ] Shared component library per FRONTEND_DESIGN.md §3:
  - [ ] `DataTable`, `SearchBar`, `FilterBar`, `Pagination`
  - [ ] `Modal`, `ConfirmDialog`, `FormField`
  - [ ] `Badge`, `Avatar`, `StatCard`
  - [ ] `LoadingState`, `EmptyState`, `ErrorState`, `Toast`
- [ ] ✅ PR: shared components

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
- [ ] Auth APIs: `POST /auth/login`, `GET /auth/me`
- [ ] JWT sign/verify middleware + role guard
- [ ] bcryptjs hashing, express-validator on login
- [ ] Seed an admin user for testing
- [ ] ✅ PR: auth API

### Shafqatullah (Backend)
- [ ] Student CRUD APIs (`GET/POST/PUT/DELETE /students`)
- [ ] Pagination + `search/batch/teamId` filters
- [ ] `GET /students/:id` + `GET /students/:id/attendance`
- [ ] ✅ PR: student APIs

### Abdullah (Frontend)
- [ ] Login page (FRONTEND_DESIGN.md §4.1)
- [ ] Wire auth context → login → redirect by role
- [ ] 401/403 handling + redirect to `/login`
- [ ] Admin dashboard layout with StatCards
- [ ] ✅ PR: login + dashboard shell

### Shahzad (Frontend)
- [ ] Students list page: SearchBar, FilterBar, DataTable, Pagination
- [ ] Student form modal (create/edit) with validation display
- [ ] ✅ PR: students module UI (against mock/API contract)

### Team Lead
- [ ] Review auth security (JWT, hashing, validation)
- [ ] Protect `dev`: members push only via PR
- [ ] Merge all day-2 PRs
- [ ] Standup

---

## Day 3 — Sun Aug 9 · Core Modules I

**Goal:** students + attendance fully working (API + UI).

### Hakimullah (Backend)
- [ ] Attendance APIs: `POST /attendance`, `GET /attendance`, `PUT /attendance/:id`
- [ ] Attendance upsert per `{ studentId, date }`
- [ ] `GET /attendance/summary` (percentages by batch)
- [ ] ✅ PR: attendance APIs

### Shafqatullah (Backend)
- [ ] Team APIs: CRUD + `POST /teams/:id/students`
- [ ] Project APIs: CRUD
- [ ] ✅ PR: team + project APIs

### Abdullah (Frontend)
- [ ] Admin Dashboard wired to `GET /dashboard`
- [ ] ✅ PR: live dashboard

### Shahzad (Frontend)
- [ ] Attendance page: date/batch/status filters + mark present/absent toggle
- [ ] Teams list + team detail + assign-students picker
- [ ] ✅ PR: attendance + teams UI

### Team Lead
- [ ] Verify API contract matches FRONTEND_DESIGN.md for attendance/teams
- [ ] Merge day-3 PRs
- [ ] Standup

---

## Day 4 — Mon Aug 10 · Core Modules II + Student Portal

**Goal:** projects/tasks done; student portal reads real data.

### Hakimullah (Backend)
- [ ] Student-scoped endpoints: `/student/profile`, `/student/attendance`, `/student/team`, `/student/tasks`
- [ ] Row-level security: queries scoped to logged-in student
- [ ] ✅ PR: student portal APIs

### Shafqatullah (Backend)
- [ ] Task APIs: CRUD + filters (`projectId/status/assignedTo/search`)
- [ ] `GET /dashboard` (counts + recent activity)
- [ ] `PUT /student/tasks/:id/progress`
- [ ] ✅ PR: tasks + dashboard APIs

### Abdullah (Frontend)
- [ ] Student portal pages: dashboard, attendance, team, tasks (read-only)
- [ ] ✅ PR: student portal UI

### Shahzad (Frontend)
- [ ] Projects list + project detail (+ tasks subview)
- [ ] Tasks list with filters + status badge + edit
- [ ] ✅ PR: projects + tasks UI

### Team Lead
- [ ] Security review: student cannot reach admin endpoints (403 test)
- [ ] Merge day-4 PRs
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
