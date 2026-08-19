// Student Portal controller — handles student self-service requests.
// All handlers use req.user.userId (from JWT) to scope data to the logged-in student.
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

const getProjects = asyncHandler(async (req, res) => {
  const projects = await studentPortalService.getStudentProjects(req.user.userId);
  sendSuccess(res, 200, projects, 'Projects retrieved successfully');
});

const getProjectById = asyncHandler(async (req, res) => {
  const project = await studentPortalService.getStudentProjectById(req.user.userId, req.params.id);
  sendSuccess(res, 200, project, 'Project retrieved successfully');
});

// PUT /student/tasks/:id/progress — student updates their own task status
const updateTaskProgress = asyncHandler(async (req, res) => {
  const task = await studentPortalService.updateTaskProgress(req.user.userId, req.params.id, req.body);
  sendSuccess(res, 200, task, 'Task progress updated successfully');
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await studentPortalService.changePassword(req.user.userId, currentPassword, newPassword);
  sendSuccess(res, 200, { success: true }, 'Password changed successfully');
});

export default {
  getProfile,
  getAttendance,
  getTeam,
  getTasks,
  getProjects,
  getProjectById,
  updateTaskProgress,
  changePassword,
};
