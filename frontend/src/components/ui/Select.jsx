import React, { forwardRef } from 'react';
import { cn } from '../../utils/helpers';

export const Select = forwardRef(({
  label,
  options = [],
  error,
  helperText,
  className = '',
  id,
  children,
  ...props
}, ref) => {
  const selectId = id || props.name;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={cn(
          'w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all duration-200 outline-none',
          'bg-white dark:bg-navy-950/60 text-slate-900 dark:text-slate-100',
          'border-slate-300 dark:border-slate-700/80',
          'focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20',
          error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white dark:bg-navy-900 text-slate-900 dark:text-slate-100">
            {opt.label}
          </option>
        ))}
        {children}
      </select>
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
      {!error && helperText && (
        <p className="text-xs text-slate-400 dark:text-slate-500">{helperText}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
