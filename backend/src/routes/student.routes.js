import { Router } from 'express';
import { body, param } from 'express-validator';

import { authRequired, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import * as studentController from '../controllers/student.controller.js';

const router = Router();

router.use(authRequired, requireRole('admin'));

const studentCreateRules = [
  body('name').trim().notEmpty().withMessage('name is required.'),
  body('email').trim().isEmail().withMessage('email must be a valid email address.'),
  body('password').isLength({ min: 8 }).withMessage('password must be at least 8 characters long.'),
  body('phone').optional().trim(),
  body('batch').optional().trim(),
  body('teamId').optional().isMongoId().withMessage('teamId must be a valid ObjectId.'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('status must be active or inactive.'),
];

const studentUpdateRules = [
  param('id').isMongoId().withMessage('Invalid student id.'),
  body('name').optional().trim().notEmpty().withMessage('name must not be empty.'),
  body('email').optional().trim().isEmail().withMessage('email must be a valid email address.'),
  body('phone').optional().trim(),
  body('batch').optional().trim(),
  body('teamId').optional().isMongoId().withMessage('teamId must be a valid ObjectId.'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('status must be active or inactive.'),
];

const studentIdRules = [param('id').isMongoId().withMessage('Invalid student id.')];

router.get('/', studentController.listStudents);
router.post('/', studentCreateRules, validate, studentController.createStudent);
router.get('/:id', studentIdRules, validate, studentController.getStudentById);
router.get('/:id/attendance', studentIdRules, validate, studentController.getStudentAttendance);
router.put('/:id', studentUpdateRules, validate, studentController.updateStudent);
router.delete('/:id', studentIdRules, validate, studentController.deleteStudent);

export default router;
