import React, { useState } from 'react';
import {
  CloudSun,
  Sun,
  Thermometer,
  Cloud,
  Droplets,
  Search,
  Wind,
  Zap,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import { useWeatherImpact, useWeatherForecast } from '../hooks/useWeatherQuery';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { CardSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { WeatherForecastChart } from '../components/charts/WeatherForecastChart';
import { formatPower, formatPercentage, formatEnergy } from '../utils/formatters';

const PRESET_CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Ahmedabad', 'Chennai'];

export const Weather = () => {
  const [cityInput, setCityInput] = useState('Mumbai');
  const [activeCity, setActiveCity] = useState('Mumbai');

  const {
    data: impactRes,
    isLoading: impactLoading,
    error: impactError,
    refetch: refetchImpact
  } = useWeatherImpact({ city: activeCity });

  const {
    data: forecastRes,
    isLoading: forecastLoading,
    error: forecastError,
    refetch: refetchForecast
  } = useWeatherForecast({ city: activeCity });

  const isLoading = impactLoading || forecastLoading;
  const isError = impactError || forecastError;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (cityInput.trim()) {
      setActiveCity(cityInput.trim());
    }
  };

  const handleSelectCity = (c) => {
    setCityInput(c);
    setActiveCity(c);
  };

  const weather = impactRes?.currentWeather || {};
  const impact = impactRes?.impactAnalysis || {};
  const forecast = forecastRes?.hourlyForecast || [];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Solar Weather & Irradiance Analysis</span>
            <Badge variant="solar" size="sm">
              {impactRes?.location?.city || activeCity}
            </Badge>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Atmospheric derating model for temperature coefficient and cloud albedo
          </p>
        </div>

        <Button
          onClick={() => {
            refetchImpact();
            refetchForecast();
          }}
          variant="outline"
          size="sm"
          icon={RefreshCw}
        >
          Refresh Data
        </Button>
      </div>

      {/* City Search and Preset Pills */}
      <Card className="p-4 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Search Indian city (e.g. Mumbai, Jaipur, Hyderabad)..."
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
            />
          </div>
          <Button type="submit" variant="primary">
            Analyze
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400 font-medium">Quick Regional Presets:</span>
          {PRESET_CITIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleSelectCity(c)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeCity === c
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </Card>

      {isError && (
        <ErrorState
          title="Weather Telemetry Error"
          message={impactError?.response?.data?.message || 'Could not fetch weather data from meteorology service.'}
          onRetry={() => {
            refetchImpact();
            refetchForecast();
          }}
        />
      )}

      {/* Current Meteorology & Solar Derating Cards */}
      {isLoading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Solar Irradiance */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Direct Irradiance
              </span>
              <Sun className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-2xl font-bold text-amber-500 mt-2 block">
              {weather.solarIrradianceWPerM2 ?? 850} W/m²
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              Peak solar insolation
            </span>
          </Card>

          {/* Card 2: Ambient Temperature */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Ambient Temperature
              </span>
              <Thermometer className="w-5 h-5 text-rose-500" />
            </div>
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2 block">
              {weather.temperatureC ?? 32}°C
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              Derating coefficient: -0.4%/°C above 25°C
            </span>
          </Card>

          {/* Card 3: Cloud Coverage */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Cloud Cover Loss
              </span>
              <Cloud className="w-5 h-5 text-sky-500" />
            </div>
            <span className="text-2xl font-bold text-sky-500 mt-2 block">
              {weather.cloudCoverPercentage ?? 15}%
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              Humidity: {weather.relativeHumidity ?? 65}%
            </span>
          </Card>

          {/* Card 4: Net Photovoltaic Efficiency */}
          <Card className="p-5 border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Operating Efficiency
              </span>
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-2xl font-extrabold text-amber-500 mt-2 block">
              {formatPercentage(impact.overallEfficiencyPercentage ?? 88)}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              Est. output: {formatPower(impact.estimatedInstantaneousGenerationKW ?? 4.4)}
            </span>
          </Card>
        </div>
      )}

      {/* 48-Hour Forecast Chart */}
      <Card>
        <CardHeader
          title="48-Hour Solar Generation & Irradiance Forecast"
          subtitle={`Projected clean generation for ${forecastRes?.city || activeCity} (${forecastRes?.projectedDayGenerationKWh || 24} kWh expected)`}
        />
        <CardContent>
          <WeatherForecastChart hourlyForecast={forecast} height={320} />
        </CardContent>
      </Card>
    </div>
  );
};
