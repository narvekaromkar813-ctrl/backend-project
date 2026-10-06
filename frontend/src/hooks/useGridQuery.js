import { useQuery } from '@tanstack/react-query';
import { gridApi } from '../api/gridApi';

export const useGridExport = (params = {}) => {
  return useQuery({
    queryKey: ['grid', 'export', params],
    queryFn: () => gridApi.getGridExport(params),
    staleTime: 1000 * 30,
  });
};

export const useGridImport = (params = {}) => {
  return useQuery({
    queryKey: ['grid', 'import', params],
    queryFn: () => gridApi.getGridImport(params),
    staleTime: 1000 * 30,
  });
};
