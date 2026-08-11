import { Router } from 'express';
import attendanceController from '../controllers/attendance.controller.js';
import {
  validateAttendanceMark,
  validateAttendanceUpdate,
  validateAttendanceQuery,
  validateMongoId,
  validateAttendanceSummaryQuery,
} from '../middlewares/validate.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.post('/', validateAttendanceMark, attendanceController.markAttendance);
router.get('/', validateAttendanceQuery, attendanceController.getAttendance);
router.put('/:id', validateAttendanceUpdate, attendanceController.updateAttendance);
router.get('/summary', validateAttendanceSummaryQuery, attendanceController.getAttendanceSummary);

export default router;