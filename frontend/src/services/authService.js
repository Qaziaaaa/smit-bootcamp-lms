import apiClient from './apiClient.js';

const login = async ({ email, password }) => {
  const { data } = await apiClient.post('/auth/login', { email, password });
  return data.data;
};

const getMe = async () => {
  const { data } = await apiClient.get('/auth/me');
  return data.data;
};

const logout = async () => {
  await apiClient.post('/auth/logout');
};

export default {
  login,
  getMe,
  logout,
};
