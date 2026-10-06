import apiClient from './axios';

export const consumptionApi = {
  // GET /api/consumption
  getConsumption: async (params = {}) => {
    const response = await apiClient.get('/api/consumption', { params });
    return response.data;
  },

  // GET /api/consumption/panel/:id
  getConsumptionByPanel: async (id) => {
    const response = await apiClient.get(`/api/consumption/panel/${id}`);
    return response.data;
  },

  // POST /api/consumption
  recordConsumption: async (readingData) => {
    const response = await apiClient.post('/api/consumption', readingData);
    return response.data;
  },

  // POST /api/consumption/demo
  seedDemoConsumption: async () => {
    const response = await apiClient.post('/api/consumption/demo');
    return response.data;
  },
};
