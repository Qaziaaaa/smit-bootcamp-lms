import { validationResult } from 'express-validator';

import ApiError from '../utils/ApiError.js';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((error) => error.msg);
    return next(new ApiError(400, 'Validation failed.', messages));
  }
  return next();
};

export { validate };
