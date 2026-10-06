import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const COLORS = [
  '#F59E0B', // Amber (HVAC)
  '#0EA5E9', // Sky (Water heater)
  '#10B981', // Emerald (Appliances)
  '#8B5CF6', // Purple (Lighting)
  '#EC4899', // Pink (EV)
  '#64748B'  // Slate (General)
];

export const AppliancePieChart = ({ readings = [], height = 280 }) => {
  if (!readings || readings.length === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center text-xs text-slate-400">
        No consumption appliance categories recorded
      </div>
    );
  }

  // Aggregate by applianceCategory
  const categoryTotals = {};
  readings.forEach((r) => {
    const category = r.applianceCategory || 'general';
    const energy = Number(r.energyConsumed || r.powerConsumed || 0);
    categoryTotals[category] = (categoryTotals[category] || 0) + energy;
  });

  const data = Object.entries(categoryTotals).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').toUpperCase(),
    value: parseFloat(value.toFixed(2)),
  }));

  if (data.length === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center text-xs text-slate-400">
        No appliance breakdown data
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value} kWh`, 'Energy Consumed']}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            formatter={(value) => (
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
