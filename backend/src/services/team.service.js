// Team service — manages teams and their member assignments.
// Key rules enforced here:
//   - A student can only be in ONE team (checked before create/update)
//   - Team name must be unique
//   - Deleting a team unlinks all members and cleans up related projects/tasks
import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';
import escapeRegex from '../utils/escapeRegex.js';
import Team from '../models/team.model.js';
import Student from '../models/student.model.js';
import Project from '../models/project.model.js';
import Task from '../models/task.model.js';

// List all teams with member count (uses aggregation)
const getTeams = async ({ search }) => {
  const match = {};
  if (search) {
    match.name = { $regex: escapeRegex(search), $options: 'i' };
  }

  const teams = await Team.aggregate([
    { $match: match },
    {
      $lookup: {
        from: 'students',
        localField: '_id',
        foreignField: 'teamId',   // students with this teamId belong to this team
        as: 'members',
      },
    },
    {
      $project: {
        name: 1, projectId: 1, leader: 1, createdAt: 1, updatedAt: 1,
        memberCount: { $size: '$members' },
      },
    },
    { $sort: { createdAt: -1 } },
  ]);

  return teams;
};

// Get a single team with its full member list and project
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

// Create a new team — checks for duplicate name and member conflicts
const createTeam = async ({ name, members, leader }) => {
  const existing = await Team.findOne({ name });
  if (existing) {
    throw new ApiError(409, 'Team name already exists.', ['A team with this name already exists.']);
  }

  // Prevent adding students who are already in another team
  if (Array.isArray(members) && members.length > 0) {
    const memberObjectIds = members.map((m) => new mongoose.Types.ObjectId(m));
    const alreadyAssigned = await Student.find({
      _id: { $in: memberObjectIds },
      teamId: { $exists: true, $ne: null },
    }).select('name rollNo');
    if (alreadyAssigned.length > 0) {
      const names = alreadyAssigned.map((s) => s.name).join(', ');
      throw new ApiError(409, 'Some students are already in a team.', [`${names} are already assigned to another team.`]);
    }
  }

  const teamData = { name };
  if (leader) teamData.leader = leader;

  const team = await Team.create(teamData);

  // Link all selected students to this team
  if (Array.isArray(members) && members.length > 0) {
    const memberObjectIds = members.map((m) => new mongoose.Types.ObjectId(m));
    await Student.updateMany({ _id: { $in: memberObjectIds } }, { $set: { teamId: team._id } });
  }

  return team;
};

// Update team — handles name changes, member reassignments, and leader updates
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

  // Leader must be one of the selected members
  if (Array.isArray(members) && leader && !members.includes(leader.toString())) {
    throw new ApiError(400, 'Leader must be a team member.', ['The team leader must be one of the selected team members.']);
  }

  // Prevent adding students who are already in a DIFFERENT team
  if (Array.isArray(members)) {
    const memberObjectIds = members.map((m) => new mongoose.Types.ObjectId(m));
    const alreadyAssigned = await Student.find({
      _id: { $in: memberObjectIds },
      teamId: { $exists: true, $ne: null, $ne: team._id },  // exclude current team
    }).select('name rollNo');
    if (alreadyAssigned.length > 0) {
      const names = alreadyAssigned.map((s) => s.name).join(', ');
      throw new ApiError(409, 'Some students are already in a team.', [`${names} are already assigned to another team.`]);
    }
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (leader !== undefined) updateData.leader = leader || null;

  const updated = await Team.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

  // Sync member assignments: unremoved members leave, new members join
  if (Array.isArray(members)) {
    const teamObjId = new mongoose.Types.ObjectId(id);
    const memberObjectIds = members.map((m) => new mongoose.Types.ObjectId(m));
    // Remove teamId from students who were removed from this team
    await Student.updateMany({ teamId: teamObjId, _id: { $nin: memberObjectIds } }, { $unset: { teamId: '' } });
    // Assign new members to this team
    if (memberObjectIds.length > 0) {
      await Student.updateMany({ _id: { $in: memberObjectIds } }, { $set: { teamId: id } });
    }
  }

  return updated;
};

// Delete team — cleans up all references (students, projects, tasks)
const deleteTeam = async (id) => {
  const team = await Team.findById(id);
  if (!team) {
    throw new ApiError(404, 'Team not found.', ['Team does not exist.']);
  }

  // Delete all tasks belonging to this team's projects
  const projects = await Project.find({ teamId: id }).select('_id');
  const projectIds = projects.map((p) => p._id);
  if (projectIds.length > 0) {
    await Task.deleteMany({ projectId: { $in: projectIds } });
  }

  // Unlink students and projects from this team
  await Student.updateMany({ teamId: id }, { $unset: { teamId: '' } });
  await Project.updateMany({ teamId: id }, { $unset: { teamId: '' } });
  await Team.findByIdAndDelete(id);

  return { success: true };
};

// Assign students to a team (used by the team detail page)
const assignStudentsToTeam = async (id, studentIds) => {
  const team = await Team.findById(id);
  if (!team) {
    throw new ApiError(404, 'Team not found.', ['Team does not exist.']);
  }

  // Verify all student IDs exist
  const students = await Student.find({ _id: { $in: studentIds } }).select('_id');
  const foundIds = students.map((s) => s._id.toString());
  const missing = studentIds.filter((sid) => !foundIds.includes(sid.toString()));
  if (missing.length > 0) {
    throw new ApiError(400, 'Some students were not found.', [`Invalid student IDs: ${missing.join(', ')}`]);
  }

  await Student.updateMany({ _id: { $in: studentIds } }, { $set: { teamId: id } });

  const members = await Student.find({ teamId: id }).select('name email batch status').sort({ name: 1 }).lean();

  return { team: { id: team._id, name: team.name }, members };
};
