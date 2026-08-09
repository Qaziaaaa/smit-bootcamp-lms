import Team from '../models/team.model.js';

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

export default {
  getTeams,
};
