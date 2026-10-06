import apiClient from './axios';

export const alertsApi = {
  // GET /api/alerts
  getAlerts: async (params = {}) => {
    const response = await apiClient.get('/api/alerts', { params });
    return response.data;
  },

  // POST /api/alerts/check (run diagnostics)
  checkAlerts: async () => {
    const response = await apiClient.post('/api/alerts/check');
    return response.data;
  },

  // GET /api/alerts/:id
  getAlertById: async (id) => {
    const response = await apiClient.get(`/api/alerts/${id}`);
    return response.data;
  },

  // PUT /api/alerts/:id/read
  markAlertRead: async (id) => {
    const response = await apiClient.put(`/api/alerts/${id}/read`);
    return response.data;
  },

  // PUT /api/alerts/:id/resolve
  resolveAlert: async (id) => {
    const response = await apiClient.put(`/api/alerts/${id}/resolve`);
    return response.data;
  },
};
