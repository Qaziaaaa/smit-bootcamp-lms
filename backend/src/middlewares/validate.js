import { body, param, query, validationResult } from 'express-validator';

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
};
