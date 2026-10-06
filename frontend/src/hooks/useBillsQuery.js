import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billsApi } from '../api/billsApi';
import toast from 'react-hot-toast';

export const useBills = () => {
  return useQuery({
    queryKey: ['bills'],
    queryFn: () => billsApi.getBills(),
    staleTime: 1000 * 60,
  });
};

export const usePredictBill = () => {
  return useQuery({
    queryKey: ['bills', 'predict'],
    queryFn: () => billsApi.predictBill(),
    staleTime: 1000 * 60,
  });
};

export const useMonthlyBills = (params = {}) => {
  return useQuery({
    queryKey: ['bills', 'monthly', params],
    queryFn: () => billsApi.getMonthlyBills(params),
    staleTime: 1000 * 60,
  });
};

export const useCreateBill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (billData) => billsApi.createBill(billData),
    onSuccess: (data) => {
      toast.success(data?.message || 'Electricity bill recorded successfully');
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to record bill');
    },
  });
};
