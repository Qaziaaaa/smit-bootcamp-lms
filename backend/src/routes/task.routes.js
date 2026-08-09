import { Router } from 'express';
import taskController from '../controllers/task.controller.js';
import { validateTasksQuery, validateTaskId } from '../middlewares/validate.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', validateTasksQuery, taskController.getTasks);
router.get('/:id', validateTaskId, taskController.getTaskById);

export default router;
