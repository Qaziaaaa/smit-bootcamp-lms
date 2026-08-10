import ApiError from '../utils/ApiError.js';
import Task from '../models/task.model.js';
import Project from '../models/project.model.js';
import Student from '../models/student.model.js';

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

const createTask = async (data) => {
  const { projectId, title, description, assignedTo, priority, status, deadline } = data;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found.', ['Assigned project does not exist.']);
  }

  if (assignedTo) {
    const student = await Student.findById(assignedTo);
    if (!student) {
      throw new ApiError(404, 'Student not found.', ['Assigned student does not exist.']);
    }
  }

  const task = await Task.create({ projectId, title, description, assignedTo, priority, status, deadline });
  return task;
};

const updateTask = async (id, data) => {
  const task = await Task.findById(id);
  if (!task) {
    throw new ApiError(404, 'Task not found.', ['Task does not exist.']);
  }

  if (data.projectId) {
    const project = await Project.findById(data.projectId);
    if (!project) {
      throw new ApiError(404, 'Project not found.', ['Assigned project does not exist.']);
    }
  }

  if (data.assignedTo) {
    const student = await Student.findById(data.assignedTo);
    if (!student) {
      throw new ApiError(404, 'Student not found.', ['Assigned student does not exist.']);
    }
  }

  const updated = await Task.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate('projectId', 'title')
    .populate('assignedTo', 'name email');

  return updated;
};

const deleteTask = async (id) => {
  const task = await Task.findById(id);
  if (!task) {
    throw new ApiError(404, 'Task not found.', ['Task does not exist.']);
  }

  await Task.findByIdAndDelete(id);

  return { success: true };
};

export default {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
