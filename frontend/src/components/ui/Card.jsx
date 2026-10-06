import React from 'react';
import { cn } from '../../utils/helpers';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  glow = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-navy-900/80 shadow-sm backdrop-blur-md transition-all duration-200',
        hoverEffect && 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5',
        glow && 'hover:shadow-solar-glow hover:border-amber-400/40',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={cn('flex items-center justify-between p-5 pb-3 border-b border-slate-100 dark:border-slate-800/60', className)}>
      <div>
        {title && <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>}
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export const CardContent = ({ children, className = '' }) => {
  return <div className={cn('p-5', className)}>{children}</div>;
};

export const CardFooter = ({ children, className = '' }) => {
  return <div className={cn('p-4 px-5 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-navy-950/30 rounded-b-2xl', className)}>{children}</div>;
};
