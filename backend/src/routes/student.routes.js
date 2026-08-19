// Student routes — admin CRUD for managing students.
// All routes require admin role (set via router.use below).
// IMPORTANT: /bulk-import and /utils/next-roll-no MUST come before /:id
// to avoid being matched as an ID parameter.
import { Router } from 'express';
import multer from 'multer';
import studentController from '../controllers/student.controller.js';
import {
  validateStudentCreate,
  validateStudentUpdate,
  validateStudentId,
  validateStudentsQuery,
} from '../middlewares/validate.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';

// Multer config: store CSV file in memory (max 5MB)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

router.use(authenticate, authorize('admin'));  // all student routes are admin-only

router.post('/', validateStudentCreate, studentController.createStudent);
router.get('/', validateStudentsQuery, studentController.getStudents);
router.post('/bulk-import', upload.single('file'), studentController.bulkImportStudents);  // static route BEFORE /:id
router.get('/utils/next-roll-no', studentController.getNextRollNo);  // static route BEFORE /:id
router.get('/:id', validateStudentId, studentController.getStudentById);
router.put('/:id', validateStudentUpdate, studentController.updateStudent);
router.delete('/:id', validateStudentId, studentController.deleteStudent);
router.get('/:id/attendance', validateStudentId, studentController.getStudentAttendance);

export default router;
