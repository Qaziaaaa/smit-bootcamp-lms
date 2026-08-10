import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import Student from '../models/student.model.js';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
};

const login = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.passwordHash) {
    throw new ApiError(401, 'Invalid credentials.', ['Invalid email or password.']);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials.', ['Invalid email or password.']);
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

export default {
  login,
  getMe,
  createUser,
  findUserByEmail,
  findUserById,
  updateUserPassword,
  generateToken,
};