// Authorization middleware — checks if the user's role is allowed.
// Usage: authorize('admin') or authorize('admin', 'student')
// Must be used AFTER authenticate (which sets req.user).
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Role not found.',
        errors: ['Authentication required.'],
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient permissions.',
        errors: [`Role '${req.user.role}' is not authorized to access this resource.`],
      });
    }

    next();
  };
};

export default authorize;
