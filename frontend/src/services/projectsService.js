import { apiClient } from './apiClient'

export const getProjects = async (params = {}) => {
  const response = await apiClient.get('/projects', { params })
  return response.data.data
}

export const getProjectById = async (id) => {
  const response = await apiClient.get(`/projects/${id}`)
  return response.data.data
}

export const createProject = async (data) => {
  const response = await apiClient.post('/projects', data)
  return response.data.data
}

export const updateProject = async (id, data) => {
  const response = await apiClient.put(`/projects/${id}`, data)
  return response.data.data
}

export const deleteProject = async (id) => {
  const response = await apiClient.delete(`/projects/${id}`)
  return response.data.data
}
