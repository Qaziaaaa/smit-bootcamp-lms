# The LMS Project — Explained Like You Are 10 Years Old

This file explains the WHOLE project. It tells you:

1. What the project is
2. What libraries (tools) we used and **why** we needed each one
3. The full folder structure
4. What EVERY file does, and what every function inside it does
5. Some little words (syntax) explained simply

Read it slowly, like a story. If you don't understand one part, keep going — later parts make it clear.

---

## Part 1 — What is this project?

This is a **Learning Management System (LMS)**. Think of it as a special website for a coding bootcamp (a school where people learn to make software). It has two kinds of people:

- **Admin (the teacher/boss)** — can log in, add students, see the list of students, mark "present" or "absent", and see attendance summaries.
- **Student (the learner)** — can log in and see their own profile, their attendance, their team, and their tasks.

The project is split into two big parts:

| Part | Folder | What it is like |
|---|---|---|
| **Backend** | `backend/` | The **kitchen** of a restaurant. It does the real thinking, checks the passwords, and saves/reads data. |
| **Frontend** | `frontend/` | The **waiter + menu** of the restaurant. It is the screen you look at and click on. |

There is also a **database** — that is like the **fridge/storage room** where all the names and attendance are kept forever. We use **MongoDB** for this.

---

## Part 2 — The Story of One Request (the big picture)

Imagine a student opens the website and wants to see their attendance. Here is what happens, step by step:

1. **Frontend** shows the login page.
2. Student types email + password and clicks **Login**.
3. **Axios** (a frontend library) sends the password to the backend, like sending a letter: `POST /api/auth/login`.
4. The backend's **Express** receives the letter.
5. **Middlewares** (bouncers) check the letter is well-formed (using `express-validator`).
6. The **Controller** (the manager) receives the letter and calls the **Service** (the cook).
7. The **Service** does the real work: it asks **Mongoose** to look in the **MongoDB** fridge, checks the password with **bcrypt**, and makes a **JWT token** (a magic ID card).
8. The answer travels back out: controller → response → frontend.
9. Frontend saves the token and now shows the dashboard.

So the order is always:

```
Frontend (axios)  →  Routes  →  Middlewares (bouncers)  →  Controllers (managers)  →  Services (cooks)  →  Models/MongoDB (fridge)
```

And back again with the answer.

---

## Part 3 — Libraries (tools) We Used and WHY

A **library** is like a tool you borrow instead of building it yourself. Imagine you need a hammer — you don't make one, you borrow one.

### Backend libraries (in `backend/package.json`)

| Library | What it does (simple words) | Why we needed it |
|---|---|---|
| **express** | The main web server. It listens for requests at URLs like `/api/login` and gives answers. | Without it we would have to write all the plumbing for a server by hand. It is the frame of the whole backend. |
| **mongoose** | A translator that lets Node talk to the MongoDB database. | MongoDB stores data in its own special way. Mongoose makes it easy to define "shapes" of data (called schemas) and save/find records. |
| **bcryptjs** | Scrambles passwords so they look like gibberish before saving. | If someone steals the database, they should NOT see real passwords. bcrypt "hashes" the password — it can be checked later but never reversed. |
| **jsonwebtoken** | Creates a "magic ID card" (a JWT token) after a user logs in. | We do not want the user to type their password every single time. After login, we give them a token; on every later request they show this token to prove "yes, it's me." |
| **express-validator** | Checks that the data people send is correct (email is really an email, password is long enough, etc.). | Keeps bad or dangerous data out of our database. It is a bouncer at the door. |
| **helmet** | Adds safety headers to every response. | A cheap security shield against common web attacks. |
| **cors** | Allows the frontend (running on one address) to talk to the backend (running on another address). | Browsers normally block websites from talking to other addresses. CORS politely says "this frontend is allowed to talk to us." |
| **morgan** | Prints a small log in the console for every request. | So the developer can SEE requests coming in (like a security camera). |
| **dotenv** | Reads secret settings from a `.env` file (like the database address and the secret password for tokens). | Secrets should not be written inside the code. They live in a private file instead. |
| **nodemon** | A developer tool. When you change a file, it restarts the server for you automatically. | Saves time — you do not have to stop and restart the server yourself after every small change. |

### Frontend libraries (in `frontend/package.json`)

| Library | What it does (simple words) | Why we needed it |
|---|---|---|
| **react** + **react-dom** | The engine that builds the screen out of small pieces called "components". | The whole frontend is made of React. Each screen (login, dashboard, etc.) is a component. |
| **react-router-dom** | Lets the user move between pages (like `/login`, `/students`) without refreshing. | Normal websites reload the whole page; a React app just swaps the part that changed. This library manages that. |
| **axios** | The messenger. Sends requests to the backend and receives answers. | It is easier and more powerful than the built-in `fetch`. It also lets us automatically attach the token and catch errors. |
| **@tanstack/react-table** | Builds tables (like the student list) easily with sorting and searching. | Writing tables by hand is long and boring. This tool does it for us. |
| **tailwindcss** (+ **@tailwindcss/vite**) | A CSS toolkit — special classes on the JSX control the look (colors, spacing, sizes). | Fast, consistent styling driven by one master theme (`index.css`), no CSS files per component. |
| **@radix-ui/\*** (dialog, dropdown-menu, checkbox, label, slot, progress) | Small building blocks for pop-ups, menus, checkboxes and more — accessible by default. | The UI kit in `components/ui/` is built on them so every control behaves correctly. |
| **zod** | Describes what data SHOULD look like (a "shape" of data) and checks it. | Forms are plain React state + a zod schema, so bad data is caught before it reaches the backend. |
| **lucide-react** | A set of icons (like a "user" icon, a "search" icon). | Nice icons without drawing them ourselves. |
| **sonner** | Shows small pop-up notifications (toasts) like "Login successful". | Easy, pretty notifications with one line of code (`toast.success(...)`). |
| **vite** | The tool that starts the dev server and builds the final website. | It is super fast. It turns all the JSX files into a normal website. |
| **@vitejs/plugin-react** | A small plug-in that teaches Vite how to understand React's JSX. | Without it Vite wouldn't know what to do with `.jsx` files. |

