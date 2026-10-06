import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const BenchmarkBarChart = ({ leaderboard = [], height = 300 }) => {
  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-xs text-slate-400">
        No peer benchmark data available
      </div>
    );
  }

  const data = leaderboard.map((p) => ({
    name: p.isUser ? 'YOU' : `#${p.rank} Peer`,
    yieldKWhPerKW: Number(p.yieldKWhPerKW || 0),
    isUser: !!p.isUser,
    fullId: p.id
  }));

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit=" kWh/kWp" />
          <Tooltip
            formatter={(val, name, props) => [
              `${val} kWh/kWp`,
              props.payload.fullId
            ]}
          />
          <Bar dataKey="yieldKWhPerKW" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isUser ? '#F59E0B' : '#64748B'}
                stroke={entry.isUser ? '#FCD34D' : 'transparent'}
                strokeWidth={entry.isUser ? 2 : 0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
