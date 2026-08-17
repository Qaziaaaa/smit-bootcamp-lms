import { apiClient } from './apiClient'

export const getStudents = async (params = {}) => {
  const response = await apiClient.get('/students', { params })
  return response.data.data
}

export const getStudentById = async (id) => {
  const response = await apiClient.get(`/students/${id}`)
  return response.data.data
}

export const createStudent = async (data) => {
  const response = await apiClient.post('/students', data)
  return response.data.data
}

export const updateStudent = async (id, data) => {
  const response = await apiClient.put(`/students/${id}`, data)
  return response.data.data
}

export const deleteStudent = async (id) => {
  const response = await apiClient.delete(`/students/${id}`)
  return response.data.data
}

export const getStudentAttendance = async (id) => {
  const response = await apiClient.get(`/students/${id}/attendance`)
  return response.data.data
}

export const bulkImportStudents = async (formData) => {
  const response = await apiClient.post('/students/bulk-import', formData)
  return response.data.data
}

export const getNextRollNo = async () => {
  const response = await apiClient.get('/students/utils/next-roll-no')
  return response.data.data
}

export const resetStudentPassword = async (studentId, newPassword) => {
  const response = await apiClient.post('/auth/reset-student-password', { studentId, newPassword })
  return response.data.data
}
