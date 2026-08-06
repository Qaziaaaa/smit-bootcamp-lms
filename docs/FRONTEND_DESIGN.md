# Frontend Design Contract

Structural UI contract: spaces, elements, components, and data bindings. No colors or themes — this defines **what** to build and **where**, so the designer (Figma) and developers (Abdullah, Shahzad) build layouts that match the backend exactly.

Source of truth for all field names and endpoints: `API_DOCUMENTATION.md` and `DATABASE_SCHEMA.md`. Never invent field names or data that is not in the contract.

## 1. Structural Conventions

### Spacing
- 4px base unit: `4, 8, 12, 16, 24, 32, 48, 64`.
- Page padding: 24px.
- Section gap: 24px. Card internal padding: 16px.
- Component gap in toolbars/forms: 12px.

### Layout & Breakpoints
- Content max-width: 1200px, centered.
- Breakpoints: mobile < 640px, tablet 640–1024px, desktop > 1024px.
- Admin shell: fixed left sidebar (240px) + main content (fluid).
- Student shell: top navigation + main content (fluid).
- All screens responsive — stacking columns below 640px.

### Forms & Fields
- Input min-height: 40px, full width inside its grid cell.
- Form grid: 2 columns on desktop, 1 column on mobile.
- Labels above fields (left-aligned), required fields marked `*`.
- Validation messages appear directly under each field.
- Buttons: primary, secondary, danger, ghost. Min height 40px.

### Tables
- Full width, one row per record, row min-height 48px.
- Column headers: bold, sortable where API supports (`search`, `status` filters).
- Actions column on the right (view, edit, delete).
- Show at most 5–8 columns; overflow into detail view.

### States (required on every data region)
- **Loading:** skeleton rows or centered spinner.
- **Empty:** centered icon + "No <entity> found" message.
- **Error:** centered error message + retry button.
- **Form error:** per-field message + toast for API-level errors.

## 2. Global Layout & Navigation

### App Shell (Admin)
```
┌──────────┬──────────────────────────────┐
│ Sidebar  │ Topbar (page title, user,    │
│ 240px    │ logout)                      │
│          ├──────────────────────────────┤
│ Nav      │                              │
│ items    │   Content area (page renders │
│          │   here, scrollable)          │
│          │                              │
└──────────┴──────────────────────────────┘
```

Sidebar items: Dashboard, Students, Attendance, Teams, Projects, Tasks.
Topbar right: logged-in admin name/email + Logout.

### App Shell (Student)
```
┌──────────────────────────────────────────┐
│ Topnav: Logo | Dashboard Profile          │
│ Attendance Team Tasks | logout            │
├──────────────────────────────────────────┤
│            Content area                   │
└──────────────────────────────────────────┘
```

### Routing Map

| Route | Page | Access |
|---|---|---|
| `/login` | Login | public |
| `/` | Redirect by role | – |
| `/dashboard` | Admin Dashboard | admin |
| `/students` | Students list | admin |
| `/students/:id` | Student detail | admin |
| `/attendance` | Attendance | admin |
| `/teams` | Teams list | admin |
| `/teams/:id` | Team detail | admin |
| `/projects` | Projects list | admin |
| `/projects/:id` | Project detail | admin |
| `/tasks` | Tasks list | admin |
| `/student/dashboard` | Student Dashboard | student |
| `/student/attendance` | Student Attendance | student |
| `/student/team` | Student Team | student |
| `/student/tasks` | Student Tasks | student |

- Every admin route wrapped in `ProtectedRoute` (role: admin).
- Every student route wrapped in `ProtectedRoute` (role: student).
- Unauthenticated → redirect `/login`. Wrong role → 403 screen.

## 3. Reusable Component Inventory

| Component | Renders | API / data source |
|---|---|---|
| `StatCard` | label, value, icon | dashboard counts |
| `DataTable` | header + rows, sortable | any list endpoint |
| `SearchBar` | text input | `?search=` |
| `FilterBar` | dropdowns (status, batch, team) | `?status=`, `?batch=`, `?teamId=` |
| `Pagination` | page numbers, limit | `?page=&limit=` |
| `Modal` | overlay + content | create/edit forms |
| `ConfirmDialog` | message + confirm/cancel | delete actions |
| `FormField` | label + input + validation msg | form submissions |
| `Badge` | status pill | `status` fields |
| `Avatar` | initials circle | student/user name |
| `EmptyState` | icon + text | any list |
| `LoadingState` | skeleton/spinner | any fetch |
| `ErrorState` | message + retry | any fetch |
| `Toast` | success/error notification | all mutations |
| `ProtectedRoute` | guards by role | auth context |

## 4. Screen Blueprints

