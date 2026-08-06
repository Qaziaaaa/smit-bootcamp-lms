# Coding Standards

Applies to the whole team. Reviews will enforce these rules.

## General

- Use English for all code, comments, commit messages.
- No commented-out code in commits.
- No `console.log` left in committed code — use a logger on the backend.
- Handle errors explicitly. No silent `catch {}`.

## Frontend (React.js)

### Folder Structure

```
src/
  components/        # reusable, presentational components
    ui/              # buttons, inputs, modals, tables
  pages/             # one folder per route/page
  layouts/           # shared layout (sidebar, header)
  services/          # API calls (axios/fetch wrappers)
  hooks/             # custom hooks
  utils/             # helpers, formatters
  context/           # React context (auth, theme)
  routes/            # route definitions + protected routes
  constants/
```

### Rules

- One component per file. File name matches component name (PascalCase).
- Component files: `Login.jsx`. Non-component files: `apiClient.js` (camelCase).
- Use functional components with hooks. No class components.
- Name custom hooks with the `use` prefix: `useAuth`.
- Use React Router. Wrap protected pages in an `AuthGuard` / `ProtectedRoute`.
- Store auth token in `localStorage` (or httpOnly cookie — decided at architecture review).
- No hardcoded API URLs in components. All API calls go through `src/services/`.
- Forms: use controlled inputs. Validate on both client and server.
- Loading, empty, and error states are mandatory on every data screen.
- Prefer single responsibility, reusable components (DRY, KISS).

## Backend (Node.js + Express)

### Folder Structure

```
src/
  config/          # env, db connection
  models/          # Mongoose schemas
  controllers/     # request handlers
  services/        # business logic
  routes/          # route definitions
  middlewares/     # auth, validation, error handler
  utils/           # helpers
```

### Rules

- Controllers stay thin: parse request, call service, send response.
- Business logic lives in `services/`. Never in routes or models.
- Mongoose models are the only place that touches the database.
- Naming: files `student.controller.js`, `student.service.js`, `student.model.js`. Exports are named or default consistently per file type.
- Use `async/await`. Wrap handlers in an async wrapper that forwards errors to the error middleware.
- One global error-handling middleware at the app root.
- Validate all input (see API standards) with `express-validator`.
- Hash passwords with `bcryptjs` (min 10 salt rounds). Never store plaintext.
- JWT for authentication; verify via middleware. Store role in the token.
- No secrets in code. Everything from `process.env` via `.env`.

## API Response Shape (contract)

All endpoints return a consistent shape:

```json
{
  "success": true,
  "data": { },
  "message": "optional",
  "errors": []
}
```

Errors:

```json
{
  "success": false,
  "message": "Human readable message",
  "errors": []
}
```

HTTP status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error.

## Database

- Field names: `camelCase`.
- Collection names: plural lowercase (`students`, `attendance`).
- Use Mongoose. All relationships via `ObjectId` references, not embedded duplication.
- Index every field used in search/filter and every foreign key.

## Pull Request Checklist (before you push)

- [ ] Code follows these standards
- [ ] No `console.log`, no commented code
- [ ] Loading/empty/error states handled
- [ ] Input validated
- [ ] Works against a fresh clone + setup
