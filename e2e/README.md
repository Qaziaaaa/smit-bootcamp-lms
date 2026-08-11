# LMS E2E Test Suite

Playwright end-to-end tests for the Saylani Bootcamp LMS app: API-level tests (against the Express backend) and browser-level tests (against the React frontend).

## Prerequisites

- Backend running on `http://localhost:5000` with the admin seeded
  (`cd backend && npm run seed` then `npm run dev`).
- Frontend dev server running on `http://localhost:5173` (`cd frontend && npm run dev`).
- Playwright browsers installed (`npx playwright install`).

## Running

```bash
cd e2e
npm install
npx playwright install

# Everything
npm test

# API tests only
npx playwright test --project=api

# UI tests only
npx playwright test --project=ui

# A single file
npx playwright test ui/students.spec.js

# With a visible browser
npm run test:headed
```

The HTML report opens with `npm run test:report`.

## Layout

- `api/` — HTTP-level tests using Playwright's `request` fixture.
  - `helpers.js` — shared request helpers (login, unique data generators, seeds).
  - `auth.spec.js`, `students.spec.js`, `teams.spec.js`, `projects.spec.js`,
    `tasks.spec.js`, `attendance.spec.js`, `dashboard.spec.js`, `studentPortal.spec.js`.
- `ui/` — browser tests exercising real user flows (login, CRUD, attendance toggles,
  student portal).
- `playwright.config.js` — base URLs, projects, reporter, failure artifacts.

## Notes

- Default admin login is `admin@lms.com` / `password123` (see `backend/src/seed.js`).
- Tests generate unique data per run and intentionally write to the shared dev database.
  Filter-based "mark all" tests scope their effect to a freshly created project so parallel
  runs stay independent.
