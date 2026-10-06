import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { advancedApi } from '../api/advancedApi';
import toast from 'react-hot-toast';

export const useBatteryOptimization = () => {
  return useQuery({
    queryKey: ['advanced', 'battery'],
    queryFn: () => advancedApi.getBatteryOptimization(),
    staleTime: 1000 * 60 * 2,
  });
};

export const useEVScheduler = () => {
  return useQuery({
    queryKey: ['advanced', 'ev-scheduler'],
    queryFn: () => advancedApi.getEVScheduler(),
    staleTime: 1000 * 60 * 2,
  });
};

export const useCarbonSavings = () => {
  return useQuery({
    queryKey: ['advanced', 'carbon-savings'],
    queryFn: () => advancedApi.getCarbonSavings(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useIncentives = () => {
  return useQuery({
    queryKey: ['advanced', 'incentives'],
    queryFn: () => advancedApi.getIncentives(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateIncentiveClaim = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (claimData) => advancedApi.createIncentiveClaim(claimData),
    onSuccess: (data) => {
      toast.success(data?.message || 'Subsidy claim submitted successfully');
      queryClient.invalidateQueries({ queryKey: ['advanced', 'incentives'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit incentive claim');
    },
  });
};
