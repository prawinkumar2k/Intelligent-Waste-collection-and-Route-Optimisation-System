import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { AlertItem, AlertSeverity, AlertType } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  Bell,
  Search,
  CheckCircle2,
  Trash2,
  Filter,
  ShieldAlert,
  AlertTriangle,
  Info,
  Clock,
  ArrowRight,
  Plus,
  RotateCcw,
  X,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    alerts,
    markAlertRead,
    markAllAlertsRead,
    dismissAlert,
    addStopToPlan,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [readFilter, setReadFilter] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchSearch =
        alert.binId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.binArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchSeverity =
        severityFilter === 'ALL' || alert.severity.toUpperCase() === severityFilter.toUpperCase();

      const matchRead =
        readFilter === 'ALL'
          ? true
          : readFilter === 'UNREAD'
          ? !alert.isRead
          : alert.isRead;

      return matchSearch && matchSeverity && matchRead;
    });
  }, [alerts, searchQuery, severityFilter, readFilter]);

  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <div className="space-y-5">
      {/* Page Title & Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Incident & Alert Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automated threshold violations, overflow hazards & telemetry health
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAlertsRead}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-xs"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Mark All as Read ({unreadCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Bin ID, Area or issue description..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="WARNING">Warning</option>
              <option value="INFO">Informational</option>
            </select>
          </div>

          {/* Read / Unread Filter */}
          <div>
            <select
              value={readFilter}
              onChange={e => setReadFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
            >
              <option value="ALL">All Alerts</option>
              <option value="UNREAD">Unread Only</option>
              <option value="READ">Read Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Feed List */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No matching incidents found.
            </p>
            <p className="text-xs">
              All Perundurai sensors operating within acceptable thresholds.
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              onClick={() => {
                setSelectedAlert(alert);
                if (!alert.isRead) markAlertRead(alert.id);
              }}
              className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors ${
                !alert.isRead
                  ? 'bg-emerald-50/20 dark:bg-slate-800/40 hover:bg-emerald-50/40 dark:hover:bg-slate-800/60'
                  : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/20'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="pt-0.5">
                  <StatusBadge status={alert.severity} size="sm" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {alert.binId}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {alert.binArea}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {alert.type}
                    </span>
                    {!alert.isRead && (
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{alert.message}</p>
                </div>
              </div>

              <div
                className="flex items-center gap-3 self-end sm:self-center shrink-0"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{alert.timestamp}</span>
                </div>

                <button
                  onClick={() => addStopToPlan(alert.binId)}
                  className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-md transition-colors flex items-center gap-1"
                  title="Add this bin to active collection route"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Route</span>
                </button>

                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Dismiss Alert"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Alert Details Drawer */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {selectedAlert.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {selectedAlert.type}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={selectedAlert.severity} />
                    <span className="text-xs text-slate-400">{selectedAlert.timestamp}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Incident Description
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {selectedAlert.message}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Affected Container Location
                </h4>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Container ID:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {selectedAlert.binId}
                    </span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Perundurai Sector:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedAlert.binArea}
                    </span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-500">Recommended Action:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Dispatch collection crew or verify field sensor.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <button
                onClick={() => {
                  addStopToPlan(selectedAlert.binId);
                  setSelectedAlert(null);
                }}
                className="flex-1 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Add Bin to Collection Plan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
