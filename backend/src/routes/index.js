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
router.use('/auth', authRoutes);              // login, register, change-password
router.use('/students', studentRoutes);       // admin CRUD for students
router.use('/attendance', attendanceRoutes);  // admin mark/view attendance
router.use('/student', studentPortalRoutes);  // student self-service (profile, tasks, team)
router.use('/teams', teamRoutes);             // admin manage teams
router.use('/projects', projectRoutes);       // admin manage projects
router.use('/tasks', taskRoutes);             // admin manage tasks
router.use('/dashboard', dashboardRoutes);    // admin dashboard stats
router.use('/batches', batchRoutes);          // admin manage batches

export default router;
