import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import authService from '../services/auth.service.js';

const login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;
  const result = await authService.login(email, password, role);
  sendSuccess(res, 200, result, 'Login successful');
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.userId);
  sendSuccess(res, 200, user, 'Current user retrieved');
});

const logout = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, { loggedOut: true }, 'Logged out successfully. Remove token on client side.');
});

const changePassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const result = await authService.changePassword(req.user.userId, password);
  sendSuccess(res, 200, result, 'Password changed successfully');
});

export default {
  login,
  getMe,
  logout,
  changePassword,
};