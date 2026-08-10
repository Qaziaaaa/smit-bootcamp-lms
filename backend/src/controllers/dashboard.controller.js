import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import dashboardService from '../services/dashboard.service.js';

const getDashboard = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboardStats();
  sendSuccess(res, 200, stats, 'Dashboard stats retrieved successfully');
});

export default {
  getDashboard,
};