### 4.1 Login (`/login`)
```
┌────────────────────────────────┐
│  Card (centered, 420px max)    │
│  ┌──────────────────────────┐  │
│  │ Title: "Login"           │  │
│  │ Email        [______]    │  │
│  │ Password     [______]    │  │
│  │ (validation msg here)    │  │
│  │ [Sign In] (full width)   │  │
│  └──────────────────────────┘  │
└────────────────────────────────┘
```
Binding: `POST /auth/login` `{ email, password }` → store token → redirect by role.
Errors: 400 missing fields, 401 invalid credentials → inline message.

### 4.2 Admin Dashboard (`/dashboard`)
```
┌──────────┬──────────────────────────────────────────────┐
│ Sidebar  │ Topbar: "Dashboard"                          │
│          ├──────────┬──────────┬──────────┬───────────┤
│          │ StatCard │ StatCard │ StatCard │  StatCard │
│          │ Students │ Attend.  │ Teams    │  Tasks    │
│          ├──────────┴──────────┴──────────┴───────────┤
│          │ Recent Activity                             │
│          │  • list item                               │
│          │  • list item                               │
│          └────────────────────────────────────────────┘
```
Binding: `GET /dashboard` → 4 StatCards + activity list. Loading/empty/error states.

### 4.3 Students List (`/students`)
```
│ Topbar: "Students"                        [+ Add Student] │
│ [Search students...]  [Batch ▾]  [Team ▾]                │
│ ┌───────────────────────────────────────────────────────┐
│ │ Name   | Email    | Batch | Team | Status | Actions   │
│ │ ...    | ...      | ...   | ...  | ...   | 👁 ✏ 🗑   │
│ └───────────────────────────────────────────────────────┘
│ [<]  1 2 3  [>]     Showing 1–10 of 42                  │
```
Binding: `GET /students?search=&batch=&teamId=&page=&limit=`.
Delete → ConfirmDialog → `DELETE /students/:id`.

### 4.4 Student Form (Create/Edit Modal)
```
┌─ Modal ────────────────────────────────┐
│ Title: "Add Student" / "Edit Student"  │
│ Name [______]        Email [______]    │
│ Phone [______]       Batch [______▾]   │
│ Team [______▾]       Password [______] │   (create only)
│ [Cancel]        [Save]                 │
└────────────────────────────────────────┘
```
Binding: `POST /students` (create, includes password), `PUT /students/:id` (edit).
Errors: 400 validation (inline), 409 duplicate email.

### 4.5 Student Detail (`/students/:id`)
```
│ Topbar: "Student — {name}"                     [Edit]    │
│ ┌ Profile card ─────────────────────────┐              │
│ │ Avatar | Name, Email, Phone, Batch,   │              │
│ │         Team, Status                  │              │
│ └───────────────────────────────────────┘              │
│ ┌ Attendance Summary ──────────────────┐               │
│ │ Attendance %: 85%  |  Present: 17    │               │
│ │  Table: date | status                │               │
│ └──────────────────────────────────────┘               │
```
Binding: `GET /students/:id`, `GET /students/:id/attendance`.

### 4.6 Attendance (`/attendance`)
```
│ Topbar: "Attendance"                                      │
│ [Date ▾]  [Batch ▾]  [Status ▾]                          │
│ ┌────────────────────────────────────────────────────────┐
│ │ Student | Batch | Date | Status | Actions              │
│ │ ...     | ...   | ...  | [P/A]  | toggle present/absent│
│ └────────────────────────────────────────────────────────┘
```
Binding:
- `GET /attendance?date=&batch=&status=&studentId=` — list.
- `POST /attendance { studentId, date, status }` — mark (upsert).
- `PUT /attendance/:id { status }` — toggle.
- `GET /attendance/summary?batch=` — percentages (optional top strip).

### 4.7 Teams List (`/teams`)
```
│ Topbar: "Teams"                            [+ Add Team]  │
│ [Search teams...]                                        │
│ ┌───────────────────────────────────────────────────────┐
│ │ Name   | Members | Project | Status | Actions         │
│ │ ...    | 5       | ...    | ...    | 👁 ✏ 🗑         │
│ └───────────────────────────────────────────────────────┘
```
Binding: `GET /teams?search=`.

### 4.8 Team Detail (`/teams/:id`)
```
│ Topbar: "Team — {name}"                    [Edit]        │
│ ┌ Team info ──────────────┐ ┌ Members ──────────────┐   │
│ │ Name, Project, Status   │ │ list of students       │   │
│ └─────────────────────────┘ │ [+ Assign students]    │   │
│                             └────────────────────────┘   │
```
Binding: `GET /teams/:id`, `POST /teams/:id/students { studentIds: [] }`.

