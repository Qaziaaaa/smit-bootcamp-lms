# Sprint Plan

Maps the development phases to executable sprints with owners, scope, and acceptance criteria. Each sprint ends with a working, mergeable state on `dev`.

**Project window: Aug 7 – Aug 12 (6 days).** See `TASK_SCHEDULE.md` for the day-by-day task list.

## Phase 1 — Planning & System Design (COMPLETED)

Done by the team lead during setup. Deliverables:

| Deliverable | Status |
|---|---|
| SRS Document | docs/SRS.md |
| System Design | docs/ARCHITECTURE.md |
| ER Diagram / Database Design | docs/DATABASE_SCHEMA.md |
| API Documentation | docs/API_DOCUMENTATION.md |
| Team Task Distribution | docs/TEAM_DISTRIBUTION.md |
| Wireframes / UI-UX (Figma) | PENDING — frontend members (Phase 1.5) |

## Sprint 0 — Setup & Foundation (Team Lead + all)

**Dates:** Fri Aug 7

| Task | Owner |
|---|---|
| Repo structure (frontend/, backend/) | Team lead |
| Docs: this plan + setup guide + coding standards | Team lead |
| Environment setup on every machine | All members |
| Backend boilerplate: server, config, db connection, health endpoint | Hakimullah |
| Frontend boilerplate: CRA app, router, layout shell | Abdullah |

**Acceptance:** Both apps run locally; `/api/health` returns 200; setup guide verified by all.

## Sprint 1 — Phase 2 Foundation

**Dates:** Sat Aug 8

| Task | Owner |
|---|---|
| Auth API: login, logout, me, JWT middleware | Hakimullah |
| User/Student model + DB connected | Hakimullah |
| Login page + auth context + protected routes | Abdullah |
| Admin dashboard layout + sidebar | Abdullah |

**Acceptance (Phase 2 deliverables):** admin login works, rejected on bad credentials; dashboard layout renders; JWT protects routes; DB connected.

## Sprint 2 — Phase 3 Core Modules (Backend)

**Dates:** Sun Aug 9

| Task | Owner |
|---|---|
| Student CRUD + search/filter APIs | Hakimullah |
| Attendance API (mark, list, edit, summary) | Hakimullah |
| Team + Project APIs | Shafqatullah |
| Task + Dashboard APIs | Shafqatullah |

**Acceptance:** all admin CRUD endpoints tested via Postman; validation + auth on every route.

## Sprint 3 — Phase 3 Core Modules (Frontend)

**Dates:** Mon Aug 10

| Task | Owner |
|---|---|
| Students module UI (tables, forms, search/filter) | Shahzad |
| Attendance module UI | Shahzad |
| Teams module UI | Shahzad |
| Tasks module UI | Shahzad |

**Acceptance:** CRUD works through the UI against real APIs; loading/empty/error states present.

## Sprint 4 — Phase 4 Student Portal

**Dates:** Mon Aug 10 (runs parallel with Sprint 3)

| Task | Owner |
|---|---|
| Student auth + student endpoints (scoped) | Hakimullah |
| Student portal: profile, attendance %, team, project, tasks | Abdullah |
| Task progress update | Shafqatullah (API) + Abdullah (UI) |

**Acceptance (Phase 4):** student sees only own data; admin routes return 403 to students; percentage correct.

## Sprint 5 — Phase 5 Integration & QA

**Dates:** Tue Aug 11

| Task | Owner |
|---|---|
| Full FE/BE integration + bug fixes | All |
| Security testing (unauthorized access, validation bypass) | Hakimullah |
| Responsive design pass | Shahzad |
| Performance check on indexed queries | Shafqatullah |
| Final integration review + release candidate | Team lead |

**Acceptance (Phase 5):** fully integrated app, stable release candidate, no console errors.

## Sprint 6 — Phase 6 Deployment & Presentation

**Dates:** Wed Aug 12 (deadline)

| Task | Owner |
|---|---|
| Production deployment | Team lead + Shafqatullah |
| Project report + presentation + demo | Team lead (all contribute) |

**Acceptance:** live application, GitHub repo, complete documentation, final presentation.

## Dependency Ordering

```
Sprint 0 (Aug 7) → Sprint 1 (Aug 8) → Sprint 2 (Aug 9)
→ Sprint 3 + 4 (Aug 10, parallel) → Sprint 5 (Aug 11) → Sprint 6 (Aug 12)
```

Frontend Sprints 2 and 3 run against the documented API contract in parallel when possible — do not block on the other team; use the API docs as the source of truth.

## Definition of Done (every task)

- [ ] Code merged to `dev` via PR (reviewed by lead)
- [ ] Follows `CODING_STANDARDS.md`
- [ ] Works against fresh setup
- [ ] No console errors, no `console.log`
- [ ] Tested against real backend data
