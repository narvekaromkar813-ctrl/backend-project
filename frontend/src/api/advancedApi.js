import apiClient from './axios';

export const advancedApi = {
  // GET /api/advanced/battery
  getBatteryOptimization: async () => {
    const response = await apiClient.get('/api/advanced/battery');
    return response.data;
  },

  // GET /api/advanced/ev-scheduler
  getEVScheduler: async () => {
    const response = await apiClient.get('/api/advanced/ev-scheduler');
    return response.data;
  },

  // GET /api/advanced/carbon-savings
  getCarbonSavings: async () => {
    const response = await apiClient.get('/api/advanced/carbon-savings');
    return response.data;
  },

  // GET /api/advanced/incentives
  getIncentives: async () => {
    const response = await apiClient.get('/api/advanced/incentives');
    return response.data;
  },

  // POST /api/advanced/incentives
  createIncentiveClaim: async (claimData) => {
    const response = await apiClient.post('/api/advanced/incentives', claimData);
    return response.data;
  },
};
