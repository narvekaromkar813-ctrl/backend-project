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
import { formatCurrency } from '../../utils/formatters';

export const MonthlySavingsChart = ({ monthlyBreakdown = [], height = 300 }) => {
  if (!monthlyBreakdown || monthlyBreakdown.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-xs text-slate-400">
        No monthly utility billing breakdown data available
      </div>
    );
  }

  const data = monthlyBreakdown.map((m) => ({
    month: m.billingMonth || '—',
    WithoutSolar: Number(m.grossAmountWithoutSolar || 0),
    NetPayable: Number(m.netPayable || 0),
    Savings: Number(m.solarSavings || 0),
  }));

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            tickFormatter={(val) => `₹${val}`}
          />
          <Tooltip
            formatter={(value, name) => [
              formatCurrency(value),
              name === 'WithoutSolar'
                ? 'Standard Utility Cost'
                : name === 'NetPayable'
                ? 'Actual Net Paid'
                : 'Solar Savings'
            ]}
          />
          <Legend
            verticalAlign="top"
            height={36}
            formatter={(val) => (
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {val === 'WithoutSolar'
                  ? 'Standard Cost'
                  : val === 'NetPayable'
                  ? 'Net Payable'
                  : 'Solar Savings'}
              </span>
            )}
          />
          <Bar dataKey="WithoutSolar" fill="#94A3B8" radius={[4, 4, 0, 0]} />
          <Bar dataKey="NetPayable" fill="#F43F5E" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Savings" fill="#10B981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
