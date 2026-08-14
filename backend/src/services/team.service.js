import mongoose from 'mongoose';
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
        leader: 1,
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
    .select('name email batch status rollNo')
    .sort({ name: 1 })
    .lean();

  const project = team.projectId ? await Project.findById(team.projectId).lean() : null;

  return { ...team, members, project };
};

const createTeam = async ({ name, members, leader }) => {
  const existing = await Team.findOne({ name });
  if (existing) {
    throw new ApiError(409, 'Team name already exists.', ['A team with this name already exists.']);
  }

  const teamData = { name };
  if (leader) teamData.leader = leader;

  const team = await Team.create(teamData);

  if (Array.isArray(members) && members.length > 0) {
    const memberObjectIds = members.map((m) => new mongoose.Types.ObjectId(m));
    await Student.updateMany({ _id: { $in: memberObjectIds } }, { $set: { teamId: team._id } });
  }

  return team;
};

const updateTeam = async (id, { name, members, leader }) => {
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

  const updateData = {};
  if (name) updateData.name = name;
  if (leader !== undefined) updateData.leader = leader || null;

  const updated = await Team.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

  if (Array.isArray(members)) {
    const teamObjId = new mongoose.Types.ObjectId(id);
    const memberObjectIds = members.map((m) => new mongoose.Types.ObjectId(m));
    // Unassign members who were removed from this team
    await Student.updateMany({ teamId: teamObjId, _id: { $nin: memberObjectIds } }, { $unset: { teamId: '' } });
    // Assign selected members to this team
    if (memberObjectIds.length > 0) {
      await Student.updateMany({ _id: { $in: memberObjectIds } }, { $set: { teamId: id } });
    }
  }

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

const assignStudentsToTeam = async (id, studentIds) => {
  const team = await Team.findById(id);
  if (!team) {
    throw new ApiError(404, 'Team not found.', ['Team does not exist.']);
  }

  const students = await Student.find({ _id: { $in: studentIds } }).select('_id');
  const foundIds = students.map((s) => s._id.toString());
  const missing = studentIds.filter((sid) => !foundIds.includes(sid.toString()));
  if (missing.length > 0) {
    throw new ApiError(400, 'Some students were not found.', [`Invalid student IDs: ${missing.join(', ')}`]);
  }

  await Student.updateMany({ _id: { $in: studentIds } }, { $set: { teamId: id } });

  const members = await Student.find({ teamId: id })
    .select('name email batch status')
    .sort({ name: 1 })
    .lean();

  return { team: { id: team._id, name: team.name }, members };
};

export default {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  assignStudentsToTeam,
};
