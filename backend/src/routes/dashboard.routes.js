import { Router } from 'express';
import dashboardController from '../controllers/dashboard.controller.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', dashboardController.getDashboard);

export default router;
