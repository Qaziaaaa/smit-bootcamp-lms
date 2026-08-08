import ApiError from '../utils/ApiError.js';

const AUTH_TOKEN_MAP = {
  'dev-admin': { id: '000000000000000000000001', role: 'admin' },
  'dev-student': { id: '000000000000000000000002', role: 'student' },
};

// TODO: Replace with real JWT verification from /auth/login (assigned to Hakimullah).
const authRequired = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : header;

  const authUser = AUTH_TOKEN_MAP[token];
  if (!authUser) {
    return next(new ApiError(401, 'Invalid token.'));
  }

  req.authUser = authUser;
  return next();
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.authUser || !roles.includes(req.authUser.role)) {
    return next(new ApiError(403, 'Access denied.'));
  }
  return next();
};

export { authRequired, requireRole };
