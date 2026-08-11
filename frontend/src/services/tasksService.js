import { apiClient } from './apiClient'

export const getTasks = async (params = {}) => {
  const response = await apiClient.get('/tasks', { params })
  return response.data.data
}

export const getTaskById = async (id) => {
  const response = await apiClient.get(`/tasks/${id}`)
  return response.data.data
}

export const createTask = async (data) => {
  const response = await apiClient.post('/tasks', data)
  return response.data.data
}

export const updateTask = async (id, data) => {
  const response = await apiClient.put(`/tasks/${id}`, data)
  return response.data.data
}

export const deleteTask = async (id) => {
  const response = await apiClient.delete(`/tasks/${id}`)
  return response.data.data
}