---

## Part 4 — Full Folder Structure

Here is the whole project drawn like a tree. I put a small explanation next to each important folder/file.

```
Saylani-Bootcamp-LMS3/
│
├── README.md                        ← A small "welcome" file listing the docs.
├── CODEOWNERS                       ← Tells Git who owns which files.
├── q                                ← A file (small) — probably a note/quota file.
│
├── backend/                         ← THE KITCHEN (server + logic + data)
│   ├── package.json                 ← List of backend libraries + commands.
│   ├── node_modules/                ← The downloaded libraries (don't touch).
│   └── src/                         ← All the real backend code.
│       ├── server.js                ← The FRONT DOOR — starts the whole server.
│       ├── app.js                   ← Sets up Express, safety, and all routes.
│       ├── seed.js                  ← Creates the first Admin user for you.
│       ├── config/
│       │   ├── env.js               ← Reads secret settings from environment.
│       │   └── db.js                ← Connects to the MongoDB database.
│       ├── models/                  ← The SHAPES of data (like forms to fill).
│       │   ├── index.js             ← Gathers all models in one place.
│       │   ├── user.model.js        ← Shape of a "User" (email, password, role).
│       │   ├── student.model.js     ← Shape of a "Student".
│       │   ├── attendance.model.js  ← Shape of an "Attendance" record.
│       │   ├── team.model.js        ← Shape of a "Team".
│       │   ├── project.model.js     ← Shape of a "Project".
│       │   └── task.model.js        ← Shape of a "Task".
│       ├── routes/                  ← The MAP of URLs (who goes where).
│       │   ├── index.js             ← Connects all route maps together.
│       │   ├── auth.routes.js       ← URLs for login, logout, me.
│       │   ├── student.routes.js    ← URLs for managing students (admin).
│       │   ├── attendance.routes.js ← URLs for attendance (admin).
│       │   └── studentPortal.routes.js ← URLs for students themselves.
│       ├── middlewares/             ← BOUNCERS (run between request and answer).
│       │   ├── authenticate.js      ← Checks the magic ID card (token).
│       │   ├── authorize.js         ← Checks the person is allowed (role).
│       │   ├── validate.js          ← Checks the data is well-formed.
│       │   └── errorHandler.js      ← Catches errors and gives nice answers.
│       ├── controllers/             ← MANAGERS (receive request, call service).
│       │   ├── auth.controller.js
│       │   ├── student.controller.js
│       │   ├── attendance.controller.js
│       │   └── studentPortal.controller.js
│       ├── services/                ← COOKS (real logic, talk to database).
│       │   ├── auth.service.js
│       │   ├── student.service.js
│       │   ├── attendance.service.js
│       │   └── studentPortal.service.js
│       └── utils/                   ← Small helper tools used everywhere.
│           ├── ApiError.js          ← A special "error" object with status codes.
│           ├── asyncHandler.js      ← Catches errors in async functions for us.
│           ├── logger.js            ← Prints nice colored log messages.
│           └── response.js          ← Shapes every success/error answer.
│
├── frontend/                        ← THE WAITER (what the user sees)
│   ├── package.json                 ← List of frontend libraries + commands.
│   ├── index.html                   ← The empty HTML page that loads React.
│   ├── vite.config.js               ← Settings for the Vite server.
│   ├── .env.example                 ← Example of secret settings file.
│   └── src/                         ← All the real frontend code.
│       ├── main.jsx                 ← THE START — mounts React into the page.
│       ├── App.jsx                  ← THE MAP of pages (routes).
│       ├── index.css                ← The master theme (colors, dark mode, fonts).
│       ├── components/              ← Reusable pieces:
│       │   ├── ui/                  ← The UI kit (Button, Input, Modal, DataTable, Badge...).
│       │   └── admin/, projects/, students/, tasks/, attendance/ ← form components.
│       ├── pages/                   ← Whole screens (LoginPage, StudentsPage, ...).
│       ├── layouts/                 ← Page frames (AdminLayout, StudentLayout).
│       ├── routes/                  ← Route helpers (AppRoutes, ProtectedRoute).
│       ├── hooks/                   ← Reusable React logic (useAuth, useTheme).
│       ├── context/                 ← React context (AuthContext, ThemeContext).
│       ├── services/                ← API call helpers (apiClient, studentService...).
│       └── lib/                     ← Helpers (cn(), zod schemas).
│
├── design/                          ← Mock-up HTML pages (design drafts).
│   ├── login.html, dashboard.html, students.html, attendance.html,
│   ├── student-dashboard.html, teams.html, tasks.html, projects.html ...
│   └── (These are only LOOKS, not connected to the real data yet.)
│
└── docs/                            ← All the written plans and documents.
    ├── PROJECT_PLAN.md, SPRINT_PLAN.md, SRS.md, ARCHITECTURE.md,
    ├── DATABASE_SCHEMA.md, API_DOCUMENTATION.md, UI_RULES.md,
    ├── SETUP_GUIDE.md, GIT_WORKFLOW.md, CODING_STANDARDS.md ...
```

