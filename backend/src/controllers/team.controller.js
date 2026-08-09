import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import teamService from '../services/team.service.js';

const getTeams = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const teams = await teamService.getTeams({ search });
  sendSuccess(res, 200, { teams }, 'Teams retrieved successfully');
});

const getTeamById = asyncHandler(async (req, res) => {
  const team = await teamService.getTeamById(req.params.id);
  sendSuccess(res, 200, team, 'Team retrieved successfully');
});

export default {
  getTeams,
  getTeamById,
};
