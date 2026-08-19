// Attendance API calls — mark, list, update attendance records.
import { apiClient } from './apiClient'

// Mark attendance (single or bulk)
export async function markAttendance(data) {
  const response = await apiClient.post('/attendance', data)
  return response.data.data
}

// Get attendance records with filters (date, batch, status, search)
export async function getAttendance(params = {}) {
  const response = await apiClient.get('/attendance', { params })
  return response.data.data   // { records: [...], summary: {...}, pagination: {...} }
}

// Update a single attendance record's status
export async function updateAttendance(id, data) {
  const response = await apiClient.put(`/attendance/${id}`, data)
  return response.data.data
}

// Get attendance summary across all students
export async function getAttendanceSummary(params = {}) {
  const response = await apiClient.get('/attendance/summary', { params })
  return response.data.data
}
