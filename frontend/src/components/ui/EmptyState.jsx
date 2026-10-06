import React from 'react';
import { Sun, ArrowRight } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = Sun,
  title = 'No Data Available',
  description = 'There are no records to display at this time.',
  actionLabel,
  onAction,
  actionIcon: ActionIcon = ArrowRight,
  secondaryActionLabel,
  onSecondaryAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-navy-900/30 backdrop-blur-sm ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-solar-500 flex items-center justify-center mb-4 shadow-solar-glow">
        <Icon className="w-7 h-7 stroke-[1.75]" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <Button onClick={onAction} variant="primary" icon={ActionIcon}>
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button onClick={onSecondaryAction} variant="secondary">
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
