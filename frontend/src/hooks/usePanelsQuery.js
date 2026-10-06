import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { panelsApi } from '../api/panelsApi';
import toast from 'react-hot-toast';

export const usePanels = (params = {}) => {
  return useQuery({
    queryKey: ['panels', params],
    queryFn: () => panelsApi.getPanels(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const usePanel = (id) => {
  return useQuery({
    queryKey: ['panel', id],
    queryFn: () => panelsApi.getPanelById(id),
    enabled: !!id,
  });
};

export const useCreatePanel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (panelData) => panelsApi.createPanel(panelData),
    onSuccess: (data) => {
      toast.success(data?.message || 'Solar panel created successfully');
      queryClient.invalidateQueries({ queryKey: ['panels'] });
      queryClient.invalidateQueries({ queryKey: ['generation'] });
      queryClient.invalidateQueries({ queryKey: ['roi'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to create panel');
    },
  });
};

export const useUpdatePanel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, panelData }) => panelsApi.updatePanel(id, panelData),
    onSuccess: (data) => {
      toast.success(data?.message || 'Panel updated successfully');
      queryClient.invalidateQueries({ queryKey: ['panels'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to update panel');
    },
  });
};

export const useDeletePanel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => panelsApi.deletePanel(id),
    onSuccess: (data) => {
      toast.success(data?.message || 'Panel deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['panels'] });
      queryClient.invalidateQueries({ queryKey: ['generation'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete panel');
    },
  });
};
