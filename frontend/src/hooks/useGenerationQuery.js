import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { generationApi } from '../api/generationApi';
import toast from 'react-hot-toast';

export const useGeneration = (params = {}) => {
  return useQuery({
    queryKey: ['generation', params],
    queryFn: () => generationApi.getGeneration(params),
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useGenerationByPanel = (id, params = {}) => {
  return useQuery({
    queryKey: ['generation', 'panel', id, params],
    queryFn: () => generationApi.getGenerationByPanel(id, params),
    enabled: !!id,
  });
};

export const useRecordGeneration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (readingData) => generationApi.recordGeneration(readingData),
    onSuccess: (data) => {
      toast.success(data?.message || 'Generation telemetry logged successfully');
      queryClient.invalidateQueries({ queryKey: ['generation'] });
      queryClient.invalidateQueries({ queryKey: ['grid'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['compare'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to record generation');
    },
  });
};

export const useSeedDemoGeneration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => generationApi.seedDemoGeneration(),
    onSuccess: (data) => {
      toast.success(data?.message || 'Demo daylight generation curve seeded!');
      queryClient.invalidateQueries({ queryKey: ['generation'] });
      queryClient.invalidateQueries({ queryKey: ['grid'] });
      queryClient.invalidateQueries({ queryKey: ['panels'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to seed demo generation');
    },
  });
};