---

## Part 5 — What Every File Does (with every function explained)

### 5.1 Backend

#### `backend/src/config/env.js` — The secret settings box

```js
import 'dotenv/config';                       // "read the .env file please"
```

- `import` = "bring this tool in so I can use it". This line brings `dotenv` and tells it to read the `.env` file, where secrets live.

```js
const env = {                                 // a box (object) that holds settings
  port: Number(process.env.PORT) || 5000,     // the door number of our server
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lms', // fridge address
  jwtSecret: process.env.JWT_SECRET || 'dev-only-insecure-secret',    // secret to sign tokens
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',   // how long token is valid (7 days)
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 10, // how strong password-scrambling is
  nodeEnv: process.env.NODE_ENV || 'development', // are we running for dev or production?
};

export default env;                           // let other files use this box
```

- `process.env.PORT` = ask the computer's environment for a setting called PORT.
- `||` means "OR" — if the first thing is missing/empty, use the second (a safe default).
- `Number(...)` = turn text into a number.
- `export default` = the "give to others" command. Any other file can now `import env from ...`.

**Why this file exists?** So all secret settings live in ONE place, and code elsewhere just says `env.port` instead of repeating the address everywhere.

---

#### `backend/src/config/db.js` — Connecting to the fridge (database)

```js
const connectDB = async () => {               // an async function = one that waits for slow work
  try {                                       // try = "attempt this, and if it fails..."
    mongoose.set('strictQuery', true);        // be strict about search terms
    await mongoose.connect(env.mongoUri);     // WAIT until connected to MongoDB
    logger.info(`MongoDB connected at ${mongoose.connection.host}`);
  } catch (err) {                             // ...jump here if it failed
    logger.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);                          // stop the server (exit code 1 = error)
  }
};
```

- `async` = this function works in the background and we can wait for it.
- `await` = "stop here and wait for the result before moving on".
- `try` / `catch` = a safety net. Try the risky thing; if it breaks, catch the error and do something sensible.
- `process.exit(1)` = shut down the whole program (like closing the restaurant because the fridge is broken).

There are also two "listeners" that watch the connection forever:

```js
mongoose.connection.on('error', ...)      // if a problem happens later, print it
mongoose.connection.on('disconnected', ...) // if we lose connection, warn us
```

**Why this file exists?** The server cannot work without the database, so this file makes sure we are connected before we start taking orders.

---

#### `backend/src/models/*.js` — The SHAPES of data

A **model/schema** is like an application form: it says exactly which boxes exist and what type of writing is allowed in each box.

##### `user.model.js` (the User — the login account)

```js
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'student'], default: 'student' },
}, { timestamps: true });
```

- `type: String` = the box holds text.
- `required: true` = you MUST fill this box.
- `unique: true` = no two users can have the same email.
- `trim: true` = remove extra spaces at the start/end.
- `lowercase: true` = always save email as lowercase.
- `enum: [...]` = only these values allowed ('admin' or 'student').
- `default` = if you don't choose, use this value.
- `timestamps: true` = automatically add "createdAt" and "updatedAt" boxes.

`export default mongoose.model('User', userSchema);` = save this shape under the name "User".

**Why?** Every person who logs in is a User. We store the password only as a hash (scrambled), never in plain text.

##### `student.model.js` (the Student)

```js
userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
```

- `ObjectId` with `ref: 'User'` = a **link** to another document. It stores the ID of the User account for this student. This is called a "foreign key" — like writing "see sheet number 42" on your form.

Other boxes: `name` (required, indexed), `email` (required, unique), `phone`, `batch` (which class, e.g. "2026-A"), `teamId` (link to a Team), `status` ('active' or 'inactive').

