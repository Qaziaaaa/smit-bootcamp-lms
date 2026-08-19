// Central router — mounts all feature routers under /api.
import { Router } from 'express';
import { sendSuccess } from '../utils/response.js';
import authRoutes from './auth.routes.js';
import studentRoutes from './student.routes.js';
import attendanceRoutes from './attendance.routes.js';
import studentPortalRoutes from './studentPortal.routes.js';
import teamRoutes from './team.routes.js';
import projectRoutes from './project.routes.js';
import taskRoutes from './task.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import batchRoutes from './batch.routes.js';

const router = Router();

// Health check endpoint (used by load balancers / monitoring)
router.get('/health', (req, res) => {
  sendSuccess(res, 200, { status: 'ok', uptime: process.uptime() }, 'Server is healthy');
});

// Feature routes — each one handles a specific domain
// Hakim — auth, students, attendance
// Shafqat — teams, projects, tasks, dashboard, batches, studentPortal
router.use('/auth', authRoutes);              // Hakim — login, register, change-password
router.use('/students', studentRoutes);       // Hakim — admin CRUD for students
router.use('/attendance', attendanceRoutes);  // Hakim — admin mark/view attendance
router.use('/student', studentPortalRoutes);  // Shafqat — student self-service (profile, tasks, team)
router.use('/teams', teamRoutes);             // Shafqat — admin manage teams
router.use('/projects', projectRoutes);       // Shafqat — admin manage projects
router.use('/tasks', taskRoutes);             // Shafqat — admin manage tasks
router.use('/dashboard', dashboardRoutes);    // Shafqat — admin dashboard stats
router.use('/batches', batchRoutes);          // Shafqat — admin manage batches

export default router;
