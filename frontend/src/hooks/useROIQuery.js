import { useQuery } from '@tanstack/react-query';
import { roiApi } from '../api/roiApi';

export const useROI = () => {
  return useQuery({
    queryKey: ['roi'],
    queryFn: () => roiApi.getROI(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCustomROI = (params = {}, enabled = true) => {
  return useQuery({
    queryKey: ['roi', 'calculate', params],
    queryFn: () => roiApi.calculateCustomROI(params),
    enabled: enabled && Object.keys(params).length > 0,
    staleTime: 1000 * 60,
  });
};
