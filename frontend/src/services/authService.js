// Auth API calls — login, logout, get current user.
import { apiClient } from './apiClient'

// Login — sends email + password + role, returns token + user info
export async function login({ email, password, role }) {
  const response = await apiClient.post('/auth/login', { email, password, role })
  return response.data.data   // { token, user: { id, email, role } }
}

// Get current user — called on page load to verify token is still valid
export async function getMe() {
  const response = await apiClient.get('/auth/me')
  return response.data.data   // { id, email, role }
}

// Logout — server-side token invalidation (optional)
export async function logout() {
  const response = await apiClient.post('/auth/logout')
  return response.data.data
}
