import ApiError from '../utils/ApiError.js';
import Project from '../models/project.model.js';
import Task from '../models/task.model.js';
import Team from '../models/team.model.js';

const getProjects = async ({ status, search }, { page = 1, limit = 10 }) => {
  const query = {};

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

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
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getProjectById = async (id) => {
  const project = await Project.findById(id).populate('teamId', 'name').lean();
  if (!project) {
    throw new ApiError(404, 'Project not found.', ['Project does not exist.']);
  }

  const tasks = await Task.find({ projectId: project._id })
    .select('title description status priority deadline assignedTo')
    .sort({ createdAt: -1 })
    .lean();

  return { ...project, tasks };
};

const createProject = async ({ title, description, teamId, status, deadline }) => {
  if (teamId) {
    const team = await Team.findById(teamId);
    if (!team) {
      throw new ApiError(404, 'Team not found.', ['Assigned team does not exist.']);
    }
  }

  const project = await Project.create({ title, description, teamId, status, deadline });

  if (teamId) {
    await Team.findByIdAndUpdate(teamId, { projectId: project._id });
  }

  return project;
};

export default {
  getProjects,
  getProjectById,
  createProject,
};
