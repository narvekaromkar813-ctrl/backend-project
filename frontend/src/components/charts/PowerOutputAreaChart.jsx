import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { formatTime } from '../../utils/formatters';

export const PowerOutputAreaChart = ({ readings = [], height = 280 }) => {
  if (!readings || readings.length === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center text-xs text-slate-400">
        No generation telemetry records recorded
      </div>
    );
  }

  // Sort chronologically for proper curve plotting
  const sorted = [...readings].sort(
    (a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0)
  );

  const data = sorted.map((r, idx) => ({
    time: r.timestamp ? formatTime(r.timestamp) : `T-${idx}`,
    powerKW: Number(r.powerOutput ?? 0),
    energyKWh: Number(r.energyGenerated ?? 0),
    irradiance: Number(r.irradiance ?? 0),
    temperature: Number(r.temperature ?? 0)
  }));

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="solarPowerGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#EA580C" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
          <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit=" kW" />
          <Tooltip
            formatter={(value, name) => {
              if (name === 'powerKW') return [`${value} kW`, 'Power Output'];
              if (name === 'energyKWh') return [`${value} kWh`, 'Energy Generated'];
              return [value, name];
            }}
          />
          <Area
            type="monotone"
            dataKey="powerKW"
            stroke="#F59E0B"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#solarPowerGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
