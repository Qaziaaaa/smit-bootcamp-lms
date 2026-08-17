// Custom error class — used to throw errors with HTTP status codes.
// Usage: throw new ApiError(404, 'Not found', ['Item does not exist'])
// The errorHandler middleware catches these and sends the response.
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = Array.isArray(errors) ? errors : [errors];
    this.isOperational = true;  // marks this as an expected error (not a bug)
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
