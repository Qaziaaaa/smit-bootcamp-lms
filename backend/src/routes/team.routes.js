import { Router } from 'express';
import teamController from '../controllers/team.controller.js';
import { validateTeamsQuery } from '../middlewares/validate.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', validateTeamsQuery, teamController.getTeams);

export default router;
