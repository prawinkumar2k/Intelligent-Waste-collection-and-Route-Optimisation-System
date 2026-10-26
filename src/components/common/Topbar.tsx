import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Shield,
  User,
  Radio,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ROUTE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Operational Overview', subtitle: 'Live Perundurai pilot metrics & municipal health' },
  '/map': { title: 'Live Map & Spatial Grid', subtitle: 'Interactive GIS view of 24 Perundurai smart dustbins' },
  '/dustbins': { title: 'Dustbin Management Registry', subtitle: 'Telemetry inventory, sensor status & field parameters' },
  '/planning': { title: 'Collection Planning & Dispatch', subtitle: 'Priority-based municipal waste collection itinerary' },
  '/optimisation': { title: 'Route Optimisation Engine', subtitle: 'Multi-algorithm comparison & dynamic re-routing' },
  '/algorithm-lab': { title: 'Algorithm Laboratory', subtitle: 'Interactive graph search sandbox (Dijkstra, A*, D* Lite)' },
  '/analytics': { title: 'Sensor Analytics & Telemetry', subtitle: 'Ultrasonic distance, battery health & RSSI tracking' },
  '/alerts': { title: 'Alerts & Incident Center', subtitle: 'Automated threshold violations & device diagnostics' },
  '/history': { title: 'Collection Log & Audit Trail', subtitle: 'Historical vehicle pickups, verified weights & timestamps' },
  '/reports': { title: 'Reports & Executive Analytics', subtitle: 'Pilot performance metrics, area load & fuel efficiency' },
  '/settings': { title: 'System & Parameter Settings', subtitle: 'Thresholds, intervals & simulation configuration' },
};

export const Topbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    theme,
    toggleTheme,
    isSimulating,
    toggleSimulation,
    stepSimulationTick,
    alerts,
    markAlertRead,
    globalSearch,
    setGlobalSearch,
  } = useApp();

  const [alertsOpen, setAlertsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const alertsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const currentRouteMeta = ROUTE_TITLES[location.pathname] || {
    title: 'Perundurai Waste Management',
    subtitle: 'Municipal Solid Waste IoT Network',
  };

  const unreadAlerts = alerts.filter(a => !a.isRead);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (alertsRef.current && !alertsRef.current.contains(e.target as Node)) {
        setAlertsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Title & Breadcrumb */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Perundurai Pilot</span>
          <span>/</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {currentRouteMeta.title}
          </span>
        </div>
        <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
          {currentRouteMeta.title}
        </h1>
      </div>

      {/* Center Search */}
      <div className="hidden md:flex items-center flex-1 max-w-xs relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={globalSearch}
          onChange={e => setGlobalSearch(e.target.value)}
          placeholder="Search bin ID, area, sensor..."
          className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden transition-all"
        />
        {globalSearch && (
          <button
            onClick={() => setGlobalSearch('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Demo Mode Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-semibold">
          <Sparkles className="h-3 w-3" />
          <span>DEMO MODE</span>
        </div>

        {/* Live Simulation Control Button */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700/60">
          <button
            onClick={toggleSimulation}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md transition-all ${
              isSimulating
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
            title={isSimulating ? 'Pause IoT live stream' : 'Resume live telemetry stream'}
          >
            {isSimulating ? (
              <>
                <Radio className="h-3.5 w-3.5 animate-pulse text-white" />
                <span className="hidden xl:inline">Live Stream</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">Resume</span>
              </>
            )}
          </button>
          <button
            onClick={stepSimulationTick}
            className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
            title="Step simulation manually (+1 tick)"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={alertsRef}>
          <button
            onClick={() => setAlertsOpen(prev => !prev)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Alerts"
          >
            <Bell className="h-4 w-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
            )}
          </button>

          {alertsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Active Alerts</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold">
                    {unreadAlerts.length} Unread
                  </span>
                </div>
                <Link
                  to="/alerts"
                  onClick={() => setAlertsOpen(false)}
                  className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800/80 max-h-72 overflow-y-auto">
                {alerts.slice(0, 4).map(alert => (
                  <div
                    key={alert.id}
                    onClick={() => {
                      markAlertRead(alert.id);
                      setAlertsOpen(false);
                      navigate('/alerts');
                    }}
                    className={`py-2.5 px-1.5 cursor-pointer rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      !alert.isRead ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {alert.binId} • {alert.binArea}
                      </span>
                      <span className="text-[10px] text-slate-400">{alert.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                      {alert.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(prev => !prev)}
            className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xs shadow-xs">
              PS
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 dark:text-white leading-none">
                P. Senthil Kumar
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Executive Engineer, Perundurai
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white">P. Senthil Kumar</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Perundurai Town Panchayat
                </p>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="h-3 w-3" /> Role: Municipal Super-Admin
                </div>
              </div>
              <Link
                to="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                <Shield className="h-4 w-4 text-slate-400" /> System Preferences
              </Link>
              <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                <span className="block px-3 py-1.5 text-[10px] text-slate-400">
                  Demo Session (No login required)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
