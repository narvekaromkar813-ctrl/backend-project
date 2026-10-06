import React from 'react';
import { Card, CardHeader, CardContent } from './Card';
import { formatDate } from '../../utils/formatters';

export const FallbackCard = ({
  title = 'Additional System Data',
  subtitle = 'Defensive field inspector',
  data = {},
  className = ''
}) => {
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return null;
  }

  // Filter out internal MongoDB / sensitive keys
  const ignoredKeys = new Set(['_id', '__v', 'password', 'user', 'tokens']);
  const entries = Object.entries(data).filter(([k]) => !ignoredKeys.has(k));

  if (entries.length === 0) return null;

  return (
    <Card className={className}>
      <CardHeader title={title} subtitle={subtitle} />
      <CardContent>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {entries.map(([key, val]) => {
            const label = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/_/g, ' ')
              .toLowerCase()
              .replace(/^./, (str) => str.toUpperCase());

            let displayVal = val;
            if (val === null || val === undefined) {
              displayVal = '—';
            } else if (typeof val === 'boolean') {
              displayVal = val ? 'Yes' : 'No';
            } else if (typeof val === 'object') {
              displayVal = JSON.stringify(val);
            } else if (typeof val === 'number') {
              displayVal = val.toLocaleString();
            } else if (String(val).match(/^\d{4}-\d{2}-\d{2}T/)) {
              displayVal = formatDate(val);
            }

            return (
              <div
                key={key}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-navy-950/40"
              >
                <dt className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {label}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {String(displayVal)}
                </dd>
              </div>
            );
          })}
        </dl>
      </CardContent>
    </Card>
  );
};
