import { apiClient } from './apiClient'

export async function login({ email, password, role }) {
  const response = await apiClient.post('/auth/login', { email, password, role })
  return response.data.data
}

export async function logout() {
  await apiClient.post('/auth/logout')
}

export async function getMe() {
  const response = await apiClient.get('/auth/me')
  return response.data.data
}
