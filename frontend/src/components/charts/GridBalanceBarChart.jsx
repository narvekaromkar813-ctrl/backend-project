import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const GridBalanceBarChart = ({
  generationKWh = 0,
  consumptionKWh = 0,
  exportedKWh = 0,
  importedKWh = 0,
  height = 280
}) => {
  const data = [
    {
      name: 'Energy Flow',
      SolarGeneration: Number(generationKWh),
      HomeConsumption: Number(consumptionKWh),
      GridExport: Number(exportedKWh),
      GridImport: Number(importedKWh),
    }
  ];

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit=" kWh" />
          <Tooltip formatter={(value) => [`${Number(value).toFixed(2)} kWh`]} />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(val) => (
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {val.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            )}
          />
          <Bar dataKey="SolarGeneration" fill="#F59E0B" radius={[6, 6, 0, 0]} />
          <Bar dataKey="HomeConsumption" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
          <Bar dataKey="GridExport" fill="#10B981" radius={[6, 6, 0, 0]} />
          <Bar dataKey="GridImport" fill="#F43F5E" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
