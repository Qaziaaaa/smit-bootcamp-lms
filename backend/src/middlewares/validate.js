import { body, param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map((e) => e.msg),
    });
  }
  next();
};

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
  body('role').optional().isIn(['admin', 'student']).withMessage('Invalid role.'),
  handleValidationErrors,
];

const validateChangePassword = [
  body('oldPassword').notEmpty().withMessage('Current password is required.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  body('confirmPassword').custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match.'),
  handleValidationErrors,
];

const validateStudentCreate = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 100 }).withMessage('Name must be at most 100 characters.'),
  body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  body('phone')
    .optional()
    .trim()
    .custom((value) => /^[+\d][\d\s-]{9,14}$/.test(value))
    .withMessage('Valid phone number is required.'),
  body('batch').optional().trim().isLength({ max: 100 }).withMessage('Batch must be at most 100 characters.'),
  body('teamId').optional().isMongoId().withMessage('Invalid team ID.'),
  handleValidationErrors,
];

const validateStudentUpdate = [
  param('id').isMongoId().withMessage('Invalid student ID.'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.').isLength({ max: 100 }).withMessage('Name must be at most 100 characters.'),
  body('email').optional().isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('phone')
    .optional()
    .trim()
    .custom((value) => /^[+\d][\d\s-]{9,14}$/.test(value))
    .withMessage('Valid phone number is required.'),
  body('batch').optional().trim().isLength({ max: 100 }).withMessage('Batch must be at most 100 characters.'),
  body('teamId').optional().isMongoId().withMessage('Invalid team ID.'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status.'),
  handleValidationErrors,
];

const validateStudentId = [
  param('id').isMongoId().withMessage('Invalid student ID.'),
  handleValidationErrors,
];

const validateAttendanceMark = [
  (req, res, next) => {
    if (req.body && Array.isArray(req.body.records)) {
      const { records } = req.body;
      if (records.length === 0) {
        return res.status(400).json({ success: false, message: 'Validation failed.', errors: ['records cannot be empty.'] });
      }
      for (const r of records) {
        if (!r.studentId || !mongoose.isValidObjectId(r.studentId)) {
          return res.status(400).json({ success: false, message: 'Validation failed.', errors: ['Invalid student ID in records.'] });
        }
        if (!r.date || isNaN(Date.parse(r.date))) {
          return res.status(400).json({ success: false, message: 'Validation failed.', errors: ['Valid date in YYYY-MM-DD format is required for each record.'] });
        }
        if (!['present', 'absent'].includes(r.status)) {
          return res.status(400).json({ success: false, message: 'Validation failed.', errors: ['Status must be present or absent.'] });
        }
      }
      return next();
    }
    next();
  },
  body('studentId').optional().isMongoId().withMessage('Valid student ID is required.'),
  body('date').optional().isISO8601().withMessage('Valid date in YYYY-MM-DD format is required.').toDate(),
  body('status').optional().isIn(['present', 'absent']).withMessage('Status must be present or absent.'),
  handleValidationErrors,
];

const validateAttendanceUpdate = [
  param('id').isMongoId().withMessage('Invalid attendance ID.'),
  body('status').isIn(['present', 'absent']).withMessage('Status must be present or absent.'),
  handleValidationErrors,
];

const validateAttendanceQuery = [
  query('date').optional().isISO8601().withMessage('Valid date in YYYY-MM-DD format is required.').toDate(),
  query('batch').optional().trim().isLength({ max: 100 }).withMessage('Batch must be at most 100 characters.'),
  query('status').optional().isIn(['present', 'absent']).withMessage('Status must be present or absent.'),
  query('studentId').optional().isMongoId().withMessage('Invalid student ID.'),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term must be at most 100 characters.'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.').toInt(),
  query('limit').optional().isInt({ min: 1, max: 500 }).withMessage('Limit must be between 1 and 500.').toInt(),
  handleValidationErrors,
];

const validateStudentsQuery = [
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term must be at most 100 characters.'),
  query('batch').optional().trim().isLength({ max: 100 }).withMessage('Batch must be at most 100 characters.'),
  query('teamId').optional().isMongoId().withMessage('Invalid team ID.'),
  query('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status.'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.').toInt(),
  query('limit').optional().isInt({ min: 1, max: 500 }).withMessage('Limit must be between 1 and 500.').toInt(),
  handleValidationErrors,
];

const validateMongoId = [
  param('id').isMongoId().withMessage('Invalid ID.'),
  handleValidationErrors,
];

const validateAttendanceSummaryQuery = [
  query('batch').optional().trim().isLength({ max: 100 }).withMessage('Batch must be at most 100 characters.'),
  handleValidationErrors,
];

const validateTeamsQuery = [
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term must be at most 100 characters.'),
  handleValidationErrors,
];

const validateTeamId = [
  param('id').isMongoId().withMessage('Invalid team ID.'),
  handleValidationErrors,
];

const validateTeamCreate = [
  body('name').trim().notEmpty().withMessage('Team name is required.').isLength({ max: 100 }).withMessage('Team name must be at most 100 characters.'),
  body('members').optional().isArray().withMessage('Members must be an array.').custom((value) => value.every((id) => mongoose.isValidObjectId(id))).withMessage('Each member ID must be a valid ObjectId.'),
  body('leader').optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage('Invalid leader ID.'),
  handleValidationErrors,
];

const validateTeamUpdate = [
  param('id').isMongoId().withMessage('Invalid team ID.'),
  body('name').optional().trim().notEmpty().withMessage('Team name cannot be empty.').isLength({ max: 100 }).withMessage('Team name must be at most 100 characters.'),
  body('members').optional().isArray().withMessage('Members must be an array.').custom((value) => value.every((id) => mongoose.isValidObjectId(id))).withMessage('Each member ID must be a valid ObjectId.'),
  body('leader').optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage('Invalid leader ID.'),
  handleValidationErrors,
];

const validateTeamStudentsAssign = [
  param('id').isMongoId().withMessage('Invalid team ID.'),
  body('studentIds')
    .isArray({ min: 1 })
    .withMessage('studentIds must be a non-empty array.')
    .custom((value) => value.every((id) => mongoose.isValidObjectId(id)))
    .withMessage('Each student ID must be a valid ObjectId.'),
  handleValidationErrors,
];

const validateProjectsQuery = [
  query('status').optional().isIn(['active', 'completed', 'on-hold']).withMessage('Invalid status.'),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term must be at most 100 characters.'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.').toInt(),
  query('limit').optional().isInt({ min: 1, max: 500 }).withMessage('Limit must be between 1 and 500.').toInt(),
  handleValidationErrors,
];

const validateProjectId = [
  param('id').isMongoId().withMessage('Invalid project ID.'),
  handleValidationErrors,
];

const validateProjectCreate = [
  body('title').trim().notEmpty().withMessage('Project title is required.').isLength({ max: 200 }).withMessage('Project title must be at most 200 characters.'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be at most 1000 characters.'),
  body('teamId').optional().isMongoId().withMessage('Invalid team ID.'),
  body('status').optional().isIn(['active', 'completed', 'on-hold']).withMessage('Invalid status.'),
  body('deadline').optional().isISO8601().withMessage('Valid deadline date is required.').toDate(),
  handleValidationErrors,
];

const validateProjectUpdate = [
  param('id').isMongoId().withMessage('Invalid project ID.'),
  body('title').optional().trim().notEmpty().withMessage('Project title cannot be empty.').isLength({ max: 200 }).withMessage('Project title must be at most 200 characters.'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be at most 1000 characters.'),
  body('teamId').optional().isMongoId().withMessage('Invalid team ID.'),
  body('status').optional().isIn(['active', 'completed', 'on-hold']).withMessage('Invalid status.'),
  body('deadline').optional().isISO8601().withMessage('Valid deadline date is required.').toDate(),
  handleValidationErrors,
];

const validateTasksQuery = [
  query('projectId').optional().isMongoId().withMessage('Invalid project ID.'),
  query('status').optional().isIn(['pending', 'in-progress', 'in_review', 'review_requested', 'completed']).withMessage('Invalid status.'),
  query('assignedTo').optional().isMongoId().withMessage('Invalid assignedTo ID.'),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term must be at most 100 characters.'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.').toInt(),
  query('limit').optional().isInt({ min: 1, max: 500 }).withMessage('Limit must be between 1 and 500.').toInt(),
  handleValidationErrors,
];

const validateTaskId = [
  param('id').isMongoId().withMessage('Invalid task ID.'),
  handleValidationErrors,
];

const validateTaskCreate = [
  body('projectId').isMongoId().withMessage('Valid project ID is required.'),
  body('title').trim().notEmpty().withMessage('Task title is required.').isLength({ max: 200 }).withMessage('Task title must be at most 200 characters.'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be at most 1000 characters.'),
  body('assignedTo').optional().isMongoId().withMessage('Invalid assignedTo ID.'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority.'),
  body('status').optional().isIn(['pending', 'in-progress', 'in_review', 'review_requested', 'completed']).withMessage('Invalid status.'),
  body('deadline').optional().isISO8601().withMessage('Valid deadline date is required.').toDate(),
  handleValidationErrors,
];

const validateTaskUpdate = [
  param('id').isMongoId().withMessage('Invalid task ID.'),
  body('projectId').optional().isMongoId().withMessage('Invalid project ID.'),
  body('title').optional().trim().notEmpty().withMessage('Task title cannot be empty.').isLength({ max: 200 }).withMessage('Task title must be at most 200 characters.'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be at most 1000 characters.'),
  body('assignedTo').optional().isMongoId().withMessage('Invalid assignedTo ID.'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority.'),
  body('status').optional().isIn(['pending', 'in-progress', 'in_review', 'review_requested', 'completed']).withMessage('Invalid status.'),
  body('deadline').optional().isISO8601().withMessage('Valid deadline date is required.').toDate(),
  handleValidationErrors,
];

const validateTaskProgress = [
  param('id').isMongoId().withMessage('Invalid task ID.'),
  body('status').trim().notEmpty().withMessage('Status is required.').isIn(['pending', 'in-progress', 'in_review', 'review_requested', 'completed']).withMessage('Invalid status.'),
  handleValidationErrors,
];

const validateResetStudentPassword = [
  body('studentId').isMongoId().withMessage('Valid student ID is required.'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters.'),
  handleValidationErrors,
];

const validateBatchesQuery = [
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term must be at most 100 characters.'),
  handleValidationErrors,
];

const validateBatchId = [
  param('id').isMongoId().withMessage('Invalid batch ID.'),
  handleValidationErrors,
];

const validateBatchCreate = [
  body('name').trim().notEmpty().withMessage('Batch name is required.').isLength({ max: 100 }).withMessage('Batch name must be at most 100 characters.'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be at most 500 characters.'),
  body('startDate').optional().isISO8601().withMessage('Valid start date is required.').toDate(),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required.').toDate(),
  body('status').optional().isIn(['active', 'inactive', 'completed']).withMessage('Invalid status.'),
  handleValidationErrors,
];

const validateBatchUpdate = [
  param('id').isMongoId().withMessage('Invalid batch ID.'),
  body('name').optional().trim().notEmpty().withMessage('Batch name cannot be empty.').isLength({ max: 100 }).withMessage('Batch name must be at most 100 characters.'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be at most 500 characters.'),
  body('startDate').optional().isISO8601().withMessage('Valid start date is required.').toDate(),
  body('endDate').optional().isISO8601().withMessage('Valid end date is required.').toDate(),
  body('status').optional().isIn(['active', 'inactive', 'completed']).withMessage('Invalid status.'),
  handleValidationErrors,
];

export {
  validateLogin,
  validateChangePassword,
  validateStudentCreate,
  validateStudentUpdate,
  validateStudentId,
  validateAttendanceMark,
  validateAttendanceUpdate,
  validateAttendanceQuery,
  validateStudentsQuery,
  validateMongoId,
  validateAttendanceSummaryQuery,
  validateTeamsQuery,
  validateTeamId,
  validateTeamCreate,
  validateTeamUpdate,
  validateTeamStudentsAssign,
  validateProjectsQuery,
  validateProjectId,
  validateProjectCreate,
  validateProjectUpdate,
  validateTasksQuery,
  validateTaskId,
  validateTaskCreate,
  validateTaskUpdate,
  validateTaskProgress,
  validateBatchesQuery,
  validateBatchId,
  validateBatchCreate,
  validateBatchUpdate,
  validateResetStudentPassword,
};
