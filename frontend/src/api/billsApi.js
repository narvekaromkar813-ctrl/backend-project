import apiClient from './axios';

export const billsApi = {
  // GET /api/bills
  getBills: async () => {
    const response = await apiClient.get('/api/bills');
    return response.data;
  },

  // GET /api/bills/predict
  predictBill: async () => {
    const response = await apiClient.get('/api/bills/predict');
    return response.data;
  },

  // GET /api/bills/monthly
  getMonthlyBills: async (params = {}) => {
    const response = await apiClient.get('/api/bills/monthly', { params });
    return response.data;
  },

  // POST /api/bills
  createBill: async (billData) => {
    const response = await apiClient.post('/api/bills', billData);
    return response.data;
  },
};
