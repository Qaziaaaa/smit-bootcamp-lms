# LMS Project — Libraries Guide

Complete list of every library used, what it does, and why we chose it over alternatives.

---

## Frontend Libraries

### 1. React (v19)
**What:** Core UI library — build interfaces with components.
**Why:** Industry standard. Largest ecosystem, most jobs, most community support. Every other option (Vue, Angular, Svelte) has smaller ecosystem.

### 2. React Router DOM (v7)
**What:** Client-side routing — changes pages without full page reload (SPA).
**Why:** Standard for React. Alternatives like TanStack Router are newer with less community support.

### 3. Tailwind CSS (v4)
**What:** Utility-first CSS framework — style with classes like `bg-blue-500 p-4 rounded-lg`.
**Why vs MUI/Ant Design:** Tailwind gives 100% design control. No pre-built components forcing a look. Our design matches SMIT's portal exactly.
**Why vs plain CSS:** No naming wars (`btn-primary` vs `button-primary`), no CSS file sprawl, faster to write.
**Interview answer:** *"Tailwind lets us build exactly what the design requires. MUI forces its own Material Design look that would clash with SMIT's branding."*

### 4. Radix UI (dialog, dropdown-menu, checkbox, label, progress, slot, tooltip)
**What:** Unstyled, accessible UI primitives. Builds modals, dropdowns, checkboxes that work with screen readers.
**Why vs MUI Dialog / Headless UI:** Radix is unstyled (we add Tailwind), zero bundle overhead (only import what you use), best accessibility out of the box.
**Interview answer:** *"Radix gives us accessibility for free — keyboard navigation, ARIA labels, focus trapping — without the bundle size of MUI. We style it with Tailwind so it matches our design exactly."*

### 5. shadcn/ui pattern (our `components/ui/` folder)
**What:** Not a library — it's a pattern of copy-pasting Radix + Tailwind components into your project.
**Why vs installing shadcn as a package:** We own the code. We can modify any component. No version updates breaking things.
**Why vs MUI:** MUI is ~200KB+ bundled. Our kit is ~10KB because we only have what we use.
**Interview answer:** *"We followed the shadcn pattern — copied component source into our codebase. This means zero runtime dependency, full control over styling, and much smaller bundle size than MUI or Ant Design."*

### 6. TanStack Table (v9)
**What:** Headless table library — handles sorting, filtering, pagination, column resizing.
**Why vs AG Grid / MUI Table:** TanStack Table is headless (no UI opinions), framework-agnostic, and the most popular React table library. AG Grid is overkill for our needs. MUI Table comes with MUI dependency.
**Interview answer:** *"TanStack Table handles the hard parts — pagination, sorting, filtering — while we style it with Tailwind. It's headless so we keep full design control."*

### 7. Zod (v4)
**What:** Runtime schema validation — validates form inputs and API data.
**Why vs Yup / Joi:** Zod has TypeScript-first design, smaller bundle, and better error messages. Works without TypeScript too.
**Interview answer:** *"Zod validates forms on submit and catches bad API data at runtime. It's smaller than Yup and has better TypeScript support."*

### 8. Axios (v1.19)
**What:** HTTP client — makes API calls to backend.
**Why vs fetch API:** Axios has automatic JSON parsing, request/response interceptors (we use these for JWT auto-attach and 401 auto-logout), cleaner error handling. Fetch requires manual `.json()` and more boilerplate.
**Interview answer:** *"Axios interceptors let us attach the JWT token to every request automatically and redirect to login on 401 — with fetch we'd have to write this in every API call."*

### 9. React Hot Toast (v2.6)
**What:** Toast notifications — "Student created!", "Login failed".
**Why vs Notistack / react-toastify:** Smallest bundle (~3KB), simplest API, no config needed. react-toastify is 3x larger.

### 10. Lucide React (v1.30)
**What:** Icon library — 1500+ SVG icons.
**Why vs React Icons / Font Awesome:** Tree-shakable (only bundle icons you use), consistent line style, smaller than Font Awesome, better React integration than react-icons.
**Interview answer:** *"Lucide is tree-shakable — if we only use 10 icons, only those 10 are bundled. Font Awesome bundles the entire icon set."*

### 11. clsx + tailwind-merge
**What:** `clsx` joins conditional class names. `tailwind-merge` resolves Tailwind conflicts (e.g., `p-4 p-2` becomes `p-2`).
**Why:** Together they power our `cn()` utility. Without `tailwind-merge`, conflicting Tailwind classes would produce unpredictable styles.
**Interview answer:** *"The `cn()` function combines clsx for conditional classes and tailwind-merge to resolve conflicts. It's the standard pattern used by shadcn/ui."*

### 12. Vite (v8)
**What:** Build tool — dev server + production bundling.
**Why vs Webpack / Create React App:** Vite is 10-100x faster in dev (uses ESM, no bundling in dev). CRA is deprecated. Webpack config is complex.
**Interview answer:** *"Vite starts in under 1 second vs CRA's 30+ seconds. It uses native ES modules in dev so changes are instant. CRA is officially deprecated."*

