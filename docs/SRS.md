# Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose
This document defines the functional and non-functional requirements for the **Bootcamp LMS** — a web application with an Admin portal and a Student portal. It is the contract between the team and the business requirements, and the basis for development, testing, and acceptance.

### 1.2 Scope
The system manages students, attendance, teams, projects, and tasks for a bootcamp. An admin manages all data; students have read-only access to their own data.

### 1.3 Audience
- Team lead (architecture, reviews, integration)
- Frontend developers (Abdullah, Shahzad)
- Backend developers (Hakimullah, Shafqatullah)
- Trainer / stakeholders (acceptance)

## 2. User Roles

### 2.1 Admin
- Secure login
- Dashboard with overview of students, attendance, teams, tasks
- CRUD: Students, Attendance, Teams, Projects, Tasks
- Search & filtering
- Reports
- Logout

### 2.2 Student
- Login
- View dashboard
- View profile
- View attendance history and percentage
- View assigned team, project, tasks
- Track task progress
- Logout

### 2.3 Student Restrictions (hard rules)
A student CANNOT:
- Edit attendance
- Edit tasks
- Edit projects
- Access other students' data
- Access any admin feature

## 3. Functional Requirements

### FR-1 Authentication
- FR-1.1 System shall authenticate admin via email + password.
- FR-1.2 System shall authenticate student via email + password.
- FR-1.3 System shall issue a JWT on successful login and validate it on protected routes.
- FR-1.4 Passwords shall be stored hashed (bcryptjs).
- FR-1.5 Wrong credentials → 401 with a generic message (no account enumeration).
- FR-1.6 Logout invalidates the client session.

### FR-2 Dashboard (Admin)
- FR-2.1 Show counts: total students, today's attendance, teams, tasks.
- FR-2.2 Show recent activity/attendance summary.

### FR-3 Students Module
- FR-3.1 Admin can create, read, update, delete students.
- FR-3.2 Student record includes name, email, password, batch, team, phone (optional).
- FR-3.3 Email must be unique.

### FR-4 Attendance Module
- FR-4.1 Admin can mark a student present/absent for a date.
- FR-4.2 Admin can view attendance by date, student, or batch.
- FR-4.3 Admin can edit attendance records.
- FR-4.4 Student can view own attendance history and percentage.
- FR-4.5 Percentage = (present days / total recorded days) × 100.

### FR-5 Teams Module
- FR-5.1 Admin can create, edit, delete teams.
- FR-5.2 A team has a name and a list of member students.
- FR-5.3 A team is assigned a project.

### FR-6 Projects Module
- FR-6.1 Admin can create, edit, delete projects.
- FR-6.2 A project has title, description, and an assigned team.

### FR-7 Tasks Module
- FR-7.1 Admin can create, edit, delete tasks.
- FR-7.2 A task belongs to a project/team and has title, description, status, deadline.
- FR-7.3 Task status: pending, in-progress, completed.
- FR-7.4 Student can view assigned tasks and update progress status (self-progress).

### FR-8 Student Portal
- FR-8.1 Student dashboard shows own profile, attendance %, team, project, tasks.
- FR-8.2 All student views are read-only except own task progress updates.
- FR-8.3 Backend must enforce row-level security: student data queries scoped to the logged-in student.

### FR-9 Search & Filtering
- FR-9.1 Admin can search students by name/email/batch.
- FR-9.2 Admin can filter attendance by date/status; teams and tasks by status/name.

## 4. Non-Functional Requirements

- **Security (NFR-1):** JWT auth, bcryptjs hashing, input validation, no sensitive data in logs, role-based authorization on every endpoint.
- **Performance (NFR-2):** API responses < 500ms for standard reads; indexed queries for search/filter.
- **Responsiveness (NFR-3):** UI usable on desktop and mobile (responsive design).
- **Reliability (NFR-4):** Graceful error handling with loading/empty/error states; no unhandled promise rejections.
- **Maintainability (NFR-5):** Clean layered architecture (controller → service → model), DRY, SOLID, documented code.
- **Browser Support (NFR-6):** Latest Chrome, Firefox, Edge.
- **Environment (NFR-7):** Node 18+, MongoDB, React 18.

## 5. Acceptance Criteria (per phase deliverable)

### Phase 2 (Foundation)
- Admin can log in with valid credentials and is rejected with invalid ones.
- Authenticated admin sees dashboard layout with sidebar.
- Backend exposes auth endpoints returning proper tokens and errors.
- Database is connected; collections created.

### Phase 3 (Core Modules)
- Full CRUD works for students, attendance, teams, projects, tasks.
- Search & filtering works server-side.
- Attendance can be recorded and viewed by date/student.

### Phase 4 (Student Portal)
- Student logs in and sees only own data.
- Student cannot access admin routes (403) or other students' data (403/404).
- Attendance percentage is correct.

### Phase 5 (Integration & QA)
- Frontend consumes all backend endpoints end-to-end.
- All forms validated on client and server.
- No console errors; loading/empty/error states present everywhere.
- Core security tests pass (unauthorized access blocked).

## 6. User Flows

### 6.1 Authentication Flow
Admin/Student → Login form → POST /api/auth/login → validate → issue JWT → store token → redirect to role dashboard. Invalid credentials → error message.

### 6.2 Student Flow
Student login → dashboard → view profile/attendance/team/project/tasks → update own task progress → logout.

### 6.3 Attendance Flow
Admin selects batch/date → marks students present/absent → saved per student per date → student views history + percentage.

### 6.4 Task Flow
Admin creates project → creates task assigned to team → students update progress → admin tracks completion.

### 6.5 Team Flow
Admin creates team → assigns students → assigns project → students see their team and project.
