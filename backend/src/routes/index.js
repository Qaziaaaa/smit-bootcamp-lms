import { Router } from 'express';
import { sendSuccess } from '../utils/response.js';
import studentRoutes from './student.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  sendSuccess(res, 200, { status: 'ok', uptime: process.uptime() }, 'Server is healthy');
});

router.use('/students', studentRoutes);

export default router;
