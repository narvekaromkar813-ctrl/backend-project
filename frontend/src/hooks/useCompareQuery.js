import { useQuery } from '@tanstack/react-query';
import { compareApi } from '../api/compareApi';

export const useNeighborsComparison = () => {
  return useQuery({
    queryKey: ['compare', 'neighbors'],
    queryFn: () => compareApi.getNeighborsComparison(),
    staleTime: 1000 * 60 * 5,
  });
};
