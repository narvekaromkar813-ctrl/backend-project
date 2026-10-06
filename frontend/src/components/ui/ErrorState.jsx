import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const ErrorState = ({
  title = 'Failed to Load Data',
  message = 'An unexpected error occurred while communicating with the server.',
  onRetry,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 backdrop-blur-sm ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-rose-900 dark:text-rose-200 mb-1">{title}</h4>
      <p className="text-sm text-rose-700 dark:text-rose-400 max-w-md mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="danger" icon={RefreshCw} size="sm">
          Try Again
        </Button>
      )}
    </div>
  );
};
