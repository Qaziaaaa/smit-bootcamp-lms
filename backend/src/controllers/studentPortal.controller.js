import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import studentPortalService from '../services/studentPortal.service.js';

const getProfile = asyncHandler(async (req, res) => {
  const profile = await studentPortalService.getStudentProfile(req.user.userId);
  sendSuccess(res, 200, profile, 'Profile retrieved successfully');
});

const getAttendance = asyncHandler(async (req, res) => {
  const attendance = await studentPortalService.getStudentAttendance(req.user.userId);
  sendSuccess(res, 200, attendance, 'Attendance retrieved successfully');
});

const getTeam = asyncHandler(async (req, res) => {
  const team = await studentPortalService.getStudentTeam(req.user.userId);
  sendSuccess(res, 200, team, 'Team retrieved successfully');
});

const getTasks = asyncHandler(async (req, res) => {
  const tasks = await studentPortalService.getStudentTasks(req.user.userId);
  sendSuccess(res, 200, tasks, 'Tasks retrieved successfully');
});

const updateTaskProgress = asyncHandler(async (req, res) => {
  const task = await studentPortalService.updateTaskProgress(req.user.userId, req.params.id, req.body);
  sendSuccess(res, 200, task, 'Task progress updated successfully');
});

export default {
  getProfile,
  getAttendance,
  getTeam,
  getTasks,
  updateTaskProgress,
};