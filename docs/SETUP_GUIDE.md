# Setup Guide

Every team member must be able to run the project locally before writing any feature code.

## Prerequisites

- Node.js **v18+** (LTS). Check: `node -v`
- npm **v9+**. Check: `npm -v`
- MongoDB **local** (Community Server) **or** a MongoDB Atlas free cluster
- Git

## Project Layout

```
Saylani-Bootcamp-LMS3/
  backend/     # Node.js + Express API
  frontend/    # React.js app
  docs/
```

The `backend/` and `frontend/` scaffolds are already committed to the repo. Members only clone, install, and run.

## Backend Setup

```bash
git clone https://github.com/SMIT-Bootcamp/Saylani-Bootcamp-LMS3.git
cd Saylani-Bootcamp-LMS3
git checkout dev
cd backend
npm install
```

### Environment Variables

Create `.env` in `backend/` (never commit it):

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/lms
JWT_SECRET=change-me-to-a-long-random-string
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=10
```

### Run

```json
// package.json scripts
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js"
}
```

```bash
npm run dev
```

API runs at `http://localhost:5000`.

## Frontend Setup

```bash
cd ../frontend
npm install
```

### Environment Variables

Create `.env` in `frontend/` (Vite env vars are prefixed `VITE_`):

```
VITE_API_URL=http://localhost:5000/api
```

### Run

```bash
npm run dev
```

App runs at `http://localhost:5173`.

## MongoDB

Local default connection string: `mongodb://127.0.0.1:27017/lms`

Verify it is running:

```bash
mongosh --eval "db.runCommand({ ping: 1 })"
```

## First Run Checklist

- [ ] Backend starts and logs "Connected to MongoDB"
- [ ] Frontend loads at localhost:5173
- [ ] A health endpoint `/api/health` returns `{ success: true }`

## Troubleshooting

- **Port already in use** — change `PORT` in `backend/.env` or stop the conflicting process.
- **MongoDB connection refused** — start MongoDB service: `net start MongoDB` (Windows) or `sudo systemctl start mongod` (Linux).
- **CORS errors** — confirm `cors()` is enabled and `VITE_API_URL` matches the backend port.
- **Secrets committed** — never commit `.env`; add `.env` to `.gitignore`.

## .gitignore (both frontend and backend)

```
node_modules/
.env
build/
dist/
```

Report any setup issue to the team lead immediately — do not start building on a broken environment.
