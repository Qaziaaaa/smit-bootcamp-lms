// Authentication middleware — verifies JWT token from the Authorization header.
// If valid, attaches userId and role to req.user for downstream handlers.
// If invalid or missing, returns 401.
import jwt from 'jsonwebtoken';
import env from '../config/env.js';

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check for "Bearer <token>" format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
      errors: ['Missing or invalid Authorization header.'],
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token and extract userId + role
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired.', errors: [] });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.', errors: [] });
  }
};

export default authenticate;
