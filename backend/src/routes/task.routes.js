import { Router } from 'express';
import taskController from '../controllers/task.controller.js';
import { validateTasksQuery, validateTaskId, validateTaskCreate } from '../middlewares/validate.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', validateTasksQuery, taskController.getTasks);
router.post('/', validateTaskCreate, taskController.createTask);
router.get('/:id', validateTaskId, taskController.getTaskById);

export default router;
