# Saylani-Bootcamp-LMS3

Bootcamp LMS — Admin + Student portal for managing students, attendance, teams, projects, and tasks.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Radix UI, TanStack Table, Zod
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth
- **Tools:** Git, GitHub, Postman

## Quick Start

```bash
# Backend
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run seed            # creates admin user + Batch 2026
npm run dev             # runs on http://localhost:5000

# Frontend
cd frontend
npm install
npm run dev             # runs on http://localhost:5173
```

**Login:** `admin@lms.com` / `admin12345`

## Documentation

| Document | Purpose |
|---|---|
| [Project Plan](docs/PROJECT_PLAN.md) | Overview, roles, phases, roadmap |
| [SRS](docs/SRS.md) | Requirements, permissions, acceptance criteria |
| [Architecture](docs/ARCHITECTURE.md) | System design, tech stack, repo layout |
| [Database Schema](docs/DATABASE_SCHEMA.md) | MongoDB collections and relationships |
| [API Documentation](docs/API_DOCUMENTATION.md) | REST endpoint contracts |
| [UI Rules](docs/UI_RULES.md) | Frontend conventions, theme tokens, UI kit |
| [Team Distribution](docs/TEAM_DISTRIBUTION.md) | File-level member responsibilities |
| [Git Workflow](docs/GIT_WORKFLOW.md) | Branch strategy, PR rules, commits |
| [Coding Standards](docs/CODING_STANDARDS.md) | FE + BE coding conventions |
| [Setup Guide](docs/SETUP_GUIDE.md) | Local environment setup |

## Branches

- `main` — trainer-managed, do not push directly
- `dev` — integration branch, all PRs merge here
- `feature/<name>` — personal working branches

See [Git Workflow](docs/GIT_WORKFLOW.md) before committing.

## Project Structure

```
backend/
  src/
    config/       # env vars, DB connection
    models/       # Mongoose schemas (User, Student, Team, Project, Task, Attendance, Batch)
    routes/       # Express route definitions
    controllers/  # Request handlers (thin — calls service layer)
    services/     # Business logic
    middlewares/   # Auth, validation, error handling
    utils/        # Helpers (ApiError, response format, logger)

frontend/
  src/
    components/   # Reusable UI (ui/ kit + feature forms)
    pages/        # Page components (admin + student)
    layouts/      # AdminLayout, StudentLayout (sidebar + header)
    routes/       # Route definitions + auth guards
    services/     # API call functions (one per feature)
    context/      # Auth + theme providers
    hooks/        # useAuth hook
    lib/          # Utilities (cn, toast config)
```

---
*Last updated: Aug 17, 2026*
