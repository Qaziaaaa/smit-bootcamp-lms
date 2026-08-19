// Student self-service API (student-facing) — profile, attendance, team, projects, tasks.
// These endpoints use the student's own JWT token — no studentId needed.
import { apiClient } from './apiClient'

// Get the logged-in student's profile
export async function getStudentProfile() {
  const response = await apiClient.get('/student/profile')
  return response.data.data
}

// Get attendance records + summary
export async function getStudentAttendance() {
  const response = await apiClient.get('/student/attendance')
  return response.data.data
}

// Get the student's team info + members + project
export async function getStudentTeam() {
  const response = await apiClient.get('/student/team')
  return response.data.data
}

// Get tasks assigned to this student
export async function getStudentTasks() {
  const response = await apiClient.get('/student/tasks')
  return response.data.data
}

// Get projects assigned to the student's team
export async function getStudentProjects() {
  const response = await apiClient.get('/student/projects')
  return response.data.data
}

// Get a single project (only if it belongs to the student's team)
export async function getStudentProjectById(id) {
  const response = await apiClient.get(`/student/projects/${id}`)
  return response.data.data
}

// Update task status (student can only update their own tasks)
export async function updateTaskProgress(taskId, status) {
  const response = await apiClient.put(`/student/tasks/${taskId}/progress`, { status })
  return response.data.data
}

// Change the student's own password (requires old password)
export async function changeStudentPassword({ oldPassword, password, confirmPassword }) {
  const response = await apiClient.post('/auth/change-password', { oldPassword, password, confirmPassword })
  return response.data.data
}

// Changes the logged-in student's own password
export async function changePassword(currentPassword, newPassword) {
  const response = await apiClient.put('/student/change-password', { currentPassword, newPassword })
  return response.data.data
}
