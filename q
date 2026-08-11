[1mdiff --git a/backend/.env.example b/backend/.env.example[m
[1mindex d42648e..1ff06d5 100644[m
[1m--- a/backend/.env.example[m
[1m+++ b/backend/.env.example[m
[36m@@ -1,5 +1,5 @@[m
 PORT=5000[m
[31m-MONGO_URI=mongodb://127.0.0.1:27017/lms[m
[31m-JWT_SECRET=change-me-to-a-long-random-string[m
[32m+[m[32mMONGO_URI=[m
[32m+[m[32mJWT_SECRET=[m
 JWT_EXPIRES_IN=7d[m
 BCRYPT_ROUNDS=10[m
[1mdiff --git a/backend/package.json b/backend/package.json[m
[1mindex ba7ab58..6029dbb 100644[m
[1m--- a/backend/package.json[m
[1m+++ b/backend/package.json[m
[36m@@ -6,7 +6,8 @@[m
   "type": "module",[m
   "scripts": {[m
     "start": "node src/server.js",[m
[31m-    "dev": "nodemon src/server.js"[m
[32m+[m[32m    "dev": "nodemon src/server.js",[m
[32m+[m[32m    "seed": "node src/seed.js"[m
   },[m
   "dependencies": {[m
     "bcryptjs": "^2.4.3",[m
[1mdiff --git a/backend/src/routes/index.js b/backend/src/routes/index.js[m
[1mindex 96135a0..25f390e 100644[m
[1m--- a/backend/src/routes/index.js[m
[1m+++ b/backend/src/routes/index.js[m
[36m@@ -1,5 +1,9 @@[m
 import { Router } from 'express';[m
 import { sendSuccess } from '../utils/response.js';[m
[32m+[m[32mimport authRoutes from './auth.routes.js';[m
[32m+[m[32mimport studentRoutes from './student.routes.js';[m
[32m+[m[32mimport attendanceRoutes from './attendance.routes.js';[m
[32m+[m[32mimport studentPortalRoutes from './studentPortal.routes.js';[m
 [m
 const router = Router();[m
 [m
[36m@@ -7,4 +11,9 @@[m [mrouter.get('/health', (req, res) => {[m
   sendSuccess(res, 200, { status: 'ok', uptime: process.uptime() }, 'Server is healthy');[m
 });[m
 [m
[32m+[m[32mrouter.use('/auth', authRoutes);[m
[32m+[m[32mrouter.use('/students', studentRoutes);[m
[32m+[m[32mrouter.use('/attendance', attendanceRoutes);[m
[32m+[m[32mrouter.use('/student', studentPortalRoutes);[m
[32m+[m
 export default router;[m
