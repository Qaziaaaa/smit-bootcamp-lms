import { apiClient } from './apiClient'

export const getAttendance = async (params = {}) => {
  const response = await apiClient.get('/attendance', { params })
  return response.data.data
}

export const markAttendance = async (data) => {
  const response = await apiClient.post('/attendance', data)
  return response.data.data
}

export const updateAttendance = async (id, data) => {
  const response = await apiClient.put(`/attendance/${id}`, data)
  return response.data.data
}

export const getAttendanceSummary = async (params = {}) => {
  const response = await apiClient.get('/attendance/summary', { params })
  return response.data.data
}
