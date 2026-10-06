import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from './Card';
import { cn } from '../../utils/helpers';

export const StatCard = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  trend, // { value: '+12%', isPositive: true }
  accentColor = 'amber', // 'amber' | 'orange' | 'emerald' | 'sky' | 'rose' | 'purple'
  live = false,
  className = '',
  onClick
}) => {
  const accentStyles = {
    amber: {
      iconBg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-500',
      borderGlow: 'hover:border-amber-500/40',
    },
    orange: {
      iconBg: 'bg-orange-500/10 dark:bg-orange-500/20 text-orange-500',
      borderGlow: 'hover:border-orange-500/40',
    },
    emerald: {
      iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500',
      borderGlow: 'hover:border-emerald-500/40',
    },
    sky: {
      iconBg: 'bg-sky-500/10 dark:bg-sky-500/20 text-sky-500',
      borderGlow: 'hover:border-sky-500/40',
    },
    rose: {
      iconBg: 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-500',
      borderGlow: 'hover:border-rose-500/40',
    },
    purple: {
      iconBg: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-500',
      borderGlow: 'hover:border-purple-500/40',
    },
  };

  const style = accentStyles[accentColor] || accentStyles.amber;

  return (
    <Card
      hoverEffect
      onClick={onClick}
      className={cn(
        'p-5 relative overflow-hidden transition-all duration-300',
        style.borderGlow,
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Background radial gradient accent */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br from-amber-400 to-orange-500 blur-xl pointer-events-none" />

      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={cn('p-2.5 rounded-xl flex items-center justify-center shrink-0', style.iconBg)}>
            <Icon className="w-5 h-5 stroke-[2]" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          {value ?? '—'}
        </span>
        {unit && (
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {unit}
          </span>
        )}
        {live && (
          <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Live
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs">
          {subtitle && (
            <p className="text-slate-500 dark:text-slate-400 line-clamp-1 truncate">
              {subtitle}
            </p>
          )}
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-semibold shrink-0 ml-2',
                trend.isPositive ? 'text-emerald-500' : 'text-rose-500'
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {trend.value}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};
