import apiClient from './axios';

export const weatherApi = {
  // GET /api/weather/impact
  getWeatherImpact: async (params = {}) => {
    const response = await apiClient.get('/api/weather/impact', { params });
    return response.data;
  },

  // GET /api/weather/forecast
  getWeatherForecast: async (params = {}) => {
    const response = await apiClient.get('/api/weather/forecast', { params });
    return response.data;
  },
};
