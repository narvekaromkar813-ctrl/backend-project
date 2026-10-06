import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consumptionApi } from '../api/consumptionApi';
import toast from 'react-hot-toast';

export const useConsumption = (params = {}) => {
  return useQuery({
    queryKey: ['consumption', params],
    queryFn: () => consumptionApi.getConsumption(params),
    staleTime: 1000 * 30,
  });
};

export const useConsumptionByPanel = (id) => {
  return useQuery({
    queryKey: ['consumption', 'panel', id],
    queryFn: () => consumptionApi.getConsumptionByPanel(id),
    enabled: !!id,
  });
};

export const useRecordConsumption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (readingData) => consumptionApi.recordConsumption(readingData),
    onSuccess: (data) => {
      toast.success(data?.message || 'Consumption reading recorded');
      queryClient.invalidateQueries({ queryKey: ['consumption'] });
      queryClient.invalidateQueries({ queryKey: ['grid'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to record consumption');
    },
  });
};

export const useSeedDemoConsumption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => consumptionApi.seedDemoConsumption(),
    onSuccess: (data) => {
      toast.success(data?.message || 'Demo consumption profile (~12 kWh) seeded!');
      queryClient.invalidateQueries({ queryKey: ['consumption'] });
      queryClient.invalidateQueries({ queryKey: ['grid'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to seed demo consumption');
    },
  });
};
