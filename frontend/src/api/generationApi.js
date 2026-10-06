import apiClient from './axios';

export const generationApi = {
  // GET /api/generation
  getGeneration: async (params = {}) => {
    const response = await apiClient.get('/api/generation', { params });
    return response.data;
  },

  // GET /api/generation/panel/:id
  getGenerationByPanel: async (id, params = {}) => {
    const response = await apiClient.get(`/api/generation/panel/${id}`, { params });
    return response.data;
  },

  // POST /api/generation
  recordGeneration: async (readingData) => {
    const response = await apiClient.post('/api/generation', readingData);
    return response.data;
  },

  // POST /api/generation/demo
  seedDemoGeneration: async () => {
    const response = await apiClient.post('/api/generation/demo');
    return response.data;
  },
};
