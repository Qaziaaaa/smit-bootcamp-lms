// Auth routes — login, logout, password management.
// POST /login — public (no auth needed)
// GET /me, POST /logout, POST /change-password — requires any authenticated user
// POST /reset-student-password — admin only
import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import { validateLogin, validateChangePassword, validateResetStudentPassword } from '../middlewares/validate.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';

const router = Router();

router.post('/login', validateLogin, authController.login);
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);
router.post('/change-password', authenticate, validateChangePassword, authController.changePassword);
router.post('/reset-student-password', authenticate, authorize('admin'), validateResetStudentPassword, authController.resetStudentPassword);

export default router;
