// Task service — manages individual tasks within projects.
// Tasks belong to a project (projectId) and are optionally assigned to a student (assignedTo).
// Status flow: pending -> in-progress -> in_review -> review_requested -> completed.
import ApiError from '../utils/ApiError.js';
import escapeRegex from '../utils/escapeRegex.js';
import Task from '../models/task.model.js';
import Project from '../models/project.model.js';
import Student from '../models/student.model.js';

// List tasks with optional filters (project, status, assignee, search)
const getTasks = async ({ projectId, status, assignedTo, search }, { page = 1, limit = 10 }) => {
  const query = {};

  if (projectId) query.projectId = projectId;
  if (status) query.status = status;
  if (assignedTo) query.assignedTo = assignedTo;

  if (search) {
    const escaped = escapeRegex(search);
    query.$or = [
      { title: { $regex: escaped, $options: 'i' } },
      { description: { $regex: escaped, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate('projectId', 'title')           // show project name in the list
      .populate('assignedTo', 'name email rollNo') // show assignee info
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Task.countDocuments(query),
  ]);

  return {
    tasks,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
  };
};

const getTaskById = async (id) => {
  const task = await Task.findById(id)
    .populate('projectId', 'title')
    .populate('assignedTo', 'name email rollNo')
    .lean();

  if (!task) {
    throw new ApiError(404, 'Task not found.', ['Task does not exist.']);
  }

  return task;
};

// Create a task — validates that the project and assigned student exist
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
    .populate('assignedTo', 'name email rollNo');

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