- `index: true` = make this box searchable fast (like a book's index).

**Why?** A student has more info than a User (name, phone, batch). So we keep the login info in User and the school info in Student, and link them with `userId`.

##### `attendance.model.js` (the Attendance record)

```js
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });
```

- This means: one student can have only ONE attendance per date. If you try to save the same student+date again, MongoDB refuses (a duplicate). We use this together with `findOneAndUpdate` + `upsert` so marking attendance twice just updates it instead of creating a second copy.

Boxes: `studentId` (link to Student, required), `date` (required Date), `status` ('present' or 'absent', required), `markedBy` (link to the User who marked it).

##### `team.model.js`, `project.model.js`, `task.model.js`

- **Team**: `name` (unique), `projectId` (link to a Project).
- **Project**: `title` (required), `description`, `teamId` (link to Team), `status` ('active'/'completed'/'on-hold'), `deadline`.
- **Task**: `projectId` (link to Project, required), `assignedTo` (link to a Student), `title`, `description`, `status` ('pending'/'in-progress'/'completed'), `priority` ('low'/'medium'/'high'), `deadline`.

**Why these files exist?** The database must know the exact "shape" of every record so nobody can save garbage in it. Each model is one box in the fridge.

---

#### `backend/src/models/index.js` — The model lobby

```js
import './user.model.js';
import './student.model.js';
// ... etc

export { default as User } from './user.model.js';
export { default as Student } from './student.model.js';
// ... etc
```

- This file "runs" every model file (importing them registers them with Mongoose) and then re-exports them all under short names.
- `export { default as User }` = "give me the default export of this file, and call it User".

**Why?** One convenient door to grab any model: `import { Student } from '../models/index.js'`. Also, just importing the files once here makes sure all models are registered before we use them.

---

#### `backend/src/utils/ApiError.js` — The custom "error box"

```js
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;               // e.g. 404 (not found), 401 (not logged in)
    this.errors = Array.isArray(errors) ? errors : [errors];
    this.isOperational = true;                  // a "normal" error, not a crash
    Error.captureStackTrace(this, this.constructor);
  }
}
```

- `class ... extends Error` = we build a special kind of error that carries a status code too.
- `constructor(...)` = the setup that runs when we create a new one: `new ApiError(404, 'Not found')`.
- `Array.isArray(errors) ? errors : [errors]` = "if they gave me a list, use it; if they gave me one item, wrap it in a list".
- `Error.captureStackTrace` = a trick to remember WHERE the error happened (useful for debugging).

**Why?** When a service finds a problem (like "student not found"), it throws a nice error with a status code, and the error handler knows what HTTP answer to send back.

---

#### `backend/src/utils/asyncHandler.js` — The error catcher

```js
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

- This is a **wrapper**. It takes a function `fn`, runs it, and if it fails, automatically passes the error to `next`.
- `next` is Express's "give the error to the error handler" button.
- `Promise.resolve(...)` makes sure we always have something to `.catch` on.

**Why?** Without this, every controller would need `try/catch` around everything. With it, we write clean controller code and errors are handled in one place.

---

#### `backend/src/utils/response.js` — The answer shaper

```js
const sendSuccess = (res, statusCode, data, message) => {
  res.status(statusCode).json({
    success: true,        // always true for success
    data,                 // the payload (the useful info)
    message: message || undefined,
    errors: [],
  });
};
```

- `res.status(statusCode)` = set the HTTP status (200 = ok, 201 = created).
- `.json({...})` = send the answer as JSON (the language computers use to talk).

There is also `sendError` which sends `success: false` with a message and a list of errors.

**Why?** Every answer from the server has the SAME shape: `{ success, data/message, errors }`. The frontend always knows what to expect.

---

#### `backend/src/utils/logger.js` — The message printer

```js
const write = (stream, level, message) => {
  const timestamp = new Date().toISOString();
  stream.write(`[${timestamp}] [${level.toUpperCase()}] ${message}\n`);
};
const logger = {
  info:  (message) => write(process.stdout, 'info', message),
  warn:  (message) => write(process.stderr, 'warn', message),
  error: (message) => write(process.stderr, 'error', message),
  // ...
};
```

- `process.stdout` = normal output screen. `process.stderr` = error output.
- It adds a timestamp and the level (INFO/WARN/ERROR) so the console is easy to read.

**Why?** Instead of sprinkling `console.log` everywhere, we have one nice logging helper.

---

#### `backend/src/middlewares/authenticate.js` — Checking the magic ID card

```js
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;           // read the "Authorization" line
  if (!authHeader || !authHeader.startsWith('Bearer ')) { // token must start with "Bearer "
    return res.status(401).json({ ... 'Missing or invalid Authorization header.' });
  }
  const token = authHeader.split(' ')[1];                 // take the token part after the space
  try {
    const decoded = jwt.verify(token, env.jwtSecret);     // check the card is genuine + not expired
    req.user = { userId: decoded.userId, role: decoded.role };  // remember WHO is asking
    next();                                               // all good → go to the next step
  } catch (err) {
    // if expired → "Token has expired", otherwise → "Invalid token" (both 401)
  }
};
```

- A **middleware** is a function that runs BEFORE the controller. It can stop the request or let it through with `next()`.
- `req` = the incoming request. `res` = the outgoing answer. `next` = "move to the next step".
- `req.headers.authorization` = a line in the request where the frontend puts `Bearer <token>`.
- `.split(' ')[1]` = cut the string at the space and take the second piece (the token itself).
- `jwt.verify` = the machine that checks if the card is real and not expired.

**Why?** We must know "who is knocking on the door" before letting them in. This middleware reads the card.

---

#### `backend/src/middlewares/authorize.js` — Checking the job title

```js
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) { ... 403 ... }
    if (!allowedRoles.includes(req.user.role)) { ... 403 ... }
    next();
  };
};
```

- `...allowedRoles` = this function accepts ANY number of role names: `authorize('admin')` or `authorize('admin', 'student')`.
- It checks: does this person's role appear in the allowed list? If not → 403 (forbidden).
- 403 = "I know who you are, but you are NOT allowed here." (401 = "I don't know who you are at all.")

**Why?** Only admins should manage students. Students should only see their own stuff. This bouncer enforces that.

---

#### `backend/src/middlewares/validate.js` — Checking the data

```js
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);          // collect all the problems found
  if (!errors.isEmpty()) {                       // if there is at least one problem
    return res.status(400).json({                // answer with 400 (bad request)
      success: false, message: 'Validation failed.',
      errors: errors.array().map((e) => e.msg),  // list only the messages
    });
  }
  next();
};
```

- `400` = "bad request" — the person sent something wrong.

Then there are "rule arrays" built with `express-validator`:

```js
const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
  handleValidationErrors,
];
```

- `body('email')` = look at the "email" field in the request body.
- `.isEmail()` = it must be a valid email. `.withMessage(...)` = if not, remember this message.
- `.isLength({ min: 8 })` = at least 8 characters.
- `.isMongoId()` = must be a valid database ID.
- `.isISO8601()` = must be a valid date. `.toDate()` = convert to a date object.
- `.optional()` = this field is allowed to be missing.
- `query('page')` / `param('id')` = same checks but for the URL query and URL parameters.

This file exports rule arrays for: login, create/update student, student ID, attendance (mark/update/query), students query, summary query.

**Why?** One file, many "bouncer rulebooks". Every route uses the right rulebook, and bad data is stopped before it reaches the controller.

---

#### `backend/src/middlewares/errorHandler.js` — The safety net at the end

```js
const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}`, errors: [] });
};
```

