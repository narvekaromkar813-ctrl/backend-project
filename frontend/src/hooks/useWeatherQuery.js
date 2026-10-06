import { useQuery } from '@tanstack/react-query';
import { weatherApi } from '../api/weatherApi';

export const useWeatherImpact = (params = {}) => {
  return useQuery({
    queryKey: ['weather', 'impact', params],
    queryFn: () => weatherApi.getWeatherImpact(params),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useWeatherForecast = (params = {}) => {
  return useQuery({
    queryKey: ['weather', 'forecast', params],
    queryFn: () => weatherApi.getWeatherForecast(params),
    staleTime: 1000 * 60 * 10,
  });
};
