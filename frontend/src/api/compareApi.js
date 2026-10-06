import apiClient from './axios';

export const compareApi = {
  // GET /api/compare/neighbors
  getNeighborsComparison: async () => {
    const response = await apiClient.get('/api/compare/neighbors');
    return response.data;
  },
};