### 13. OxLint (dev)
**What:** Linter — catches code errors (unused vars, React hook rules).
**Why vs ESLint:** OxLint is written in Rust — 50-100x faster than ESLint. For our 2 rules, it's instant.

---

## Backend Libraries

### 14. Express (v4)
**What:** Web framework — handles routes, middleware, HTTP requests.
**Why vs Fastify / Koa:** Express has the largest ecosystem (1000+ middleware), most tutorials, most job market demand. Fastify is faster but our DB is the bottleneck, not the framework.
**Interview answer:** *"Express is the most widely used Node.js framework. Our bottleneck is MongoDB queries, not HTTP handling, so Express's ecosystem advantage matters more than Fastify's speed edge."*

### 15. Mongoose (v8)
**What:** MongoDB ODM — defines schemas, validates data, builds queries.
**Why vs Prisma / raw MongoDB:** Mongoose is MongoDB-native (Prisma is multi-DB but adds overhead). Schema validation at the DB level, middleware hooks (pre-save for hashing), mature ecosystem.
**Interview answer:** *"Mongoose gives us schema validation directly on MongoDB. Prisma would add an extra layer we don't need since we're only using MongoDB."*

### 16. bcryptjs (v2.4)
**What:** Password hashing — converts `admin12345` to irreversible hash.
**Why vs bcrypt (native):** bcryptjs is pure JavaScript — no native compilation issues on Windows/Mac. Same security (same bcrypt algorithm). Slightly slower but negligible for our use case.
**Interview answer:** *"bcryptjs is pure JS so it installs everywhere without build tools. The bcrypt algorithm is identical — same security, just no native C++ dependency."*

### 17. jsonwebtoken (v9)
**What:** JWT creation + verification — issues tokens on login, verifies on every request.
**Why vs session-based auth:** JWTs are stateless — server doesn't store sessions. Works across multiple server instances. No session store needed (Redis etc).
**Interview answer:** *"JWTs are stateless — the token itself contains the user info. No need for a session store like Redis, which keeps our architecture simple."*

### 18. express-validator (v7)
**What:** Input validation — checks request body/params before processing.
**Why vs Joi / Zod on backend:** express-validator is Express-native (middleware pattern), lighter than Joi, and validates at the route level where it belongs.
**Interview answer:** *"express-validator runs as Express middleware before the controller — invalid requests never reach our business logic. It's lighter than Joi and purpose-built for Express."*

### 19. helmet (v7)
**What:** Security headers — sets X-Content-Type-Options, X-Frame-Options, etc.
**Why:** One line of code prevents 15+ common attacks. No reason NOT to use it.

### 20. cors (v2.8)
**What:** Cross-origin resource sharing — allows frontend (port 5173) to call backend (port 5000).
**Why:** Without this, browser blocks API calls from different ports. Required for any frontend+backend on different ports.

### 21. morgan (v1.10)
**What:** HTTP request logger — prints `GET /api/students 200 12ms` to console.
**Why:** Essential for debugging during development. One line of code.

### 22. multer (v2.2)
**What:** File upload handling — processes CSV file uploads for bulk student import.
**Why:** Standard for Express file uploads. Our only upload use case is CSV import.

### 23. csv-parse (v7)
**What:** Parses CSV files into JavaScript objects.
**Why vs Papa Parse:** csv-parse is streaming-based (handles large files), works in Node.js (Papa Parse is browser-focused).

### 24. dotenv (v16)
**What:** Loads `.env` file into `process.env`.
**Why:** Keeps secrets (DB URI, JWT key) out of code. Standard practice.

---

## Quick Comparison Table (for interview)

| If asked... | Answer |
|---|---|
| Why Tailwind not MUI? | Full design control, 10KB vs 200KB+ bundle, matches SMIT branding |
| Why shadcn not MUI? | Own the code, no runtime dependency, modify freely, much smaller |
| Why Radix not Headless UI? | Better accessibility, more primitives, better maintained |
| Why Vite not CRA? | CRA deprecated, Vite 100x faster |
| Why Axios not fetch? | Interceptors for JWT + auto-logout, cleaner API |
| Why Zod not Yup? | Smaller, TypeScript-first, better errors |
| Why Express not Fastify? | Largest ecosystem, our bottleneck is DB not HTTP |
| Why Mongoose not Prisma? | MongoDB-native, no extra abstraction layer needed |
| Why JWT not sessions? | Stateless, no session store, simpler architecture |

---

## Bundle Size Comparison

| Choice | Size | Alternative | Size | Savings |
|---|---|---|---|---|
| Tailwind | ~10KB | MUI | ~200KB+ | 95% smaller |
| shadcn pattern | ~10KB | MUI components | ~200KB+ | 95% smaller |
| React Hot Toast | ~3KB | react-toastify | ~15KB | 80% smaller |
| Lucide | tree-shaken | Font Awesome | ~80KB full | only what we use |
| Zod | ~14KB | Yup | ~45KB | 70% smaller |
| bcryptjs | ~30KB | bcrypt (native) | ~30KB | same size, no native deps |
