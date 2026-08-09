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

const createTeam = asyncHandler(async (req, res) => {
  const team = await teamService.createTeam(req.body);
  sendSuccess(res, 201, team, 'Team created successfully');
});

const updateTeam = asyncHandler(async (req, res) => {
  const team = await teamService.updateTeam(req.params.id, req.body);
  sendSuccess(res, 200, team, 'Team updated successfully');
});

const deleteTeam = asyncHandler(async (req, res) => {
  await teamService.deleteTeam(req.params.id);
  sendSuccess(res, 200, { deleted: true }, 'Team deleted successfully');
});

export default {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
};
