// Teams API calls — CRUD operations for managing teams.
import { apiClient } from './apiClient'

// List all teams (with optional search)
export async function getTeams(params = {}) {
  const response = await apiClient.get('/teams', { params })
  return response.data.data   // { teams: [...] }
}

// Get a single team with members and project
export async function getTeam(id) {
  const response = await apiClient.get(`/teams/${id}`)
  return response.data.data
}

export const getTeamById = getTeam

// Assign students to a team
export async function assignStudentsToTeam(teamId, studentIds) {
  const response = await apiClient.post(`/teams/${teamId}/students`, { studentIds })
  return response.data.data
}

// Create a new team
export async function createTeam(data) {
  const response = await apiClient.post('/teams', data)
  return response.data.data
}

// Update a team
export async function updateTeam(id, data) {
  const response = await apiClient.put(`/teams/${id}`, data)
  return response.data.data
}

// Delete a team
export async function deleteTeam(id) {
  const response = await apiClient.delete(`/teams/${id}`)
  return response.data.data
}
