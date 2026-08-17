// Dashboard API call — fetches all stats for the admin dashboard.
import { apiClient } from './apiClient'

export async function getDashboard() {
  return getDashboardStats()
}

export async function getDashboardStats() {
  const response = await apiClient.get('/dashboard/stats')
  return response.data.data   // { counts, taskStatus, todayAttendance, activeBatch, recentStudents, recentTasks }
}
