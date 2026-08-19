// Student API calls (admin-facing) — CRUD operations for managing all students.
import { apiClient } from './apiClient'

// List students with optional search, batch, team, status filters
export async function getStudents(params = {}) {
  const response = await apiClient.get('/students', { params })
  return response.data.data   // { students: [...], pagination: {...} }
}

// Get a single student by ID
export async function getStudent(id) {
  const response = await apiClient.get(`/students/${id}`)
  return response.data.data
}

export const getStudentById = getStudent

// Create a new student
export async function createStudent(data) {
  const response = await apiClient.post('/students', data)
  return response.data.data
}

// Update a student
export async function updateStudent(id, data) {
  const response = await apiClient.put(`/students/${id}`, data)
  return response.data.data
}

// Delete a student
export async function deleteStudent(id) {
  const response = await apiClient.delete(`/students/${id}`)
  return response.data.data
}

// Bulk import students from CSV file — sends FormData directly (multer expects multipart/form-data).
// Do NOT set Content-Type manually — Axios auto-generates the boundary needed by multer.
export async function bulkImportStudents(formData) {
  const response = await apiClient.post('/students/bulk-import', formData)
  return response.data.data
}

// Get next available roll number (for auto-suggestion in form)
export async function getNextRollNo() {
  const response = await apiClient.get('/students/utils/next-roll-no')
  return response.data.data
}

// Admin resets a student's password
export async function resetStudentPassword(studentId, newPassword) {
  const response = await apiClient.post('/auth/reset-student-password', { studentId, newPassword })
  return response.data.data
}
