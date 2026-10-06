import apiClient from './axios';

export const healthApi = {
  // GET /api/health
  getHealth: async () => {
    const response = await apiClient.get('/api/health');
    return response.data;
  },
};
