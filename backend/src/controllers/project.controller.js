import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import projectService from '../services/project.service.js';

const getProjects = asyncHandler(async (req, res) => {
  const { status, search, page, limit } = req.query;
  const result = await projectService.getProjects(
    { status, search },
    { page: Number(page) || 1, limit: Number(limit) || 10 }
  );
  sendSuccess(res, 200, result, 'Projects retrieved successfully');
});

export default {
  getProjects,
};
