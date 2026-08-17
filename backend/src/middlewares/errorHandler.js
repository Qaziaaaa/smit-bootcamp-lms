// Global error handler — catches all errors thrown in routes/controllers.
// Converts Mongoose errors (CastError, ValidationError, duplicate key) to user-friendly responses.
// Logs 500-level errors to console for debugging.
import logger from '../utils/logger.js';

// 404 handler — called when no route matches the request
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    errors: [],
  });
};

// Global error handler — receives errors thrown by throw new ApiError(...) or Mongoose
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Convert Mongoose-specific errors to friendly responses
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field "${err.path}".`;
    errors = [`Expected a valid ObjectId, received "${err.value}".`];
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed.';
    errors = Object.values(err.errors).map((e) => e.message);
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'value';
    message = `${field} already exists.`;
    errors = [`Duplicate value for field: ${field}.`];
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired.';
  }

  // Log server errors for debugging
  if (statusCode >= 500) {
    logger.error(err.stack || err.message);
  }

  res.status(statusCode).json({ success: false, message, errors });
};

export { notFound, errorHandler };