- If someone knocks on a door that doesn't exist, answer 404.

```js
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  // ... special cases:
  if (err.name === 'CastError')            → 400 "bad ObjectId"
  if (err.name === 'ValidationError')      → 400 "validation failed"
  if (err.code === 11000)                  → 409 "duplicate value" (someone took the email)
  if (err.name === 'JsonWebTokenError')    → 401 "invalid token"
  if (err.name === 'TokenExpiredError')    → 401 "token expired"
  if (statusCode >= 500) logger.error(...) // serious crash → log it
  res.status(statusCode).json({ success: false, message, errors });
};
```

- The signature has 4 things: `(err, req, res, next)`. Express knows: if a function has 4 parameters, it's an error handler (this one is special).
- `500` = "internal server error" (something crashed). `409` = conflict (duplicate).
- Express error names: `CastError` = wrong ID format, `ValidationError` = Mongoose found a problem, code `11000` = duplicate unique value.

**Why?** ALL errors in the app end up here (thanks to `asyncHandler` and `next`). One place decides the answer and the status code — the frontend always gets a clean, consistent error.

---

#### `backend/src/routes/index.js` — Connecting the maps

```js
const router = Router();
router.get('/health', (req, res) => {
  sendSuccess(res, 200, { status: 'ok', uptime: process.uptime() }, 'Server is healthy');
});
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/student', studentPortalRoutes);
export default router;
```

- `Router()` = Express's tool for making groups of URLs.
- `router.use('/students', studentRoutes)` = "all URLs starting with `/api/students` go to the student router."
- `/health` = a small "are you alive?" check. `process.uptime()` = how many seconds the server has been running.

**Why?** One central map. The app just does `app.use('/api', routes)` and everything is connected.

---

#### `backend/src/routes/auth.routes.js`

```js
router.post('/login', validateLogin, authController.login);
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);
```

- `POST /api/auth/login` → check data, then login.
- `GET /api/auth/me` → (must be logged in) who am I?
- `POST /api/auth/logout` → (must be logged in) say bye.

**Why?** Small map file just for login-related URLs. Notice middlewares (`validateLogin`, `authenticate`) sit in the middle between URL and controller.

---

#### `backend/src/routes/student.routes.js`

```js
router.use(authenticate, authorize('admin'));   // EVERYTHING here needs an admin
router.post('/', validateStudentCreate, studentController.createStudent);   // add a student
router.get('/', validateStudentsQuery, studentController.getStudents);     // list students
router.get('/:id', validateStudentId, studentController.getStudentById);   // one student
router.put('/:id', validateStudentUpdate, studentController.updateStudent); // edit
router.delete('/:id', validateStudentId, studentController.deleteStudent); // remove
router.get('/:id/attendance', validateStudentId, studentController.getStudentAttendance); // their attendance
```

- `router.use(authenticate, authorize('admin'))` = before ANY of the URLs below run, first check login AND admin role.
- `/:id` = a URL placeholder. The actual ID lands in `req.params.id`.

**Why?** Admin-only management of students.

---

#### `backend/src/routes/attendance.routes.js`

```js
router.use(authenticate, authorize('admin'));
router.post('/', validateAttendanceMark, attendanceController.markAttendance);   // mark present/absent
router.get('/', validateAttendanceQuery, attendanceController.getAttendance);   // list with filters
router.put('/:id', validateAttendanceUpdate, attendanceController.updateAttendance); // fix a mistake
router.get('/summary', validateAttendanceSummaryQuery, attendanceController.getAttendanceSummary); // totals
```

**Why?** Admin marks attendance. Note: `/summary` must be defined BEFORE `/:id`-style routes (otherwise "summary" would be treated as an ID).

---

#### `backend/src/routes/studentPortal.routes.js`

```js
router.use(authenticate, authorize('student'));   // only students
router.get('/profile', ...getProfile);
router.get('/attendance', ...getAttendance);
router.get('/team', ...getTeam);
router.get('/tasks', ...getTasks);
```

**Why?** Students can only see THEIR OWN info. The controllers below find the student by the logged-in user's ID.

---

#### `backend/src/controllers/*.js` — The managers

A controller is a THIN manager: it takes the request, calls the right service, and sends the answer. It does NOT do heavy logic itself.

##### `auth.controller.js`

