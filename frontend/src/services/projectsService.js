// Projects API calls — CRUD operations for managing projects.
import { apiClient } from './apiClient'

// List projects with optional status filter and search
export async function getProjects(params = {}) {
  const response = await apiClient.get('/projects', { params })
  return response.data.data
}

// Get a single project with its tasks
export async function getProjectById(id) {
  const response = await apiClient.get(`/projects/${id}`)
  return response.data.data
}

// Create a new project
export async function createProject(data) {
  const response = await apiClient.post('/projects', data)
  return response.data.data
}

// Update a project (including quick status toggle)
export async function updateProject(id, data) {
  const response = await apiClient.put(`/projects/${id}`, data)
  return response.data.data
}

// Delete a project
export async function deleteProject(id) {
  const response = await apiClient.delete(`/projects/${id}`)
  return response.data.data
}
