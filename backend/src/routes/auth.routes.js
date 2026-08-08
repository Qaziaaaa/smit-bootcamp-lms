import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import { validateLogin } from '../middlewares/validate.js';
import authenticate from '../middlewares/authenticate.js';

const router = Router();

router.post('/login', validateLogin, authController.login);
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);

export default router;