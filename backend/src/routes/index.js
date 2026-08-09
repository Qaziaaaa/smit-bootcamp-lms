import { Router } from 'express';
import { sendSuccess } from '../utils/response.js';
import authRoutes from './auth.routes.js';
import studentRoutes from './student.routes.js';
import attendanceRoutes from './attendance.routes.js';
import studentPortalRoutes from './studentPortal.routes.js';
import teamRoutes from './team.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  sendSuccess(res, 200, { status: 'ok', uptime: process.uptime() }, 'Server is healthy');
});

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/student', studentPortalRoutes);
router.use('/teams', teamRoutes);

export default router;
