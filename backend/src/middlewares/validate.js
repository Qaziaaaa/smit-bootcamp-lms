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
  handleValidationErrors,
];

const validateStudentCreate = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 100 }).withMessage('Name must be at most 100 characters.'),
  body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  body('phone').optional().trim().isMobilePhone('any').withMessage('Valid phone number is required.'),
  body('batch').optional().trim().isLength({ max: 100 }).withMessage('Batch must be at most 100 characters.'),
  body('teamId').optional().isMongoId().withMessage('Invalid team ID.'),
  handleValidationErrors,
];

const validateStudentUpdate = [
  param('id').isMongoId().withMessage('Invalid student ID.'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty.').isLength({ max: 100 }).withMessage('Name must be at most 100 characters.'),
  body('email').optional().isEmail().withMessage('Valid email is required.').normalizeEmail(),
  body('phone').optional().trim().isMobilePhone('any').withMessage('Valid phone number is required.'),
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
  body('studentId').isMongoId().withMessage('Valid student ID is required.'),
  body('date').isISO8601().withMessage('Valid date in YYYY-MM-DD format is required.').toDate(),
  body('status').isIn(['present', 'absent']).withMessage('Status must be present or absent.'),
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
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.').toInt(),
  handleValidationErrors,
];

const validateStudentsQuery = [
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term must be at most 100 characters.'),
  query('batch').optional().trim().isLength({ max: 100 }).withMessage('Batch must be at most 100 characters.'),
  query('teamId').optional().isMongoId().withMessage('Invalid team ID.'),
  query('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status.'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.').toInt(),
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
  handleValidationErrors,
];

const validateTeamUpdate = [
  param('id').isMongoId().withMessage('Invalid team ID.'),
  body('name').trim().notEmpty().withMessage('Team name cannot be empty.').isLength({ max: 100 }).withMessage('Team name must be at most 100 characters.'),
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
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.').toInt(),
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
  query('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status.'),
  query('assignedTo').optional().isMongoId().withMessage('Invalid assignedTo ID.'),
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term must be at most 100 characters.'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.').toInt(),
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
  body('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status.'),
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
  body('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status.'),
  body('deadline').optional().isISO8601().withMessage('Valid deadline date is required.').toDate(),
  handleValidationErrors,
];

export {
  validateLogin,
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
};
