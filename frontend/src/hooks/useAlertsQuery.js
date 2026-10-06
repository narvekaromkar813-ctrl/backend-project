import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '../api/alertsApi';
import toast from 'react-hot-toast';

export const useAlerts = (params = {}) => {
  return useQuery({
    queryKey: ['alerts', params],
    queryFn: () => alertsApi.getAlerts(params),
    staleTime: 1000 * 30,
  });
};

export const useAlert = (id) => {
  return useQuery({
    queryKey: ['alert', id],
    queryFn: () => alertsApi.getAlertById(id),
    enabled: !!id,
  });
};

export const useCheckAlerts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => alertsApi.checkAlerts(),
    onSuccess: (data) => {
      const count = data?.alertsCreatedCount || data?.alertsCreated?.length || 0;
      toast.success(
        data?.message ||
          (count > 0 ? `Diagnostics complete: ${count} issues detected` : 'Diagnostics complete: All systems normal')
      );
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Diagnostic check failed');
    },
  });
};

export const useMarkAlertRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => alertsApi.markAlertRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to update alert');
    },
  });
};

export const useResolveAlert = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => alertsApi.resolveAlert(id),
    onSuccess: () => {
      toast.success('Alert resolved successfully');
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to resolve alert');
    },
  });
};
