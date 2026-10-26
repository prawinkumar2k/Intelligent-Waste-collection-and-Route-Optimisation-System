import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  TrendingDown,
  TrendingUp,
  Fuel,
  Leaf,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
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
  CartesianGrid,
} from 'recharts';

export const ReportsAnalyticsPage: React.FC = () => {
  const { dustbins, collectionHistory, showToast } = useApp();

  const [reportPeriod, setReportPeriod] = useState<'week' | 'month' | 'pilot'>('week');

  // Sector-wise aggregation
  const sectorData = useMemo(() => {
    const areaMap: Record<string, { bins: number; totalWeight: number; avgFill: number }> = {};
    dustbins.forEach(bin => {
      if (!areaMap[bin.area]) {
        areaMap[bin.area] = { bins: 0, totalWeight: 0, avgFill: 0 };
      }
      areaMap[bin.area].bins += 1;
      areaMap[bin.area].totalWeight += bin.currentKg;
      areaMap[bin.area].avgFill += bin.fillLevel;
    });

    return Object.entries(areaMap).map(([area, val]) => ({
      area,
      bins: val.bins,
      totalWeightKg: val.totalWeight,
      avgFill: Math.round(val.avgFill / val.bins),
    })).sort((a, b) => b.totalWeightKg - a.totalWeightKg).slice(0, 6);
  }, [dustbins]);

  // Daily waste trend
  const dailyTrends = [
    { day: 'Mon', organicKg: 420, recyclableKg: 180, generalKg: 310 },
    { day: 'Tue', organicKg: 490, recyclableKg: 210, generalKg: 340 },
    { day: 'Wed', organicKg: 580, recyclableKg: 230, generalKg: 390 },
    { day: 'Thu', organicKg: 510, recyclableKg: 190, generalKg: 360 },
    { day: 'Fri', organicKg: 640, recyclableKg: 280, generalKg: 450 },
    { day: 'Sat', organicKg: 890, recyclableKg: 350, generalKg: 580 }, // Saturday Uzhavar Sandhai spike
    { day: 'Sun', organicKg: 780, recyclableKg: 310, generalKg: 510 },
  ];

  // Fuel & Emissions saving simulation
  const kpiMetrics = [
    {
      title: 'Estimated Fuel Reduction',
      value: '26.4%',
      subtitle: '~42 Litres diesel conserved per vehicle/week',
      icon: Fuel,
      color: 'text-emerald-500',
    },
    {
      title: 'Carbon Offset (CO2e)',
      value: '112.8 kg',
      subtitle: 'Achieved through eliminated redundant truck mileage',
      icon: Leaf,
      color: 'text-teal-500',
    },
    {
      title: 'Average Response Time',
      value: '38 mins',
      subtitle: 'From 90% threshold alert to truck arrival',
      icon: Clock,
      color: 'text-sky-500',
    },
    {
      title: 'Pilot Data Integrity',
      value: '98.8%',
      subtitle: 'Valid packets across 24 Perundurai nodes',
      icon: CheckCircle2,
      color: 'text-indigo-500',
    },
  ];

  const handleExportReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Perundurai Municipal Waste Management Executive Summary\n' +
      'Period: ' + reportPeriod.toUpperCase() + '\n' +
      'Total Registered Bins: 24\n' +
      'Sector,Bins,Total Weight (kg),Avg Fill (%)\n' +
      sectorData.map(s => `"${s.area}",${s.bins},${s.totalWeightKg},${s.avgFill}`).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `perundurai_executive_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Report Exported', 'Downloaded Executive Municipal Analytics Summary.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Title & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Reports & Executive Municipal Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Smart-city solid waste generation patterns & route efficiency metrics for Perundurai
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setReportPeriod('week')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                reportPeriod === 'week'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Current Week
            </button>
            <button
              onClick={() => setReportPeriod('month')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                reportPeriod === 'month'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setReportPeriod('pilot')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                reportPeriod === 'pilot'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Full Pilot
            </button>
          </div>

          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-xs"
          >
            <Download className="h-4 w-4" />
            <span>Export Report (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiMetrics.map(kpi => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {kpi.title}
                </span>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                {kpi.value}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{kpi.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector-Wise Load (Bar Chart) */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Waste Generation by Perundurai Ward / Sector
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Top sectors ranked by accumulated solid waste mass (kg)
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Active Load</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis dataKey="area" type="category" stroke="#64748b" fontSize={10} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="totalWeightKg" name="Current Mass (kg)" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Composition Breakdown (Stacked Bar) */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Daily Waste Stream Segmentation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organic (Market) vs Recyclable vs Commercial Municipal Waste
              </p>
            </div>
            <span className="text-xs text-emerald-600 font-semibold">Weekly Cycle</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} />
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
                <Bar dataKey="organicKg" name="Organic (Market)" fill="#10b981" stackId="a" />
                <Bar dataKey="generalKg" name="General Municipal" fill="#0284c7" stackId="a" />
                <Bar dataKey="recyclableKg" name="Recyclable Dry" fill="#f59e0b" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-emerald-500" />
              <span>Organic</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-sky-600" />
              <span>General Municipal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-amber-500" />
              <span>Recyclables</span>
            </div>
          </div>
        </div>
      </div>

      {/* Algorithm Benchmark Comparison Table */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Algorithmic Benchmark Evaluation Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Theoretical simulation metrics comparing search heuristics on Perundurai Graph
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Pilot Simulation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4">Path Optimality</th>
                <th className="py-3 px-4">Avg Distance (km)</th>
                <th className="py-3 px-4">Search Runtime</th>
                <th className="py-3 px-4">Memory Footprint</th>
                <th className="py-3 px-4">Dynamic Obstacle Handling</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">A* Search</td>
                <td className="py-3 px-4 text-emerald-600 font-semibold">Guaranteed Optimal</td>
                <td className="py-3 px-4 font-mono">13.8 km</td>
                <td className="py-3 px-4 font-mono">2.4 ms</td>
                <td className="py-3 px-4 font-mono">Moderate (O(V))</td>
                <td className="py-3 px-4">Full Re-evaluation</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Dijkstra's Algorithm</td>
                <td className="py-3 px-4 text-emerald-600 font-semibold">Guaranteed Optimal</td>
                <td className="py-3 px-4 font-mono">13.8 km</td>
                <td className="py-3 px-4 font-mono">7.8 ms</td>
                <td className="py-3 px-4 font-mono">High (Radial Open Set)</td>
                <td className="py-3 px-4">Full Re-evaluation</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">D* Lite (Dynamic)</td>
                <td className="py-3 px-4 text-emerald-600 font-semibold">Near-Optimal (99%)</td>
                <td className="py-3 px-4 font-mono">14.1 km</td>
                <td className="py-3 px-4 font-mono">0.9 ms (Incremental)</td>
                <td className="py-3 px-4 font-mono">Efficient Priority Queue</td>
                <td className="py-3 px-4 text-emerald-600 font-semibold">Instant Local Repair</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Greedy Best-First</td>
                <td className="py-3 px-4 text-amber-600 font-semibold">Sub-Optimal (Local Minima)</td>
                <td className="py-3 px-4 font-mono">17.2 km</td>
                <td className="py-3 px-4 font-mono">0.6 ms</td>
                <td className="py-3 px-4 font-mono">Minimal</td>
                <td className="py-3 px-4">Prone to loops</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
