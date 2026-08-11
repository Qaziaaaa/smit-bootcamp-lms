# Bootcamp LMS Master Project Plan

## Project Overview
Admin + Student based Bootcamp LMS. Admin manages students, attendance, teams, projects and tasks. Students have read-only access to their own profile, attendance, tasks, team and assigned project.

## User Roles

### 1. Admin
- Secure Login
- Dashboard
- Manage Students
- Manage Attendance
- Manage Teams
- Manage Projects
- Manage Tasks
- Search & Filtering
- Reports
- Logout

### 2. Student
**Can:**
- Login
- View Dashboard
- View Profile
- View Attendance History
- View Attendance Percentage
- View Assigned Team
- View Assigned Project
- View Assigned Tasks
- Track Task Progress

**Cannot:**
- Edit Attendance
- Edit Tasks
- Edit Projects
- Access Other Students
- Access Admin Features

## Core Modules
- Authentication
- Dashboard
- Students
- Attendance
- Teams
- Projects
- Tasks
- Student Portal

## High Level Workflow
Student Joins → Admin Registers Student → Assign Batch → Assign Team → Assign Project → Daily Attendance → Daily Tasks → Progress Tracking → Completion

## System Flow
Browser → React Frontend → Express API → Authentication → Controller → Service → MongoDB → Response

## Development Phases

**Phase 1 – Planning**
Requirement Analysis · SRS · UI/UX · Architecture · ER Diagram · API Planning · Git Setup

**Phase 2 – Foundation**
Frontend (Abdullah): Login, Dashboard, Sidebar, Authentication UI.
Backend (Hakimullah): Authentication APIs, Student APIs, Attendance APIs, JWT & Middleware.

**Phase 3 – Core Modules**
Frontend (Shahzad): Students, Attendance, Teams, Tasks.
Backend (Shafqatullah): Team APIs, Project APIs, Task APIs, Dashboard APIs.

**Phase 4 – Student Portal**
Student Login, Student Dashboard, My Profile, My Attendance, Attendance Percentage, My Team, Assigned Project, My Tasks, Task Progress (read-only access).

**Phase 5 – Integration & QA**
API Integration, Testing, Bug Fixes, Responsive UI, Validation, Error Handling, Performance Optimization.

**Phase 6 – Deployment**
Production Deployment, Documentation, Final Presentation.

## Team Structure

- **Team Lead / Architect:** Architecture, Database, API Design, Git, Code Review, Integration, Deployment, Documentation
- **Frontend – Abdullah:** Login, Dashboard, Sidebar, Auth UI, Shared Layout
- **Frontend – Shahzad:** Students, Attendance, Teams, Tasks, Tables, Forms, Search & Filters
- **Backend – Hakimullah:** Auth APIs, Student APIs, Attendance APIs, JWT, Validation
- **Backend – Shafqatullah:** Team APIs, Project APIs, Task APIs, Dashboard APIs, Business Logic

## Engineering Practices
Clean Architecture · Reusable Components · SOLID · DRY · KISS · Git Flow · Pull Requests · Code Reviews · Error Handling · Loading & Empty States · Responsive Design

## Documents to Create (status)
- Vision Document — covered in docs/ARCHITECTURE.md
- SRS — docs/SRS.md
- User Flow — docs/SRS.md
- Information Architecture — docs/ARCHITECTURE.md
- Wireframes — pending (frontend)
- UI Design — pending (frontend)
- Design System — pending (frontend)
- ER Diagram — docs/DATABASE_SCHEMA.md
- Database Schema — docs/DATABASE_SCHEMA.md
- API Documentation — docs/API_DOCUMENTATION.md
- Git Workflow — docs/GIT_WORKFLOW.md
- Coding Standards — docs/CODING_STANDARDS.md
- Sprint Plan — docs/SPRINT_PLAN.md
- Testing Plan — Phase 5
- Deployment Guide — Phase 6
- Presentation Guide — Phase 6

## Flowcharts
Business Workflow · User Navigation Flow · Authentication Flow · Student Flow · Attendance Flow · Task Flow · Team Flow · API Flow · Database Flow · Git Workflow · Deployment Flow · SDLC · Project Timeline
(Business, Authentication, Student, Attendance, Task, Team, API, Database, Git and Deployment flows are folded into docs/ARCHITECTURE.md.)

## Future Enhancements
Teacher Portal · RBAC · QR Attendance · Face Recognition · Assignment Submission · Notifications · AI Analytics · AI Chat Assistant · Mobile App · Dark Mode · Multi-language · Reports Export · Audit Logs · Certificates · Calendar Integration
