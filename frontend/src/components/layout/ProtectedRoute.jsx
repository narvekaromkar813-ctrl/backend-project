import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sun } from 'lucide-react';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100">
        <div className="relative flex items-center justify-center mb-4">
          <Sun className="w-12 h-12 text-amber-500 animate-spin-slow" />
          <div className="absolute w-16 h-16 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
        </div>
        <p className="text-sm font-semibold tracking-wider uppercase text-amber-500 animate-pulse">
          Initializing SolarSight Session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
