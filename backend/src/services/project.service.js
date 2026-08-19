// Project service — manages capstone projects.
// Each project is assigned to one team and contains multiple tasks.
// When a project is deleted, its tasks are also deleted and team links are cleaned up.
import ApiError from '../utils/ApiError.js';
import escapeRegex from '../utils/escapeRegex.js';
import Project from '../models/project.model.js';
import Task from '../models/task.model.js';
import Team from '../models/team.model.js';

// List projects with optional status filter and search
const getProjects = async ({ status, search }, { page = 1, limit = 10 }) => {
  const query = {};

  if (status) {
    query.status = status;
  }

  if (search) {
    const escaped = escapeRegex(search);
    query.$or = [
      { title: { $regex: escaped, $options: 'i' } },
      { description: { $regex: escaped, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  // Run count + find in parallel for faster response
  const [projects, total] = await Promise.all([
    Project.find(query)
      .populate('teamId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Project.countDocuments(query),
  ]);

  return {
    projects,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
  };
};

// Get a single project with all its tasks
const getProjectById = async (id) => {
  const project = await Project.findById(id).populate('teamId', 'name').lean();
  if (!project) {
    throw new ApiError(404, 'Project not found.', ['Project does not exist.']);
  }

  // Also fetch all tasks belonging to this project
  const tasks = await Task.find({ projectId: project._id })
    .populate('assignedTo', 'name email rollNo')
    .sort({ createdAt: -1 })
    .lean();

  return { ...project, tasks };
};

// Create a project — if assigned to a team, also updates the team's projectId
const createProject = async ({ title, description, teamId, status, deadline }) => {
  if (teamId) {
    const team = await Team.findById(teamId);
    if (!team) {
      throw new ApiError(404, 'Team not found.', ['Assigned team does not exist.']);
    }
  }

  const project = await Project.create({ title, description, teamId, status, deadline });

  // Link the project back to the team
  if (teamId) {
    await Team.findByIdAndUpdate(teamId, { projectId: project._id });
  }

  return project;
};

const updateProject = async (id, data) => {
  const project = await Project.findById(id);
  if (!project) {
    throw new ApiError(404, 'Project not found.', ['Project does not exist.']);
  }

  if (data.teamId) {
    const team = await Team.findById(data.teamId);
    if (!team) {
      throw new ApiError(404, 'Team not found.', ['Assigned team does not exist.']);
    }
  }

  const updated = await Project.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('teamId', 'name');
  return updated;
};

// Delete project — removes tasks and unlinks from team
const deleteProject = async (id) => {
  const project = await Project.findById(id);
  if (!project) {
    throw new ApiError(404, 'Project not found.', ['Project does not exist.']);
  }

  // Delete all tasks that belong to this project
  await Task.deleteMany({ projectId: id });
  // Remove projectId from any team that was linked to this project
  await Team.updateMany({ projectId: id }, { $unset: { projectId: '' } });
  await Project.findByIdAndDelete(id);

  return { success: true };
};

export default { getProjects, getProjectById, createProject, updateProject, deleteProject };
