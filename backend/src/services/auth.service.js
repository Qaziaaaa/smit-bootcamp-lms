// Auth service — handles login, password changes, and user lookups.
// This is the only service that deals with JWT tokens and password hashing.
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import Student from '../models/student.model.js';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';

// Creates a JWT token that expires after jwtExpiresIn (default 7 days)
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
};

// Login: checks email + password, verifies role matches the login form used
const login = async (email, password, expectedRole) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.passwordHash) {
    throw new ApiError(401, 'Invalid credentials.', ['Invalid email or password.']);
  }

  // Compare plain password with stored bcrypt hash
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials.', ['Invalid email or password.']);
  }

  // Prevent students from logging into admin form and vice versa
  if (expectedRole && user.role !== expectedRole) {
    if (expectedRole === 'admin') {
      throw new ApiError(403, 'Only admin can login with the admin login form or with admin portal.');
    }
    if (expectedRole === 'student') {
      throw new ApiError(403, 'Only student can login with the student login form or with student portal.');
    }
  }

  const token = generateToken(user);
  return {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
  };
};

// Get current user info from token (used by /auth/me endpoint)
const getMe = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    throw new ApiError(404, 'User not found.', ['User does not exist.']);
  }
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };
};

// Create a new user account (used when creating students)
const createUser = async ({ email, passwordHash, role }) => {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'Email already exists.', ['A user with this email already exists.']);
  }
  const user = await User.create({ email: email.toLowerCase(), passwordHash, role });
  return user;
};

const findUserByEmail = async (email) => {
  return User.findOne({ email: email.toLowerCase() });
};

const findUserById = async (id) => {
  return User.findById(id).select('-passwordHash');
};

const updateUserPassword = async (userId, newPasswordHash) => {
  return User.findByIdAndUpdate(userId, { passwordHash: newPasswordHash }, { new: true });
};

// Change password — requires the old password to be correct first
const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found.', ['User does not exist.']);
  }
  if (!oldPassword) {
    throw new ApiError(400, 'Current password is required.', ['Current password is required.']);
  }
  // Verify old password matches before allowing change
  const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, 'Current password is incorrect.', ['The current password you entered is incorrect.']);
  }
  const passwordHash = await bcrypt.hash(newPassword, env.bcryptRounds);
  await User.findByIdAndUpdate(userId, { passwordHash }, { new: true });
  return { success: true };
};

// Admin resets a student's password (no old password needed)
const resetStudentPassword = async (studentId, newPassword) => {
  const student = await Student.findById(studentId);
  if (!student) {
    throw new ApiError(404, 'Student not found.', ['Student does not exist.']);
  }
  // Find the User account linked to this student
  const user = await User.findById(student.userId);
  if (!user) {
    throw new ApiError(404, 'User not found.', ['User account not found for this student.']);
  }
  const passwordHash = await bcrypt.hash(newPassword, env.bcryptRounds);
  await User.findByIdAndUpdate(user._id, { passwordHash });
  return { success: true };
};

export default {
  login,
  getMe,
  createUser,
  findUserByEmail,
  findUserById,
  updateUserPassword,
  changePassword,
  resetStudentPassword,
  generateToken,
};