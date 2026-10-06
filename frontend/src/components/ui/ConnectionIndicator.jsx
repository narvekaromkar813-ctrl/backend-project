import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { Radio } from 'lucide-react';
import { cn } from '../../utils/helpers';

export const ConnectionIndicator = ({ showLabel = true, className = '' }) => {
  const { status } = useSocket();

  const config = {
    live: {
      color: 'bg-emerald-500',
      ping: 'bg-emerald-400',
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
      label: 'Live Stream'
    },
    connecting: {
      color: 'bg-amber-500',
      ping: 'bg-amber-400',
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
      label: 'Connecting...'
    },
    offline: {
      color: 'bg-slate-400',
      ping: 'hidden',
      text: 'text-slate-500 dark:text-slate-400',
      bg: 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700',
      label: 'Offline'
    }
  };

  const current = config[status] || config.offline;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-300',
        current.bg,
        current.text,
        className
      )}
      title={`Telemetry WebSocket: ${current.label}`}
    >
      <span className="relative flex h-2 w-2">
        {status === 'live' && (
          <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', current.ping)} />
        )}
        <span className={cn('relative inline-flex rounded-full h-2 w-2', current.color)} />
      </span>
      {showLabel && <span>{current.label}</span>}
    </div>
  );
};
