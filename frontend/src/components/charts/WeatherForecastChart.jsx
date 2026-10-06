import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { formatTime, formatDate } from '../../utils/formatters';

export const WeatherForecastChart = ({ hourlyForecast = [], height = 300 }) => {
  if (!hourlyForecast || hourlyForecast.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-xs text-slate-400">
        No forecast points available
      </div>
    );
  }

  const data = hourlyForecast.map((h, idx) => {
    let label = `+${idx}h`;
    if (h.time) {
      try {
        const d = new Date(h.time);
        label = `${d.getHours()}:00`;
      } catch {
        label = `+${idx}h`;
      }
    }
    return {
      time: label,
      expectedKW: Number(h.expectedGenerationKW ?? 0),
      irradiance: Number(h.solarIrradianceWPerM2 ?? 0),
      temp: Number(h.temperatureC ?? 0),
      cloudCover: Number(h.cloudCoverPercentage ?? 0)
    };
  });

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
          <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} />
          <YAxis yAxisId="left" stroke="#F59E0B" fontSize={11} tickLine={false} unit=" kW" />
          <YAxis yAxisId="right" orientation="right" stroke="#0EA5E9" fontSize={11} tickLine={false} unit=" W" />
          <Tooltip
            formatter={(value, name) => {
              if (name === 'expectedKW') return [`${value} kW`, 'Solar Generation'];
              if (name === 'irradiance') return [`${value} W/m²`, 'Solar Irradiance'];
              if (name === 'temp') return [`${value} °C`, 'Temperature'];
              return [value, name];
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(val) => (
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {val === 'expectedKW' ? 'Forecast Generation (kW)' : 'Irradiance (W/m²)'}
              </span>
            )}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="expectedKW"
            stroke="#F59E0B"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="irradiance"
            stroke="#0EA5E9"
            strokeWidth={1.5}
            strokeDasharray="3 3"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
