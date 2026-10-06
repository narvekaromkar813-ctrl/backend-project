import apiClient from './axios';

export const roiApi = {
  // GET /api/roi
  getROI: async () => {
    const response = await apiClient.get('/api/roi');
    return response.data;
  },

  // GET /api/roi/calculate
  calculateCustomROI: async (params = {}) => {
    const response = await apiClient.get('/api/roi/calculate', { params });
    return response.data;
  },
};
