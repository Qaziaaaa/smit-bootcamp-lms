import { apiClient } from './apiClient'

export const getBatches = async (params = {}) => {
  const response = await apiClient.get('/batches', { params })
  return response.data.data
}
