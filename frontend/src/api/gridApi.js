import apiClient from './axios';

export const gridApi = {
  // GET /api/grid/export
  getGridExport: async (params = {}) => {
    const response = await apiClient.get('/api/grid/export', { params });
    return response.data;
  },

  // GET /api/grid/import
  getGridImport: async (params = {}) => {
    const response = await apiClient.get('/api/grid/import', { params });
    return response.data;
  },
};
