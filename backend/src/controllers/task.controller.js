import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import taskService from '../services/task.service.js';

const getTasks = asyncHandler(async (req, res) => {
  const { projectId, status, assignedTo, search, page, limit } = req.query;
  const result = await taskService.getTasks(
    { projectId, status, assignedTo, search },
    { page: Number(page) || 1, limit: Number(limit) || 10 }
  );
  sendSuccess(res, 200, result, 'Tasks retrieved successfully');
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id);
  sendSuccess(res, 200, task, 'Task retrieved successfully');
});

const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.body);
  sendSuccess(res, 201, task, 'Task created successfully');
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body);
  sendSuccess(res, 200, task, 'Task updated successfully');
});

const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.id);
  sendSuccess(res, 200, { deleted: true }, 'Task deleted successfully');
});

export default {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
