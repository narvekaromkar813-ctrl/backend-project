/**
 * General UI and status helper utilities
 */

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function getSeverityStyle(severity = 'low') {
  const norm = String(severity).toLowerCase();
  switch (norm) {
    case 'critical':
    case 'high':
      return {
        bg: 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60',
        badge: 'bg-rose-500',
        text: 'text-rose-600 dark:text-rose-400'
      };
    case 'medium':
    case 'warning':
      return {
        bg: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
        badge: 'bg-amber-500',
        text: 'text-amber-600 dark:text-amber-400'
      };
    case 'low':
    case 'info':
    default:
      return {
        bg: 'bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800/60',
        badge: 'bg-sky-500',
        text: 'text-sky-600 dark:text-sky-400'
      };
  }
}

export function getStatusBadge(status = 'active') {
  const norm = String(status).toLowerCase();
  switch (norm) {
    case 'active':
    case 'paid':
    case 'resolved':
    case 'approved':
      return 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60';
    case 'maintenance':
    case 'pending':
    case 'submitted':
      return 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60';
    case 'inactive':
    case 'offline':
    case 'overdue':
    case 'rejected':
      return 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60';
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  }
}
