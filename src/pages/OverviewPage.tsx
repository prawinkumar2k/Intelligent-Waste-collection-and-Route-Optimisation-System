import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { FillLevelBar } from '../components/common/FillLevelBar';
import { PerunduraiMap } from '../components/map/PerunduraiMap';
import { MapLegend } from '../components/map/MapLegend';
import {
  Trash2,
  AlertTriangle,
  Clock,
  WifiOff,
  CheckCircle2,
  Truck,
  ArrowRight,
  TrendingUp,
  BatteryCharging,
  Radio,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { dustbins, alerts, collectionPlan, addStopToPlan, markAlertRead, isSimulating } = useApp();

  // Summary counts
  const totalBins = dustbins.length;
  const fullBins = dustbins.filter(b => b.status === 'Full');
  const nearlyFullBins = dustbins.filter(b => b.status === 'Nearly Full');
  const normalBins = dustbins.filter(b => b.status === 'Normal');
  const offlineBins = dustbins.filter(b => b.status === 'Offline');
  const pendingStops = collectionPlan.stops.filter(s => s.status === 'Pending').length;

  // Highest priority bins: full first, then highest fill percentage
  const priorityBins = useMemo(() => {
    return [...dustbins]
      .filter(b => b.status !== 'Offline')
      .sort((a, b) => b.fillLevel - a.fillLevel)
      .slice(0, 5);
  }, [dustbins]);

  // Chart data: Fill distribution
  const fillDistributionData = useMemo(() => {
    return [
      { name: 'Full (≥90%)', count: fullBins.length, color: '#ef4444' },
      { name: 'Nearly Full (70-89%)', count: nearlyFullBins.length, color: '#f59e0b' },
      { name: 'Normal (<70%)', count: normalBins.length, color: '#10b981' },
      { name: 'Offline', count: offlineBins.length, color: '#94a3b8' },
    ];
  }, [fullBins.length, nearlyFullBins.length, normalBins.length, offlineBins.length]);

  // Hourly simulated collection weight activity
  const collectionActivityData = [
    { hour: '04:00', weightKg: 0 },
    { hour: '06:00', weightKg: 240 },
    { hour: '08:00', weightKg: 780 },
    { hour: '10:00', weightKg: 1048 },
    { hour: '12:00', weightKg: 1320 },
    { hour: '14:00', weightKg: 1450 },
    { hour: '16:00', weightKg: 1980 },
  ];

  return (
    <div className="space-y-6">
      {/* Pilot Deployment Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30 p-5 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Pilot Node: Perundurai Town Panchayat, Erode District, Tamil Nadu
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Intelligent Waste Collection and Route Optimisation System
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              24 ultrasonic IoT telemetry nodes connected via LoRaWAN/GSM simulation. Real-time fill
              tracking, priority heuristic clustering, and dynamic municipal dispatch.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/planning')}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all shadow-md shadow-emerald-500/20"
            >
              <Truck className="h-4 w-4" />
              <span>Dispatch Planning</span>
            </button>
            <button
              onClick={() => navigate('/algorithm-lab')}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/15 transition-all"
            >
              <span>Algorithm Lab</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6 Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Registered"
          value={totalBins}
          subtitle="Pilot Bins"
          icon={Trash2}
          colorScheme="sky"
          onClick={() => navigate('/dustbins')}
        />
        <StatCard
          title="Full Dustbins"
          value={fullBins.length}
          subtitle="≥ 90% Fill (Urgent)"
          icon={AlertTriangle}
          colorScheme="rose"
          trend={{ value: `${Math.round((fullBins.length / totalBins) * 100)}%`, isPositive: false }}
          onClick={() => navigate('/dustbins')}
        />
        <StatCard
          title="Nearly Full"
          value={nearlyFullBins.length}
          subtitle="70% – 89% Fill"
          icon={TrendingUp}
          colorScheme="amber"
          onClick={() => navigate('/dustbins')}
        />
        <StatCard
          title="Normal Dustbins"
          value={normalBins.length}
          subtitle="< 70% Fill Capacity"
          icon={CheckCircle2}
          colorScheme="emerald"
          onClick={() => navigate('/dustbins')}
        />
        <StatCard
          title="Offline Devices"
          value={offlineBins.length}
          subtitle="Telemetry Signal Lost"
          icon={WifiOff}
          colorScheme="slate"
          onClick={() => navigate('/alerts')}
        />
        <StatCard
          title="Pending Stops"
          value={pendingStops}
          subtitle="Current Active Shift"
          icon={Clock}
          colorScheme="indigo"
          onClick={() => navigate('/planning')}
        />
      </div>

      {/* Primary Grid: Interactive Map + Priority Dustbins */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Preview (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Perundurai Spatial Grid
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live sensor positions across Perundurai Bus Stands, Market & SIPCOT
              </p>
            </div>
            <Link
              to="/map"
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <span>Full Screen Map</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="relative">
            <PerunduraiMap
              dustbins={dustbins}
              onAddStop={addStopToPlan}
              heightClass="h-[400px]"
            />
            <div className="absolute bottom-4 right-4 z-[1000] hidden sm:block">
              <MapLegend />
            </div>
          </div>
        </div>

        {/* Priority Dustbins (1 col) */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Highest Priority Dustbins
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sorted by fill capacity & overflow risk
              </p>
            </div>
            <Link
              to="/dustbins"
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 space-y-3">
            {priorityBins.map(bin => (
              <div
                key={bin.id}
                className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {bin.id}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                      {bin.area}
                    </span>
                  </div>
                  <StatusBadge status={bin.status} size="sm" />
                </div>

                <div className="space-y-1 mb-2">
                  <FillLevelBar fillLevel={bin.fillLevel} status={bin.status} size="sm" />
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{bin.currentKg} kg collected</span>
                    <span>Batt: {bin.battery}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] text-slate-400">{bin.wasteType}</span>
                  <button
                    onClick={() => addStopToPlan(bin.id)}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1"
                  >
                    <span>+ Add to Route</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Grid: Charts + Active Collection Plan Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Fill Level Distribution */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Fill-Level Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Proportion of bins across status tiers
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">24 Nodes</span>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fillDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {fillDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {fillDistributionData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-slate-600 dark:text-slate-400 text-[11px] truncate">
                  {d.name}: <strong className="text-slate-900 dark:text-white">{d.count}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Collection Shift Progress */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                ACTIVE DISPATCH RUN
              </span>
              <StatusBadge status={collectionPlan.status} size="sm" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {collectionPlan.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Vehicle: <strong>{collectionPlan.assignedVehicle}</strong> • Driver:{' '}
              {collectionPlan.driverName}
            </p>
          </div>

          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Route Progress</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {collectionPlan.stops.filter(s => s.status === 'Collected').length} of{' '}
                {collectionPlan.stops.length} Stops Completed
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    (collectionPlan.stops.filter(s => s.status === 'Collected').length /
                      (collectionPlan.stops.length || 1)) *
                    100
                  }%`,
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
              <div>
                <p className="text-slate-400 text-[10px]">Distance</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {collectionPlan.totalDistanceKm} km
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">Est. Time</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {collectionPlan.estimatedDurationMin} mins
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">Load Waste</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {collectionPlan.totalCollectedKg} kg
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/planning')}
            className="w-full py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Manage Collection Route</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* 24-Hour Collection Activity Line */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Daily Throughput Curve
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cumulative solid waste collected (kg)
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              +1,980 kg today
            </span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={collectionActivityData}>
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weightKg"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10b981' }}
                  name="Waste (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            Peak collection cycle between 06:00 AM - 10:00 AM across Perundurai market corridors.
          </p>
        </div>
      </div>

      {/* Bottom Row: Recent Critical Alerts Feed + Telemetry Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Alerts (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Critical Incidents & Alerts
              </h3>
            </div>
            <Link
              to="/alerts"
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Alerts Center ({alerts.length})
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {alerts.slice(0, 4).map(alert => (
              <div key={alert.id} className="py-3 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={alert.severity} size="sm" />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {alert.binId} • {alert.binArea}
                    </span>
                    <span className="text-[10px] text-slate-400">{alert.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{alert.message}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!alert.isRead && (
                    <button
                      onClick={() => markAlertRead(alert.id)}
                      className="px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => addStopToPlan(alert.binId)}
                    className="px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-md transition-colors"
                  >
                    + Route
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Telemetry Health Summary (1 col) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Hardware Health Status
            </h3>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              91.6% Uptime
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-600 dark:text-slate-400">Ultrasonic Transducers</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">22 Active</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-600 dark:text-slate-400">Solar Battery Units &gt;30%</span>
              <span className="font-semibold text-slate-900 dark:text-white">21 Units OK</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-600 dark:text-slate-400">Average RSSI Strength</span>
              <span className="font-semibold text-slate-900 dark:text-white">-68.4 dBm (Good)</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="text-slate-600 dark:text-slate-400">Transmission Frequency</span>
              <span className="font-semibold text-slate-900 dark:text-white">Every 3.5s (Demo)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            Pilot gateway placed on Perundurai Municipal Water Tower providing 4.2 km LoRa coverage.
          </div>
        </div>
      </div>
    </div>
  );
};
