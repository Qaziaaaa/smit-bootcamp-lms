// Auth controller — handles login, logout, password change, and password reset requests.
// Each handler extracts request data, calls the service, and sends the response.
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import authService from '../services/auth.service.js';

// POST /auth/login — authenticates user and returns JWT token
const login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;
  const result = await authService.login(email, password, role);
  sendSuccess(res, 200, result, 'Login successful');
});

// GET /auth/me — returns current user info from JWT token
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.userId);
  sendSuccess(res, 200, user, 'Current user retrieved');
});

// POST /auth/logout — client handles token removal
const logout = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, { loggedOut: true }, 'Logged out successfully. Remove token on client side.');
});

// POST /auth/change-password — requires old password, sets new one
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, password } = req.body;
  const result = await authService.changePassword(req.user.userId, oldPassword, password);
  sendSuccess(res, 200, result, 'Password changed successfully');
});

// POST /auth/reset-student-password — admin resets a student's password
const resetStudentPassword = asyncHandler(async (req, res) => {
  const { studentId, newPassword } = req.body;
  const result = await authService.resetStudentPassword(studentId, newPassword);
  sendSuccess(res, 200, result, 'Student password reset successfully');
});

export default { login, getMe, logout, changePassword, resetStudentPassword };
