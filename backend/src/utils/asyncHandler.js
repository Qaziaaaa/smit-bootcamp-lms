// Wraps async route handlers so errors are automatically passed to errorHandler.
// Without this, unhandled promise rejections in async handlers would crash the server.
// Usage: router.get('/', asyncHandler(myController))
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
