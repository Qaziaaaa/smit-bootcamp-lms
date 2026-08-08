import { Router } from 'express';
import { authRequired } from '../middlewares/auth.js';
import * as studentController from '../controllers/student.controller.js';

const router = Router();

router.use(authRequired);

router.get('/', studentController.listStudents);
router.post('/', studentController.createStudent);
router.get('/:id', studentController.getStudentById);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

export default router;
