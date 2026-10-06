import apiClient from './axios';

export const authApi = {
  // POST /api/auth/register
  register: async (userData) => {
    const response = await apiClient.post('/api/auth/register', userData);
    return response.data;
  },

  // POST /api/auth/login
  login: async (credentials) => {
    const response = await apiClient.post('/api/auth/login', credentials);
    return response.data;
  },

  // GET /api/auth/me
  getMe: async () => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  // PUT /api/auth/profile
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/api/auth/profile', profileData);
    return response.data;
  },

  // PUT /api/auth/change-password
  changePassword: async (passwordData) => {
    const response = await apiClient.put('/api/auth/change-password', passwordData);
    return response.data;
  },
};
