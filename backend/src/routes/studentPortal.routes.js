import { Router } from 'express';
import studentPortalController from '../controllers/studentPortal.controller.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';
import { validateTaskStatusUpdate } from '../middlewares/validate.js';

const router = Router();

router.use(authenticate, authorize('student'));

router.get('/profile', studentPortalController.getProfile);
router.get('/attendance', studentPortalController.getAttendance);
router.get('/team', studentPortalController.getTeam);
router.get('/tasks', studentPortalController.getTasks);
router.put('/tasks/:id/progress', validateTaskStatusUpdate, studentPortalController.updateTaskProgress);

export default router;