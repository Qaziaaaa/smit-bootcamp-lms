import { Router } from 'express';
import studentPortalController from '../controllers/studentPortal.controller.js';
import { validateTaskProgress } from '../middlewares/validate.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';

const router = Router();

router.use(authenticate, authorize('student'));

router.get('/profile', studentPortalController.getProfile);
router.get('/attendance', studentPortalController.getAttendance);
router.get('/team', studentPortalController.getTeam);
router.get('/tasks', studentPortalController.getTasks);
router.get('/projects', studentPortalController.getProjects);
router.get('/projects/:id', studentPortalController.getProjectById);
router.put('/tasks/:id/progress', validateTaskProgress, studentPortalController.updateTaskProgress);

export default router;