import { Router } from 'express';
import projectController from '../controllers/project.controller.js';
import { validateProjectsQuery, validateProjectId, validateProjectCreate } from '../middlewares/validate.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', validateProjectsQuery, projectController.getProjects);
router.post('/', validateProjectCreate, projectController.createProject);
router.get('/:id', validateProjectId, projectController.getProjectById);

export default router;
