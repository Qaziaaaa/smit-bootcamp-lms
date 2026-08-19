// Dashboard controller — returns aggregated stats for the admin dashboard.
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import dashboardService from '../services/dashboard.service.js';

// GET /dashboard/stats — returns counts, task breakdown, today's attendance, etc.
const getDashboard = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboardStats();
  sendSuccess(res, 200, stats, 'Dashboard stats retrieved successfully');
});

export default { getDashboard };
