# Team Distribution

Each member should read and understand their assigned files before reviewing or modifying them.

---

## Abdullah — Frontend Auth & Layout

Files to read and own:

- `frontend/src/context/AuthContext.jsx` — login/logout state, stores token + user
- `frontend/src/hooks/useAuth.js` — helper hook to access auth context
- `frontend/src/routes/ProtectedRoute.jsx` — blocks access if not logged in or wrong role
- `frontend/src/routes/RedirectByRole.jsx` — sends admin → /dashboard, student → /student/dashboard
- `frontend/src/layouts/AdminLayout.jsx` — admin sidebar, header, user dropdown, mobile nav
- `frontend/src/layouts/StudentLayout.jsx` — student sidebar, header, theme toggle
- `frontend/src/pages/LoginPage.jsx` — email + password login form
- `frontend/src/pages/DashboardPage.jsx` — admin dashboard with stat cards and charts
- `frontend/src/pages/AccessDeniedPage.jsx` — "not authorized" page
- `frontend/src/components/ui/Logo.jsx` — SMIT logo component

---

## Shahzad — Frontend Feature Pages

Files to read and own:

- `frontend/src/pages/StudentsPage.jsx` — student list with search, filters, CSV import
- `frontend/src/pages/StudentDetailPage.jsx` — single student detail view
- `frontend/src/components/students/StudentForm.jsx` — add/edit student modal
- `frontend/src/pages/AttendancePage.jsx` — attendance list + mark modal
- `frontend/src/components/attendance/MarkAttendanceModal.jsx` — attendance form modal
- `frontend/src/pages/TeamsPage.jsx` — teams list + create/edit form
- `frontend/src/pages/TeamDetailPage.jsx` — single team detail view
- `frontend/src/pages/ProjectsPage.jsx` — projects list with status toggle
- `frontend/src/pages/ProjectDetailPage.jsx` — single project + tasks
- `frontend/src/pages/TasksPage.jsx` — tasks list + create/edit form
- `frontend/src/components/tasks/TaskForm.jsx` — task form modal
- `frontend/src/components/projects/ProjectForm.jsx` — project form modal

Student portal pages:

- `frontend/src/pages/StudentDashboardPage.jsx`
- `frontend/src/pages/StudentProfilePage.jsx`
- `frontend/src/pages/StudentAttendancePage.jsx`
- `frontend/src/pages/StudentTeamPage.jsx`
- `frontend/src/pages/StudentProjectsPage.jsx`
- `frontend/src/pages/StudentProjectDetailPage.jsx`
- `frontend/src/pages/StudentTasksPage.jsx`

Services:

- `frontend/src/services/studentsService.js` — admin CRUD for students
- `frontend/src/services/studentService.js` — student self-service (profile, tasks, team)
- `frontend/src/services/attendanceService.js` — attendance API calls
- `frontend/src/services/teamsService.js` — teams API calls
- `frontend/src/services/projectsService.js` — projects API calls
- `frontend/src/services/tasksService.js` — tasks API calls
- `frontend/src/services/dashboardService.js` — dashboard stats API

---

## Hakim — Backend Auth & Student APIs

Files to read and own:

- `backend/src/services/auth.service.js` — login, register, change password, reset password
- `backend/src/controllers/auth.controller.js` — auth request handlers
- `backend/src/routes/auth.routes.js` — auth endpoint definitions
- `backend/src/services/student.service.js` — student CRUD, bulk import, email generation
- `backend/src/controllers/student.controller.js` — student request handlers
- `backend/src/routes/student.routes.js` — student endpoint definitions (route ordering matters!)
- `backend/src/services/attendance.service.js` — mark attendance, get records
- `backend/src/controllers/attendance.controller.js` — attendance request handlers
- `backend/src/routes/attendance.routes.js` — attendance endpoint definitions
- `backend/src/middlewares/authenticate.js` — JWT token verification
- `backend/src/middlewares/authorize.js` — role-based access control
- `backend/src/middlewares/validate.js` — input validation with express-validator

Models:

- `backend/src/models/user.model.js` — User schema (email, passwordHash, role)
- `backend/src/models/student.model.js` — Student schema (name, email, batch, teamId, status)
- `backend/src/models/attendance.model.js` — Attendance schema
- `backend/src/models/batch.model.js` — Batch schema

---

## Shafqat — Backend Team, Project, Task, Dashboard APIs

Files to read and own:

- `backend/src/services/team.service.js` — team CRUD, member uniqueness check
- `backend/src/controllers/team.controller.js` — team request handlers
- `backend/src/routes/team.routes.js` — team endpoint definitions
- `backend/src/services/project.service.js` — project CRUD
- `backend/src/controllers/project.controller.js` — project request handlers
- `backend/src/routes/project.routes.js` — project endpoint definitions
- `backend/src/services/task.service.js` — task CRUD
- `backend/src/controllers/task.controller.js` — task request handlers
- `backend/src/routes/task.routes.js` — task endpoint definitions
- `backend/src/services/dashboard.service.js` — dashboard statistics queries
- `backend/src/controllers/dashboard.controller.js` — dashboard request handlers
- `backend/src/routes/dashboard.routes.js` — dashboard endpoint definitions
- `backend/src/services/batch.service.js` — batch CRUD
- `backend/src/controllers/batch.controller.js` — batch request handlers
- `backend/src/routes/batch.routes.js` — batch endpoint definitions
- `backend/src/services/studentPortal.service.js` — student self-service logic
- `backend/src/controllers/studentPortal.controller.js` — student portal handlers
- `backend/src/routes/studentPortal.routes.js` — student portal endpoints

Models:

- `backend/src/models/team.model.js` — Team schema
- `backend/src/models/project.model.js` — Project schema
- `backend/src/models/task.model.js` — Task schema

---

## Shared Utilities (read by everyone)

Backend:

- `backend/src/app.js` — Express app setup (middleware, routes)
- `backend/src/server.js` — Entry point (connects DB, starts server)
- `backend/src/config/env.js` — Environment variables
- `backend/src/config/db.js` — MongoDB connection
- `backend/src/utils/ApiError.js` — Custom error class with status code
- `backend/src/utils/asyncHandler.js` — Wraps async route handlers to catch errors
- `backend/src/utils/response.js` — Standard API response format
- `backend/src/utils/escapeRegex.js` — Prevents regex injection in search queries
- `backend/src/utils/logger.js` — Console logging helper
- `backend/src/middlewares/errorHandler.js` — Global error handler
- `backend/src/seed.js` — Seeds admin user + Batch 2026
- `backend/src/clean.js` — Drops all collections

Frontend:

- `frontend/src/services/apiClient.js` — Axios instance with JWT + auto-logout on 401
- `frontend/src/context/ThemeContext.jsx` — Dark/light mode provider
- `frontend/src/context/theme-context.js` — React context for theme
- `frontend/src/context/useTheme.js` — Hook to consume theme context
- `frontend/src/lib/utils.js` — `cn()` helper (merges Tailwind classes)
- `frontend/src/lib/toast.js` — Toast configuration
- `frontend/src/constants/index.js` — Storage keys, status labels
- `frontend/src/components/ui/` — All reusable UI components (Button, Badge, DataTable, Modal, etc.)
