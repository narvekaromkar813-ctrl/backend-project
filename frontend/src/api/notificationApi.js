import apiClient from './axios';

export const notificationApi = {
  // POST /api/notifications/send
  sendNotification: async (payload) => {
    const response = await apiClient.post('/api/notifications/send', payload);
    return response.data;
  },
};
