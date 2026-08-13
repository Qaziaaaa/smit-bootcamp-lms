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

export async function getStudentProjects() {
  try {
    const response = await apiClient.get('/student/projects')
    return response.data.data
  } catch (error) {
    // If route doesn't exist yet, return mock data
    if (error.response?.status === 404) {
      return [
        {
          _id: 'mock-1',
          title: 'Full Stack E-Commerce Platform',
          description: 'Build a complete e-commerce platform using the MERN stack with authentication and payment integration.',
          status: 'active',
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          team: { name: 'Team Alpha', memberCount: 4 }
        },
        {
          _id: 'mock-2',
          title: 'React Portfolio Website',
          description: 'Create a personal portfolio website to showcase your skills and projects.',
          status: 'completed',
          deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ]
    }
    throw error
  }
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