```js
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;          // take email+password out of the request
  const result = await authService.login(email, password);  // ask the service to check
  sendSuccess(res, 200, result, 'Login successful');
});
```

- `req.body` = the data the frontend sent (we take it apart with `{ email, password }` — this is called **destructuring**).
- `getMe` → asks service for the current user.
- `logout` → just says "ok, delete the token on your side." (The server itself keeps no sessions — that's a design choice.)

**Why?** The manager tells the cook what to do and plates the dish.

##### `student.controller.js` and `attendance.controller.js` and `studentPortal.controller.js`

Same pattern — each function:

```js
const getStudents = asyncHandler(async (req, res) => {
  const { search, batch, teamId, page, limit } = req.query;   // read filter boxes from the URL
  const result = await studentService.getStudents({ search, batch, teamId }, { page: Number(page) || 1, limit: Number(limit) || 10 });
  sendSuccess(res, 200, result, 'Students retrieved successfully');
});
```

- `req.query` = the "?" part of the URL, like `/api/students?search=Ali&page=2`.
- The controller reads inputs, calls the service, sends the result.

`studentPortal.controller.js` uses `req.user.userId` (which `authenticate` put there) to fetch the student's own data.

**Why?** Controllers keep the code organized: they are the middle men between routes and services.

---

#### `backend/src/services/*.js` — The cooks (real logic)

##### `auth.service.js`

```js
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },  // what goes inside the card
    env.jwtSecret,                                     // the secret "ink"
    { expiresIn: env.jwtExpiresIn }                    // valid for 7 days
  );
};

const login = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase() }); // find by email
  if (!user) throw new ApiError(401, 'Invalid credentials.', ['Invalid email or password.']);
  const isMatch = await bcrypt.compare(password, user.passwordHash); // compare typed password with stored hash
  if (!isMatch) throw new ApiError(401, 'Invalid credentials.', ['Invalid email or password.']);
  const token = generateToken(user);                   // success → mint the ID card
  return { token, user: { id, email, role } };
};
```

- `bcrypt.compare` = the magic that checks a typed password against the scrambled stored one WITHOUT needing the original. Only the person with the right password produces a match.
- `jwt.sign` = create the card and sign it with the secret.
- `throw new ApiError(...)` = "something is wrong — stop and raise a red flag" (caught by `asyncHandler` → `errorHandler`).

Other helpers: `createUser`, `findUserByEmail`, `findUserById`, `updateUserPassword` — small database helpers used by other parts later.

**Why?** The service knows how to log people in safely. The controller stays thin.

##### `student.service.js`

```js
const createStudent = async (data) => {
  const { name, email, password, phone, batch, teamId } = data;
  // 1) check email not already used (both User and Student tables)
  // 2) bcrypt.hash the password
  // 3) start a TRANSACTION: a transaction = "do these saves together; if one fails, undo all"
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.create([{ ... }], { session });   // create login account
    const student = await Student.create([{ userId: user[0]._id, ... }], { session }); // create student linked to it
    await session.commitTransaction();   // save everything for real
    return student[0];
  } catch (err) {
    await session.abortTransaction();    // something failed → undo everything
    throw err;
  }
};
```

- **Transaction** = "all-or-nothing". If creating the User works but creating the Student fails, we undo the User too. No half-finished records.

```js
const getStudents = async (filters = {}, pagination = {}) => {
  const query = {};
  if (search) query.$or = [ { name: { $regex: search, $options: 'i' } }, { email: { $regex: ... } }, ... ];
  if (batch) query.batch = batch;
  if (teamId) query.teamId = teamId;
  const skip = (page - 1) * limit;
  const [students, total] = await Promise.all([
    Student.find(query).populate('teamId', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Student.countDocuments(query),
  ]);
  return { students, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};
```

- `$regex` with `$options: 'i'` = "find parts of the name that contain the search text, not case-sensitive".
- `populate('teamId', 'name')` = follow the link to the Team and bring back its `name` (instead of just an ID).
- `.sort({ createdAt: -1 })` = newest first. `.skip(skip).limit(limit)` = pagination (page 2 = skip the first 10).
- `.lean()` = return plain objects instead of heavy Mongoose objects (faster).
- `Promise.all([...])` = run the two database queries at the same time, then wait for both.
- `Math.ceil(total / limit)` = how many pages there are, rounded up.

`updateStudent`:
- First checks the new email isn't already used by another student or user.
- `Student.findByIdAndUpdate(id, {...}, { new: true, runValidators: true })` = update, return the NEW version (`new: true`), and re-check rules (`runValidators`).
- If email changed, it also updates the linked User's email.

`deleteStudent`:
- Finds the student, deletes the student, deletes their linked User, and deletes ALL their attendance records. Clean-up everywhere.

`getStudentAttendance`:
- Finds all attendance for the student, then counts present/absent, computes percentage: `(present / totalDays) * 100`, rounded to 2 decimals with `.toFixed(2)`.

`findStudentByUserId` = used by the student portal: given a User ID, find their Student record.

##### `attendance.service.js`

```js
const markAttendance = async ({ studentId, date, status, markedBy }) => {
  const student = await Student.findById(studentId);      // make sure the student exists
  if (!student) throw new ApiError(404, ...);
  const attendanceDate = new Date(date);
  attendanceDate.setHours(0, 0, 0, 0);                    // reset time to midnight
  const attendance = await Attendance.findOneAndUpdate(
    { studentId, date: attendanceDate },   // find THIS student on THIS day
    { status, markedBy },                  // set these values
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).populate('studentId', 'name email').populate('markedBy', 'email');
  return attendance;
};
```

- `setHours(0,0,0,0)` = midnight — so "2026-08-09 15:00" and "2026-08-09 09:00" are treated as the same day.
- `upsert: true` = "update if found, otherwise INSERT (create) it". That's how marking twice doesn't create duplicates.

`getAttendance` — uses an **aggregation pipeline** (a chain of steps in MongoDB):
- `$match` = filter records.
- `$lookup` = join with the students collection (bring in student info).
- `$unwind` = spread the joined array.
- `$match` again = now filter by student's batch.
- `$sort`, `$skip`, `$limit` = pagination.
- `$project` = pick only the fields we want, renaming them.

It runs two pipelines at once (Promise.all): one for the page of records, one counting the total.

`getAttendanceSummary` — a bigger pipeline that `$group`s by student and computes:
- `$sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }` = "if status is present add 1, else add 0" (counting presents).
- percentage = `(present / totalDays) * 100` computed inside MongoDB.
- Then it also computes OVERALL totals for everyone (using `.reduce` — walk over the list and add up).

```js
const overallPresent = summary.reduce((sum, s) => sum + s.present, 0);
```
This loops through each student `s` and keeps a running total `sum` starting at 0.

##### `studentPortal.service.js`

All four functions first find the Student via `Student.findOne({ userId })` (link to the logged-in user), then return profile / attendance / team / tasks for THAT student only. `getStudentTeam` follows the team link fully (`populate('teamId')`) so the whole team object comes back.

---

#### `backend/src/app.js` — Setting up the kitchen

```js
const app = express();
app.use(helmet());        // safety headers
app.use(cors());          // allow the frontend to talk to us
app.use(express.json());  // understand JSON bodies sent by frontend
app.use(morgan('dev'));   // log every request
app.use('/api', routes);  // all routes hang under /api
app.use(notFound);        // if no route matched → 404
app.use(errorHandler);    // any error → nice answer
export default app;
```

- `app.use(something)` = "use this for every request that passes through".
- `express.json()` = the decoder that turns JSON text into a JavaScript object in `req.body`.

**Why?** The `app` is the actual web server object. We build it here (middlewares + routes) and hand it to `server.js` to start.

---

#### `backend/src/server.js` — The front door (starting the server)

```js
process.on('unhandledRejection', (err) => { ... process.exit(1); });
process.on('uncaughtException', (err) => { ... process.exit(1); });
```

- These are like fire alarms: if a promise fails without being caught, or a crash happens, log it and stop (so we notice the problem).

```js
const start = async () => {
  await connectDB();                    // first: connect to the fridge
  app.listen(env.port, () => {          // then: open the restaurant door
    logger.info(`API server running at http://localhost:${env.port}`);
  });
};
start();
```

- `app.listen(port, callback)` = start listening for requests on that door number. The callback prints a message when ready.

**Why?** This file is what `npm start` runs. Order matters: connect to DB first, then start listening.

---

#### `backend/src/seed.js` — Creating the first admin

```js
const ADMIN_EMAIL = 'admin@lms.com';
const ADMIN_PASSWORD = 'password123';
const seedAdmin = async () => {
  await connectDB();
  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) { logger.info('Admin user already exists. Skipping seed.'); process.exit(0); }
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, env.bcryptRounds);
  await User.create({ email: ADMIN_EMAIL, passwordHash, role: 'admin' });
  logger.info(`Admin user seeded: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  process.exit(0);
};
seedAdmin();
```

**Why?** On a fresh database there is no admin. You run `npm run seed` once and you get a login: `admin@lms.com` / `password123`. It will not run twice (it skips if the admin already exists).

---

### 5.2 Frontend

#### `frontend/index.html` — The empty page

```html
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
```

- A nearly empty HTML page with one `<div id="root">` (an empty box) and a script that loads the React code. React fills that box.

**Why?** Browsers need at least one HTML file. React takes over inside `<div id="root">`.

#### `frontend/vite.config.js` — The dev server settings

```js
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },   // the frontend lives at http://localhost:5173
});
```

#### `frontend/.env.example` — Example secret settings

```
VITE_API_URL=http://localhost:5000/api
```

- Tells us what the real `.env` file should contain (the address of the backend). Vite exposes `VITE_`-prefixed variables to the frontend.

#### `frontend/src/main.jsx` — THE start of the frontend

```jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
```

- `createRoot(...).render(...)` = tell React "take over this empty box and draw the app".
- `<React.StrictMode>` = a development helper that double-checks our code for mistakes.
- `<BrowserRouter>` = "we are using the browser URL for navigation".
- `<ThemeProvider>` = turns dark/light mode on (reads `localStorage`, falls back to the OS setting).
- `<AuthProvider>` = remembers who is logged in (token + user) and shares it with the whole app.

**Why?** This is the "ignition" of the frontend — it connects routing, auth, and theming, then starts the app.

#### `frontend/src/App.jsx` — The page map

```jsx
import AppRoutes from './routes/AppRoutes';
import { ToastProvider } from './components/ui/Toast';

function App() {
  return (
    <>
      <AppRoutes />
      <ToastProvider />
    </>
  );
}
```

- `<AppRoutes />` = the URL → page map (defined in `routes/AppRoutes.jsx`, with `ProtectedRoute` wrapping admin/student pages).
- `<ToastProvider />` = the pop-up notification machine from `sonner`, styled with our theme tokens.

**Why?** `App` is the outer shell of the frontend: it renders the correct page for the current URL and shows toasts.

#### `frontend/src/context/` — The memory boxes (React context)

`ThemeContext.jsx` + `theme-context.js` + `useTheme.js` — dark/light mode:

```jsx
useEffect(() => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('lms-theme', theme);
}, [theme]);
```

- Puts a `dark` class on the page when dark mode is on; `index.css` then swaps to its dark color tokens.
- `useTheme()` gives any component `{ theme, toggleTheme }` (used by the layouts' user menu).

`AuthContext.jsx` — who is logged in: keeps the token + user and exposes `login`, `logout`, and `useAuth()`.

#### `frontend/src/services/apiClient.js` — The messenger

```js
const apiClient = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', headers: {...} });

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) localStorage.removeItem('token');
    return Promise.reject(error);
  }
);
```

- `axios.create(...)` = one configured messenger that already knows the backend address.
- `interceptors` = hooks that run on EVERY request/response automatically.
  - **Request interceptor**: before sending, grab the token from `localStorage` (the browser's small storage) and add `Authorization: Bearer <token>`.
  - **Response interceptor**: if the answer is 401 (not logged in / token expired), delete the saved token.
- `error.response?.status` = "the `.`?` means: if error.response is missing, don't crash, just give undefined."

**Why?** Every component uses this ONE messenger. Nobody repeats token logic; it's automatic.

---

### 5.3 The other folders (quickly)

- **`design/`** — Hand-written HTML mock-ups of every screen (login, dashboard, students, etc.). They are ONLY design drafts (looks) — they don't yet talk to the backend. They show how the final pages should look.
- **`docs/`** — All project documents: plans, database design, API contracts, setup guide, git workflow, coding standards.
- **`q`** — a small file (possibly a note). It is not part of the running code.
- **`CODEOWNERS`** — a Git file that says which people are responsible for which parts of the code.
- **`.gitkeep`** — an empty file whose ONLY job is to let Git keep an empty folder in the repository (Git ignores empty folders otherwise). The folders themselves (`pages`, `components`, etc.) are waiting for future code.

---

## Part 6 — Small Words (Syntax) Cheat Sheet

| Word / symbol | What it means (simple) |
|---|---|
| `import ... from '...'` | "Bring this tool/library in to use it." |
| `export default ...` | "Give this thing to other files." |
| `const` | A box (variable) that cannot be re-declared. |
| `(a, b) => ...` | An arrow function — a short way to write a function. |
| `function name(...) {...}` | A normal named function. |
| `async` / `await` | "This does slow work; wait for it." |
| `try { } catch (err) { }` | Safety net: try the risky thing; if it breaks, do this. |
| `throw new ApiError(...)` | Raise a red flag with an error. |
| `req` / `res` | Incoming request / outgoing response. |
| `next()` | "OK, move to the next middleware/route." |
| `module` | "A separate file of code." |
| `Schema` | The shape of a database record (its form). |
| `Model` | A saved version of the schema that we use to save/find data. |
| `ObjectId` + `ref` | A link to another record (like a reference number). |
| `populate(...)` | Follow the link and bring the actual data back. |
| `findOne`, `find`, `findById`, `create`, `findByIdAndUpdate`, `deleteMany` | The main "ask the fridge" commands of Mongoose. |
| `.lean()` | "Return plain data, not the heavy wrapper" (faster). |
| `req.body` | The data sent in the body of the request. |
| `req.params` | The `:id` parts from the URL. |
| `req.query` | The `?search=...` parts from the URL. |
| `status 200/201/400/401/403/404/409/500` | 200=ok, 201=created, 400=bad request, 401=not logged in, 403=forbidden, 404=not found, 409=conflict (duplicate), 500=server crashed. |
| `process.env.X` | Ask the computer's environment for setting X. |
| `process.exit(0/1)` | Stop the program (0=normal, 1=error). |
| `??` / `?.` | `?.`="if this is missing, don't crash", `??`="if this is empty/null, use the other one". |
| `...rest` / `...allowedRoles` | "Spread/collect the rest" — catch remaining items. |

---

## Part 7 — How to Run the Whole Project

**Backend (the kitchen):**
```
cd backend
npm install        # download all backend libraries
npm run seed       # (once) creates the admin user
npm run dev        # starts the server on http://localhost:5000
```

**Frontend (the waiter):**
```
cd frontend
npm install        # download all frontend libraries
npm run dev        # starts the app on http://localhost:5173
```

Then open http://localhost:5173 in the browser. Log in as `admin@lms.com` / `password123`.

---

## Part 8 — One-Second Summary

- **Frontend (React + friends)** = the screen; uses `axios` to talk to the backend.
- **Backend (Express + friends)** = the brain; uses `mongoose` to store data in MongoDB.
- **Middlewares** = bouncers (check token, check role, check data, handle errors).
- **Routes** = the URL map. **Controllers** = managers. **Services** = cooks. **Models** = fridge shapes.
- Every answer is shaped the same: `{ success, data/message, errors }`.
- Passwords are scrambled with `bcrypt`. Logins give a `JWT` token. Admin manages students & attendance; students see their own info only.

That's the whole project, explained simply. You're welcome!
