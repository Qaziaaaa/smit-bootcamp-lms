<div align="center">

# Saylani Bootcamp LMS

### A full-stack Learning Management System for Saylani Mass IT Training

[![CI](https://github.com/SMIT-Bootcamp/Saylani-Bootcamp-LMS3/actions/workflows/ci.yml/badge.svg)](https://github.com/SMIT-Bootcamp/Saylani-Bootcamp-LMS3/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#)

**Live:** [saylani-bootcamp.vercel.app](https://saylani-bootcamp.vercel.app) &nbsp;|&nbsp; **API:** [smit-bootcamp-lms-seven.vercel.app](https://smit-bootcamp-lms-seven.vercel.app)

</div>

---

## Overview

A production-grade LMS built for managing Saylani's 3-month bootcamp. Admins manage students, attendance, teams, projects, and tasks through an admin portal. Students access their own portal to view their data.

- **30+ students** across 6 teams
- **90-day tracking** from batch start date
- **Role-based access** — Admin and Student portals
- **Dark/Light theme** support

---

## Tech Stack

<div align="center">

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 &middot; Vite &middot; Tailwind CSS v4 &middot; Radix UI &middot; TanStack Table &middot; Zod |
| **Backend** | Node.js &middot; Express 4 &middot; MongoDB (Mongoose 8) &middot; JWT Auth |
| **Deployment** | Vercel (Serverless) &middot; MongoDB Atlas |
| **CI/CD** | GitHub Actions &middot; Vercel Auto-Deploy |

</div>

---

## Features

### Admin Portal

| Feature | Description |
|---------|-------------|
| **Dashboard** | Day X of 90 tracking, student stats, project counts, charts |
| **Students** | CRUD, search, filters, CSV bulk import, auto-generated emails |
| **Attendance** | Mark present/absent/late, bulk mark, "Not Marked" tracking |
| **Teams** | Create teams, assign students (1 team per student enforced) |
| **Projects** | Create projects, assign to teams, status management |
| **Tasks** | Create tasks, assign to students, progress tracking |
| **Profile** | Change admin password |

### Student Portal

| Feature | Description |
|---------|-------------|
| **Dashboard** | Personal overview with stats |
| **Attendance** | View own attendance history |
| **Team** | View team members and info |
| **Projects** | View assigned projects |
| **Tasks** | View tasks, update progress |
| **Profile** | View profile, change password |

---

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
# Clone the repository
git clone https://github.com/SMIT-Bootcamp/Saylani-Bootcamp-LMS3.git
cd Saylani-Bootcamp-LMS3

# Backend
cd backend
npm install
cp .env.example .env        # configure MONGO_URI and JWT_SECRET
npm run seed                 # creates admin + Batch 2026
npm run dev                  # http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

### Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@lms.com` | `admin12345` |
| Student | `ahmed01@lms.com` | `student123` |

---

## Project Structure

```
Saylani-Bootcamp-LMS3/
├── backend/
│   ├── api/                  # Vercel serverless entry point
│   └── src/
│       ├── config/           # Environment variables, DB connection
│       ├── models/           # Mongoose schemas (7 models)
│       ├── routes/           # Express route definitions (9 modules)
│       ├── controllers/      # Request handlers
│       ├── services/         # Business logic
│       ├── middlewares/       # Auth, validation, error handling
│       └── utils/            # Helpers (ApiError, logger, response)
│
├── frontend/
│   └── src/
│       ├── components/
│       │   └── ui/           # 25+ reusable UI components
│       ├── pages/            # 19 page components
│       ├── layouts/          # Admin + Student layouts
│       ├── routes/           # Route definitions + auth guards
│       ├── services/         # API call functions (8 services)
│       ├── context/          # Auth + theme providers
│       └── hooks/            # useAuth hook
│
├── docs/                     # Project documentation
└── .github/workflows/        # CI pipeline
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/students` | Admin | List students |
| POST | `/api/students` | Admin | Create student |
| PUT | `/api/students/:id` | Admin | Update student |
| DELETE | `/api/students/:id` | Admin | Delete student |
| POST | `/api/students/bulk-import` | Admin | CSV import |
| POST | `/api/attendance` | Admin | Mark attendance |
| GET | `/api/attendance` | Admin | Get attendance |
| GET | `/api/teams` | Admin | List teams |
| POST | `/api/teams` | Admin | Create team |
| GET | `/api/projects` | Admin | List projects |
| POST | `/api/projects` | Admin | Create project |
| GET | `/api/tasks` | Admin | List tasks |
| POST | `/api/tasks` | Admin | Create task |
| GET | `/api/dashboard` | Admin | Dashboard stats |
| GET | `/api/student/profile` | Student | Own profile |
| GET | `/api/student/team` | Student | Own team |

Full API documentation: [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

---

## Documentation

| Document | Description |
|----------|-------------|
| [Project Plan](docs/PROJECT_PLAN.md) | Overview, roles, phases, roadmap |
| [SRS](docs/SRS.md) | Requirements, acceptance criteria |
| [Architecture](docs/ARCHITECTURE.md) | System design, tech stack |
| [Database Schema](docs/DATABASE_SCHEMA.md) | MongoDB collections and relationships |
| [API Documentation](docs/API_DOCUMENTATION.md) | REST endpoint contracts |
| [UI Rules](docs/UI_RULES.md) | Frontend conventions, theme tokens |
| [Team Distribution](docs/TEAM_DISTRIBUTION.md) | File-level member responsibilities |
| [Git Workflow](docs/GIT_WORKFLOW.md) | Branch strategy, PR rules |
| [Libraries Guide](docs/LIBRARIES_GUIDE.md) | All libraries with why we chose them |

---

## Git Workflow

| Branch | Purpose | Who pushes |
|--------|---------|-----------|
| `main` | Production-ready code | Trainer only |
| `dev` | Integration branch | Leader (after PR review) |
| `feature/<name>` | Individual work | Each member |

1. Create `feature/<name>` from `dev`
2. Work on your branch
3. Open PR into `dev`
4. Leader reviews and merges
5. Vercel auto-deploys

---

## CI/CD Pipeline

```
Push code → GitHub Actions (lint + build) → PR gets green check
  → Merge PR → Vercel auto-deploys → Live in 30 seconds
```

- **CI:** GitHub Actions runs lint + build on every push/PR
- **CD:** Vercel auto-deploys on every merge to `dev`

---

## Team

| Member | Role | Responsibility |
|--------|------|---------------|
| **Qazi** | Leader | Project lead, code review, backend hardening |
| **Abdullah** | Frontend | Auth, layouts, dashboard, student portal pages |
| **Shahzad** | Frontend | Students, attendance, teams, projects, tasks |
| **Hakim** | Backend | Auth, student APIs, attendance, validation |
| **Shafqat** | Backend | Teams, projects, tasks, dashboard, batches |

---

## License

This project is for educational purposes — Saylani Mass IT Training Bootcamp 2026.

<div align="center">

**Built with care for Saylani Bootcamp 2026**

</div>
