import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { formatTime } from '../../utils/formatters';

export const GenerationVsConsumptionChart = ({ data = [], height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-xs text-slate-400">
        No telemetry records available to plot
      </div>
    );
  }

  // Format data defensively
  const formattedData = data.map((item, idx) => ({
    time: item.timestamp ? formatTime(item.timestamp) : `Point ${idx + 1}`,
    generationKW: Number(item.generationKW ?? item.powerOutput ?? 0),
    consumptionKW: Number(item.consumptionKW ?? item.powerConsumed ?? 0),
  }));

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorCon" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
          <XAxis
            dataKey="time"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            unit=" kW"
          />
          <Tooltip
            formatter={(value, name) => [
              `${Number(value).toFixed(2)} kW`,
              name === 'generationKW' ? 'Solar Generation' : 'Load Consumption'
            ]}
          />
          <Legend
            verticalAlign="top"
            align="right"
            height={36}
            formatter={(value) => (
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {value === 'generationKW' ? 'Solar Generation' : 'Load Demand'}
              </span>
            )}
          />
          <Area
            type="monotone"
            dataKey="generationKW"
            stroke="#F59E0B"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorGen)"
          />
          <Area
            type="monotone"
            dataKey="consumptionKW"
            stroke="#0EA5E9"
            strokeWidth={2}
            strokeDasharray="4 4"
            fillOpacity={1}
            fill="url(#colorCon)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
