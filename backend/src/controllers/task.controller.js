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

export default {
  getTasks,
};
