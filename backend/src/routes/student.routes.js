import { Router } from 'express';
import studentController from '../controllers/student.controller.js';
import {
  validateStudentCreate,
  validateStudentUpdate,
  validateStudentId,
  validateStudentsQuery,
} from '../middlewares/validate.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.post('/', validateStudentCreate, studentController.createStudent);
router.get('/', validateStudentsQuery, studentController.getStudents);
router.get('/:id', validateStudentId, studentController.getStudentById);
router.put('/:id', validateStudentUpdate, studentController.updateStudent);
router.delete('/:id', validateStudentId, studentController.deleteStudent);
router.get('/:id/attendance', validateStudentId, studentController.getStudentAttendance);

export default router;