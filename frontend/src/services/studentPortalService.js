import apiClient from './apiClient.js';

const getProfile = async () => {
  const { data } = await apiClient.get('/student/profile');
  return data.data;
};

const getAttendance = async () => {
  const { data } = await apiClient.get('/student/attendance');
  return data.data;
};

const getTeam = async () => {
  const { data } = await apiClient.get('/student/team');
  return data.data;
};

const getTasks = async () => {
  const { data } = await apiClient.get('/student/tasks');
  return data.data;
};

const updateTaskProgress = async ({ taskId, status }) => {
  const { data } = await apiClient.put(`/student/tasks/${taskId}/progress`, { status });
  return data.data;
};

export default {
  getProfile,
  getAttendance,
  getTeam,
  getTasks,
  updateTaskProgress,
};
