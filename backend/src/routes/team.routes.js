import { Router } from 'express';
import teamController from '../controllers/team.controller.js';
import { validateTeamsQuery, validateTeamId, validateTeamCreate, validateTeamUpdate } from '../middlewares/validate.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', validateTeamsQuery, teamController.getTeams);
router.post('/', validateTeamCreate, teamController.createTeam);
router.get('/:id', validateTeamId, teamController.getTeamById);
router.put('/:id', validateTeamUpdate, teamController.updateTeam);
router.delete('/:id', validateTeamId, teamController.deleteTeam);

export default router;
