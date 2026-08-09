import ApiError from '../utils/ApiError.js';
import Task from '../models/task.model.js';

const getTasks = async ({ projectId, status, assignedTo, search }, { page = 1, limit = 10 }) => {
  const query = {};

  if (projectId) {
    query.projectId = projectId;
  }

  if (status) {
    query.status = status;
  }

  if (assignedTo) {
    query.assignedTo = assignedTo;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate('projectId', 'title')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Task.countDocuments(query),
  ]);

  return {
    tasks,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getTaskById = async (id) => {
  const task = await Task.findById(id)
    .populate('projectId', 'title')
    .populate('assignedTo', 'name email')
    .lean();

  if (!task) {
    throw new ApiError(404, 'Task not found.', ['Task does not exist.']);
  }

  return task;
};

export default {
  getTasks,
  getTaskById,
};
