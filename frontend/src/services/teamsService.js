import { apiClient } from './apiClient'

export const getTeams = async (params = {}) => {
  const response = await apiClient.get('/teams', { params })
  return response.data.data
}

export const getTeamById = async (id) => {
  const response = await apiClient.get(`/teams/${id}`)
  return response.data.data
}

export const createTeam = async (data) => {
  const response = await apiClient.post('/teams', data)
  return response.data.data
}

export const updateTeam = async (id, data) => {
  const response = await apiClient.put(`/teams/${id}`, data)
  return response.data.data
}

export const deleteTeam = async (id) => {
  const response = await apiClient.delete(`/teams/${id}`)
  return response.data.data
}

export const assignStudentsToTeam = async (teamId, studentIds) => {
  const response = await apiClient.post(`/teams/${teamId}/students`, { studentIds })
  return response.data.data
}
