import { apiClient } from './apiClient'

// Fetches the logged-in student's profile (name, email, batch, teamId)
export async function getStudentProfile() {
  const response = await apiClient.get('/student/profile')
  return response.data.data
}

// Fetches the student's attendance records + summary (present, absent, totalDays, percentage)
export async function getStudentAttendance() {
  const response = await apiClient.get('/student/attendance')
  return response.data.data
}

// Fetches the student's team details (name, project)
export async function getStudentTeam() {
  const response = await apiClient.get('/student/team')
  return response.data.data
}

// Fetches the projects assigned to the logged-in student
export async function getStudentProjects() {
  const response = await apiClient.get('/student/projects')
  return response.data.data
}

// Fetches the tasks assigned to the logged-in student
export async function getStudentTasks() {
  const response = await apiClient.get('/student/tasks')
  return response.data.data
}

// Updates the status of one of the student's tasks (in-progress / completed)
export async function updateTaskProgress(taskId, status) {
  const response = await apiClient.put(`/student/tasks/${taskId}/progress`, { status })
  return response.data.data
}
