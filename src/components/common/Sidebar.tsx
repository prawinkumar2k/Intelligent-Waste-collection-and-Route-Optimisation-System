import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Trash2,
  CalendarCheck,
  GitFork,
  Cpu,
  Activity,
  Bell,
  History,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/map', label: 'Live Map', icon: MapPin },
  { path: '/dustbins', label: 'Dustbin Management', icon: Trash2 },
  { path: '/planning', label: 'Collection Planning', icon: CalendarCheck },
  { path: '/optimisation', label: 'Route Optimisation', icon: GitFork },
  { path: '/algorithm-lab', label: 'Algorithm Laboratory', icon: Cpu },
  { path: '/analytics', label: 'Sensor Analytics', icon: Activity },
  { path: '/alerts', label: 'Alerts & Notifications', icon: Bell, badgeKey: 'alerts' },
  { path: '/history', label: 'Collection History', icon: History },
  { path: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { alerts } = useApp();
  const unreadAlertsCount = alerts.filter(a => !a.isRead).length;

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 z-30 shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        <NavLink to="/" className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
            <Trash2 className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-none">
                IWCRS
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-wider uppercase mt-1 truncate">
                Perundurai Smart Pilot
              </span>
            </div>
          )}
        </NavLink>
        <button
          onClick={() => setCollapsed(prev => !prev)}
          className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}

              {/* Badge for unread alerts */}
              {item.badgeKey === 'alerts' && unreadAlertsCount > 0 && (
                <span
                  className={`flex items-center justify-center font-bold text-[10px] rounded-full bg-rose-500 text-white ${
                    collapsed
                      ? 'absolute top-1.5 right-1.5 h-4 w-4'
                      : 'ml-auto px-1.5 py-0.5 min-w-[20px]'
                  }`}
                >
                  {unreadAlertsCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer System Status Info */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
        {!collapsed ? (
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                IoT Telemetry
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">v1.2 Pilot</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Erode District, Perundurai Town Panchayat Network.
            </p>
          </div>
        ) : (
          <div className="flex justify-center" title="IoT Network Active">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </div>
        )}
      </div>
    </aside>
  );
};
