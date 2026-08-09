import ApiError from '../utils/ApiError.js';
import Team from '../models/team.model.js';
import Student from '../models/student.model.js';
import Project from '../models/project.model.js';

const getTeams = async ({ search }) => {
  const match = {};
  if (search) {
    match.name = { $regex: search, $options: 'i' };
  }

  const teams = await Team.aggregate([
    { $match: match },
    {
      $lookup: {
        from: 'students',
        localField: '_id',
        foreignField: 'teamId',
        as: 'members',
      },
    },
    {
      $project: {
        name: 1,
        projectId: 1,
        createdAt: 1,
        updatedAt: 1,
        memberCount: { $size: '$members' },
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  return teams;
};

const getTeamById = async (id) => {
  const team = await Team.findById(id).lean();
  if (!team) {
    throw new ApiError(404, 'Team not found.', ['Team does not exist.']);
  }

  const members = await Student.find({ teamId: team._id })
    .select('name email batch status')
    .sort({ name: 1 })
    .lean();

  const project = team.projectId ? await Project.findById(team.projectId).lean() : null;

  return { ...team, members, project };
};

const createTeam = async ({ name }) => {
  const existing = await Team.findOne({ name });
  if (existing) {
    throw new ApiError(409, 'Team name already exists.', ['A team with this name already exists.']);
  }

  const team = await Team.create({ name });
  return team;
};

const updateTeam = async (id, { name }) => {
  const team = await Team.findById(id);
  if (!team) {
    throw new ApiError(404, 'Team not found.', ['Team does not exist.']);
  }

  if (name && name !== team.name) {
    const existing = await Team.findOne({ name });
    if (existing) {
      throw new ApiError(409, 'Team name already exists.', ['A team with this name already exists.']);
    }
  }

  const updated = await Team.findByIdAndUpdate(id, { name }, { new: true, runValidators: true });
  return updated;
};

const deleteTeam = async (id) => {
  const team = await Team.findById(id);
  if (!team) {
    throw new ApiError(404, 'Team not found.', ['Team does not exist.']);
  }

  await Student.updateMany({ teamId: id }, { $unset: { teamId: '' } });
  await Project.updateMany({ teamId: id }, { $unset: { teamId: '' } });
  await Team.findByIdAndDelete(id);

  return { success: true };
};

export default {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
};
