const sendSuccess = (res, statusCode, data, message) => {
  res.status(statusCode).json({
    success: true,
    data,
    message: message || undefined,
    errors: [],
  });
};

const sendError = (res, statusCode, message, errors = []) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors],
  });
};

export { sendSuccess, sendError };
