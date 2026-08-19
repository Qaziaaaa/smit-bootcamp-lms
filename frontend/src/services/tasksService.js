// Tasks API calls — CRUD operations for managing tasks.
import { apiClient } from './apiClient'

// List tasks with optional filters (project, status, assignee, search)
export async function getTasks(params = {}) {
  const response = await apiClient.get('/tasks', { params })
  return response.data.data
}

// Get a single task
export async function getTask(id) {
  const response = await apiClient.get(`/tasks/${id}`)
  return response.data.data
}

// Create a new task
export async function createTask(data) {
  const response = await apiClient.post('/tasks', data)
  return response.data.data
}

// Update a task
export async function updateTask(id, data) {
  const response = await apiClient.put(`/tasks/${id}`, data)
  return response.data.data
}

// Delete a task
export async function deleteTask(id) {
  const response = await apiClient.delete(`/tasks/${id}`)
  return response.data.data
}
