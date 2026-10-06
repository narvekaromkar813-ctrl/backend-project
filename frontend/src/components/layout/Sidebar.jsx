import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  SunMedium,
  Zap,
  Activity,
  ArrowLeftRight,
  Receipt,
  AlertTriangle,
  TrendingUp,
  CloudSun,
  Users,
  Cpu,
  Settings,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useAlerts } from '../../hooks/useAlertsQuery';
import { cn } from '../../utils/helpers';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/panels', label: 'Solar Panels', icon: SunMedium },
  { path: '/generation', label: 'Generation', icon: Zap },
  { path: '/consumption', label: 'Consumption', icon: Activity },
  { path: '/grid', label: 'Grid Exchange', icon: ArrowLeftRight },
  { path: '/bills', label: 'Utility Bills', icon: Receipt },
  { path: '/alerts', label: 'Alerts & Diagnostics', icon: AlertTriangle, hasBadge: true },
  { path: '/roi', label: 'ROI & Payback', icon: TrendingUp },
  { path: '/weather', label: 'Solar Weather', icon: CloudSun },
  { path: '/compare', label: 'Peer Benchmark', icon: Users },
  { path: '/advanced', label: 'Advanced Hub', icon: Cpu },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { unreadAlertCount } = useSocket();
  const { data: alertsData } = useAlerts({ isRead: false });

  // Use unread count from API or real-time socket
  const totalUnread = unreadAlertCount > 0 ? unreadAlertCount : (alertsData?.unreadCount || 0);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-64 bg-navy-900 border-r border-navy-800 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-navy-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-solar-glow">
              <SunMedium className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                Solar<span className="text-amber-400">Sight</span>
              </span>
              <span className="block text-[10px] text-amber-400/80 font-semibold uppercase tracking-wider">
                Telemetry Suite
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-none">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Monitoring & Analytics
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 select-none group',
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 font-semibold border-l-4 border-amber-500 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-navy-800/80'
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </div>
                {item.hasBadge && totalUnread > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-navy-950 animate-pulse">
                    {totalUnread}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-navy-800 bg-navy-950/40">
          <div className="p-2.5 rounded-xl bg-navy-850/60 border border-navy-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.name || 'Solar Operator'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.installedCapacity ? `${user.installedCapacity} kW System` : user?.email || 'Logged In'}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-navy-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
