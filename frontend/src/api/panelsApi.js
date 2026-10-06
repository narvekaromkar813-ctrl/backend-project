import apiClient from './axios';

export const panelsApi = {
  // GET /api/panels
  getPanels: async (params = {}) => {
    const response = await apiClient.get('/api/panels', { params });
    return response.data;
  },

  // GET /api/panels/:id
  getPanelById: async (id) => {
    const response = await apiClient.get(`/api/panels/${id}`);
    return response.data;
  },

  // POST /api/panels
  createPanel: async (panelData) => {
    const response = await apiClient.post('/api/panels', panelData);
    return response.data;
  },

  // PUT /api/panels/:id
  updatePanel: async (id, panelData) => {
    const response = await apiClient.put(`/api/panels/${id}`, panelData);
    return response.data;
  },

  // DELETE /api/panels/:id
  deletePanel: async (id) => {
    const response = await apiClient.delete(`/api/panels/${id}`);
    return response.data;
  },
};
