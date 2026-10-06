import React from 'react';
import { Link } from 'react-router-dom';
import { SunMedium, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 text-center relative overflow-hidden">
      {/* Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md relative z-10 space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 shadow-solar-glow mb-2">
          <SunMedium className="w-8 h-8 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
            404
          </h1>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Solar Telemetry Coordinate Not Found
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            The page or solar array you requested does not exist or has been decommissioned.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link to="/dashboard">
            <Button variant="primary" icon={Home}>
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
