import { Router } from 'express';
import { authRequired } from '../middlewares/auth.js';
import * as studentController from '../controllers/student.controller.js';

const router = Router();

router.use(authRequired);

router.get('/', studentController.listStudents);
router.get('/:id', studentController.getStudentById);

export default router;
