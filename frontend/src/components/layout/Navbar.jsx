import React from 'react';
import { Menu, Sun, Moon, Bell, User as UserIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useAlerts } from '../../hooks/useAlertsQuery';
import { ConnectionIndicator } from '../ui/ConnectionIndicator';

const titles = {
  '/dashboard': 'Dashboard & Overview',
  '/panels': 'Solar Panel Management',
  '/generation': 'Solar Generation Telemetry',
  '/consumption': 'Household Consumption',
  '/grid': 'Grid Import & Export Exchange',
  '/bills': 'Utility Bills & Savings Prediction',
  '/alerts': 'Alerts & Diagnostic System',
  '/roi': 'Return on Investment (ROI)',
  '/weather': 'Solar Irradiance Weather Impact',
  '/compare': 'Anonymous Peer Benchmarking',
  '/advanced': 'Advanced Solar Hub',
  '/settings': 'System Settings & Profile',
};

export const Navbar = ({ onOpenSidebar }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const { unreadAlertCount } = useSocket();
  const { data: alertsData } = useAlerts({ isRead: false });

  const currentTitle = titles[location.pathname] || 'SolarSight';
  const totalUnread = unreadAlertCount > 0 ? unreadAlertCount : (alertsData?.unreadCount || 0);

  return (
    <header className="h-16 px-4 sm:px-6 bg-white/80 dark:bg-navy-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-900 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {currentTitle}
          </h1>
          <p className="hidden sm:block text-[11px] text-slate-400">
            Real-time Photovoltaic Telemetry Monitoring
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Real-time Socket status indicator */}
        <ConnectionIndicator />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-navy-900 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Alerts Shortcut */}
        <Link
          to="/alerts"
          title="System Alerts"
          className="relative p-2 rounded-xl text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-navy-900 transition-colors"
        >
          <Bell className="w-4 h-4" />
          {totalUnread > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-navy-950 animate-pulse" />
          )}
        </Link>

        {/* User Profile avatar */}
        <Link
          to="/settings"
          className="flex items-center gap-2 pl-2 sm:border-l border-slate-200 dark:border-slate-800"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>
          <div className="hidden md:block text-left">
            <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 max-w-[120px]">
              {user?.name || 'Operator'}
            </span>
            <span className="block text-[10px] text-amber-500 capitalize">
              {user?.role || 'User'}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};