### 4.9 Projects List (`/projects`)
```
│ Topbar: "Projects"                         [+ Add Project] │
│ [Search]  [Status ▾]                                      │
│ ┌─────────────────────────────────────────────────────────┐
│ │ Title | Team | Status | Deadline | Actions              │
│ │ ...   | ...  | ...   | ...     | 👁 ✏ 🗑               │
│ └─────────────────────────────────────────────────────────┘
```
Binding: `GET /projects?status=&search=`.

### 4.10 Project Detail (`/projects/:id`)
```
│ Topbar: "Project — {title}"               [Edit]          │
│ ┌ Info card ───────────────┐  ┌ Tasks ─────────────────┐ │
│ │ Title, Description,       │  │ task list (status,     │ │
│ │ Team, Status, Deadline    │  │ priority, assigned)    │ │
│ └───────────────────────────┘  └────────────────────────┘ │
```
Binding: `GET /projects/:id`, `GET /tasks?projectId=`.

### 4.11 Tasks List (`/tasks`)
```
│ Topbar: "Tasks"                                [+ Add Task] │
│ [Search]  [Project ▾]  [Status ▾]  [Assigned ▾]           │
│ ┌──────────────────────────────────────────────────────────┐
│ │ Title | Project | Assigned | Priority | Status | Actions │
│ │ ...  | ...    | ...    | ...   | ...    | 👁 ✏ 🗑      │
│ └──────────────────────────────────────────────────────────┘
```
Binding: `GET /tasks?projectId=&status=&assignedTo=&search=`.

### 4.12 Student Dashboard (`/student/dashboard`)
```
┌────────────────────────────────────────────────────────────┐
│ Topnav: Logo | Dashboard Profile Attendance Team Tasks | ⏻ │
├────────────────────────────────────────────────────────────┤
│ Welcome, {name}                                            │
│ ┌───────────┬───────────┬────────────┐                     │
│ │ Attendance│ My Team  │ My Project │                     │
│ │   85%     │  Alpha    │  LMS Web   │                     │
│ └───────────┴───────────┴────────────┘                     │
│ ┌ My Tasks ───────────────────────────┐                    │
│ │ task title | status | priority      │                    │
│ └─────────────────────────────────────┘                    │
└────────────────────────────────────────────────────────────┘
```
Binding: `GET /student/profile`, `GET /student/attendance`, `GET /student/team`, `GET /student/tasks`.

### 4.13 Student Attendance (`/student/attendance`)
```
│ Topnav                                                        │
│ Attendance: 85%  (progress bar)                               │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ Date     | Status                                        │ │
│ │ 2026-08-01 | present  [✓]                                │ │
│ │ 2026-07-31 | absent   [✗]                                │ │
│ └──────────────────────────────────────────────────────────┘ │
```
Binding: `GET /student/attendance`.

### 4.14 Student Team (`/student/team`)
```
│ My Team: Alpha                                               │
│ ┌ Team members ──────────┐  ┌ Project ─────────────────────┐ │
│ │ name, email, role      │  │ Title, Description, Deadline │ │
│ └────────────────────────┘  └──────────────────────────────┘ │
```
Binding: `GET /student/team`.

### 4.15 Student Tasks (`/student/tasks`)
```
│ My Tasks                                                     │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ Title | Project | Priority | Status | [Update]           │ │
│ │ ...  | ...    | ...   | pending  | ▾ (progress)          │ │
│ └───────────────────────────────────────────────────────────┘ │
```
Binding: `GET /student/tasks`, `PUT /student/tasks/:id/progress { status }` (only allowed status transitions).

## 5. State Handling Contract

- **Every list/detail view:** LoadingState → EmptyState | ErrorState | content.
- **Every mutation** (create/edit/delete/toggle): success → Toast + refresh list; failure → Toast + keep form open.
- **401 anywhere** → clear token → redirect `/login`.
- **403** → show "Access denied" screen (no navigation).
- **Form submit disabled** while request in flight; button shows spinner.
- **Delete** always behind ConfirmDialog.

## 6. Owner Mapping (per TEAM_DISTRIBUTION.md)

| Area | Owner |
|---|---|
| Shell, routing, ProtectedRoute, login, admin dashboard | Abdullah |
| Students, Attendance, Teams, Tasks modules + shared DataTable/forms/search/filters | Shahzad |
| Design (Figma wireframes from this contract) | Frontend members |
| API implementation to match this contract | Backend members |

## 7. Conflict-Prevention Rules

1. Field names in UI = field names in API docs, verbatim.
2. No UI feature without a matching endpoint; no endpoint without UI.
3. Shared components are built before pages and used everywhere (no per-page duplicates).
4. Status values use exact strings: attendance `present|absent`; task `pending|in-progress|completed`; project `active|completed|on-hold`.
5. Every list must support loading/empty/error before it is considered done.
6. When API contract changes, update `API_DOCUMENTATION.md` + this doc together.
