# Architecture

## Vision
A Bootcamp LMS with an admin management portal and a read-only student portal, covering students, attendance, teams, projects, and tasks. Clean, layered, and easy to extend (future: teacher portal, AI features).

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Create React App), React Router, Axios |
| Backend | Node.js 18+, Express, Mongoose |
| Database | MongoDB |
| Auth | jsonwebtoken (JWT Bearer), bcryptjs |
| Validation | express-validator (or zod) |
| Security/Logging | helmet, morgan, cors, dotenv |
| Tooling | Git + GitHub, npm |

## High-Level System Flow

```
Browser (React)
   ↓  HTTPS/JSON
Express API
   ↓  authenticate
Route → Controller → Service → Mongoose Model
   ↓
MongoDB
   ↓  response
Browser
```

Layers:
1. **Routes** — define URL → controller mapping + middleware.
2. **Controllers** — parse request, validate, call service, respond (thin).
3. **Services** — business logic (attendance rules, percentages, authorization).
4. **Models** — Mongoose schemas; the only DB access layer.

## Data Flow (Authentication)

```
Login form → POST /api/auth/login → validate → verify bcryptjs hash
→ sign JWT (payload: { userId, role }) → return token + user
→ client stores token → subsequent requests send Authorization: Bearer
→ middleware verifies token → attaches user to request → controller proceeds
```

## Repository Layout (monorepo)

```
Saylani-Bootcamp-LMS3/
  frontend/                 # React app
    src/
      components/
      pages/
      layouts/
      services/
      hooks/
      routes/
  backend/                  # Express app
    src/
      config/
      models/
      controllers/
      services/
      routes/
      middlewares/
      utils/
      server.js
  docs/
```

Frontend and backend are developed independently (parallel tracks) and integrated in Phase 5.

## Security Architecture

- JWT required on all protected routes (middleware).
- Role check (`admin` vs `student`) on every sensitive route.
- Row-level scoping: student queries always filtered by `req.user.id`.
- bcryptjs password hashing (min 10 rounds).
- Input validation at the controller boundary.
- No secrets in frontend; `.env` only on the backend.

## Deployment Flow (Phase 6)

```
Test on dev → merge PR → build frontend (npm run build)
→ serve static build from Express OR deploy FE (Netlify/Vercel) + BE (Render/Railway)
→ set production env vars → point Mongo to Atlas → smoke test → release
```

## Flowcharts (folded in)

### Business Workflow
Student joins → Admin registers student → assign batch → assign team → assign project → daily attendance → daily tasks → progress tracking → completion.

### Git Workflow
See `GIT_WORKFLOW.md` — branch → commit → push → PR → review → merge into `dev`.

### Database Flow
Query → Mongoose model → collection → indexed lookup → document(s) → JSON response.

### API Flow
Request → route → auth middleware → controller → validation → service → model → DB → response envelope.

## Design Principles

- Clean Architecture: controller/service/model separation.
- SOLID, DRY, KISS.
- Reusable frontend components.
- Error handling, loading states, empty states everywhere.
- API-first: FE consumes documented endpoints; no BE logic in components.
