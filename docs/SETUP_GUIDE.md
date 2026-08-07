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

(The `backend/` and `frontend/` folders are created in Phase 2. Until then, set up the tooling below.)

## Backend Setup

```bash
git clone https://github.com/SMIT-Bootcamp/Saylani-Bootcamp-LMS3.git
cd Saylani-Bootcamp-LMS3
git checkout dev
mkdir -p backend
cd backend
npm init -y
npm install express mongoose cors dotenv bcryptjs jsonwebtoken express-validator helmet morgan
npm install --save-dev nodemon
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
npx create-react-app . --use-npm
npm install @mui/material @emotion/react @emotion/styled lucide-react react-router-dom axios react-hook-form zod @tanstack/react-query @reduxjs/toolkit react-redux sonner framer-motion dayjs @tanstack/react-table react-dropzone fuse.js recharts
```

### Environment Variables

Create `.env` in `frontend/`:

```
REACT_APP_API_URL=http://localhost:5000/api
```

### Run

```bash
npm start
```

App runs at `http://localhost:3000`.

## MongoDB

Local default connection string: `mongodb://127.0.0.1:27017/lms`

Verify it is running:

```bash
mongosh --eval "db.runCommand({ ping: 1 })"
```

## First Run Checklist

- [ ] Backend starts and logs "Connected to MongoDB"
- [ ] Frontend loads at localhost:3000
- [ ] A health endpoint `/api/health` returns `{ success: true }`

## Troubleshooting

- **Port already in use** — change `PORT` in `backend/.env` or stop the conflicting process.
- **MongoDB connection refused** — start MongoDB service: `net start MongoDB` (Windows) or `sudo systemctl start mongod` (Linux).
- **CORS errors** — confirm `cors()` is enabled and `REACT_APP_API_URL` matches the backend port.
- **Secrets committed** — never commit `.env`; add `.env` to `.gitignore`.

## .gitignore (both frontend and backend)

```
node_modules/
.env
build/
dist/
```

Report any setup issue to the team lead immediately — do not start building on a broken environment.
