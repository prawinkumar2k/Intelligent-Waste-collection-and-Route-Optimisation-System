import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Activity,
  Battery,
  Wifi,
  Thermometer,
  Clock,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  ArrowDown,
  Info,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const SensorAnalyticsPage: React.FC = () => {
  const { dustbins } = useApp();

  const [selectedBinId, setSelectedBinId] = useState<string>(dustbins[0]?.id || 'BIN-PD-001');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [simulatedState, setSimulatedState] = useState<'normal' | 'loading' | 'error' | 'empty'>('normal');

  const selectedBin = useMemo(() => {
    return dustbins.find(b => b.id === selectedBinId) || dustbins[0];
  }, [dustbins, selectedBinId]);

  // Generate realistic time-series data for selected bin
  const telemetryTimeSeries = useMemo(() => {
    if (!selectedBin) return [];
    const points = [];
    const baseFill = selectedBin.fillLevel;
    const baseBatt = selectedBin.battery;

    if (timeRange === '24h') {
      const hours = ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
      for (let i = 0; i < hours.length; i++) {
        const fill = Math.min(100, Math.max(10, Math.round(baseFill - (hours.length - i) * 3 + Math.random() * 4)));
        const dist = Math.max(2, Math.round(100 * (1 - fill / 100)));
        const batt = Math.min(100, Math.max(20, Math.round(baseBatt - (i > 6 ? (i - 6) * 1.5 : 0) + (i >= 4 && i <= 8 ? 5 : 0))));
        const temp = Number((27 + Math.sin(i / 2) * 4).toFixed(1));
        const rssi = -60 - Math.floor(Math.random() * 15);
        points.push({ time: hours[i], fill, distanceCm: dist, battery: batt, temp, rssi });
      }
    } else if (timeRange === '7d') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      for (let i = 0; i < days.length; i++) {
        const fill = Math.min(100, Math.max(15, Math.round(30 + i * 10 + (Math.random() * 8))));
        const dist = Math.max(2, Math.round(100 * (1 - fill / 100)));
        points.push({ time: days[i], fill, distanceCm: dist, battery: Math.round(baseBatt - i * 1.2), temp: 28.5, rssi: -65 });
      }
    } else {
      for (let i = 1; i <= 30; i += 3) {
        const fill = Math.min(100, Math.max(20, Math.round((i * 3) % 95 + 15)));
        points.push({ time: `Day ${i}`, fill, distanceCm: Math.round(100 * (1 - fill / 100)), battery: 85, temp: 29.0, rssi: -66 });
      }
    }
    return points;
  }, [selectedBin, timeRange]);

  return (
    <div className="space-y-6">
      {/* Header & Bin Selector Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Sensor Analytics & Telemetry Diagnostics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time ultrasonic distance profiling and solar storage tracking •{' '}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">DEMO DATA</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Bin Picker */}
          <select
            value={selectedBinId}
            onChange={e => setSelectedBinId(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white shadow-xs"
          >
            {dustbins.map(b => (
              <option key={b.id} value={b.id}>
                {b.id} — {b.area} ({b.fillLevel}%)
              </option>
            ))}
          </select>

          {/* Time range buttons */}
          <div className="flex items-center bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                timeRange === '24h'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              24 Hours
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                timeRange === '7d'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                timeRange === '30d'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              30 Days
            </button>
          </div>

          {/* Simulation state switcher */}
          <select
            value={simulatedState}
            onChange={e => setSimulatedState(e.target.value as any)}
            className="px-2.5 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300"
            title="UI State Switcher"
          >
            <option value="normal">State: Live OK</option>
            <option value="loading">State: Loading</option>
            <option value="empty">State: Empty</option>
            <option value="error">State: Error</option>
          </select>
        </div>
      </div>

      {/* State Handlers */}
      {simulatedState === 'loading' ? (
        <div className="p-20 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="h-8 w-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Querying sensor telemetry for {selectedBin.id}...
          </p>
        </div>
      ) : simulatedState === 'error' ? (
        <div className="p-16 text-center rounded-xl border border-rose-500/30 bg-rose-500/5 space-y-3">
          <AlertTriangle className="h-8 w-8 text-rose-500 mx-auto" />
          <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400">
            Telemetry Gateway Timeout
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Failed to establish LoRaWAN socket connection with Perundurai Node {selectedBin.id}.
            Check field gateway battery or cellular APN.
          </p>
          <button
            onClick={() => setSimulatedState('normal')}
            className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-lg"
          >
            Retry Connection
          </button>
        </div>
      ) : simulatedState === 'empty' ? (
        <div className="p-16 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
          <Activity className="h-8 w-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No Telemetry Stored For This Period
          </h4>
          <p className="text-xs text-slate-400">Try selecting 24 Hours or another registered container.</p>
          <button
            onClick={() => setSimulatedState('normal')}
            className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg mt-2"
          >
            Show Sample Telemetry
          </button>
        </div>
      ) : (
        /* Normal Analytics View */
        <>
          {/* Top Live Sensor Telemetry Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Ultrasonic Depth Reading
              </span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                {selectedBin.distanceCm} cm
              </div>
              <p className="text-[11px] text-slate-500">
                Sensor to waste surface (Max depth {selectedBin.totalDepthCm} cm)
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Calculated Fill Level
              </span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {selectedBin.fillLevel}%
              </div>
              <p className="text-[11px] text-slate-500">
                {selectedBin.currentKg} kg / {selectedBin.capacityKg} kg capacity
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Li-Ion Solar Storage
              </span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                {selectedBin.battery}%
              </div>
              <p className="text-[11px] text-slate-500">3.7V 18650 Cell + 5W Photovoltaic</p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                LoRa Link Budget (RSSI)
              </span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                {selectedBin.signalRssi} dBm
              </div>
              <p className="text-[11px] text-slate-500">
                Status: <strong className="text-emerald-600">{selectedBin.connectivity}</strong>
              </p>
            </div>
          </div>

          {/* Charts Row: Fill % vs Sensor Distance & Battery/Temperature */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fill Level & Ultrasonic Distance Over Time */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Fill Percentage & Ultrasonic Clearance
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Dual-axis correlation of waste accumulation curve
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  {selectedBin.id}
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={telemetryTimeSeries}>
                    <defs>
                      <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#fff',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="fill"
                      name="Fill Level (%)"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#fillGrad)"
                    />
                    <Line
                      type="monotone"
                      dataKey="distanceCm"
                      name="Sensor Distance (cm)"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-6 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span>Fill Level (%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-sky-400" />
                  <span>Remaining Depth (cm)</span>
                </div>
              </div>
            </div>

            {/* Battery Discharge & Internal Temp Curve */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Photovoltaic Battery & Ambient Thermal Curve
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Daylight solar recharge vs evening standby draw
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400">Solar Harvesting</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={telemetryTimeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
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
                      dataKey="battery"
                      name="Battery (%)"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="temp"
                      name="Temperature (°C)"
                      stroke="#ec4899"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-6 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  <span>Battery Capacity (%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-pink-500" />
                  <span>Internal Enclosure Temp (°C)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hardware Diagnostic Card */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Perundurai Pilot IoT Node Specification
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400">
              <div className="space-y-1">
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Sensor Enclosure
                </span>
                <p>IP67 Waterproof ultrasonic transducer (JSN-SR04T) mounted on inner container lid.</p>
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Telemetry Carrier
                </span>
                <p>Dual fallback: LoRaWAN 865-867 MHz (IN865) primary, 2G/4G GSM fallback telemetry.</p>
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Power Harvesting
                </span>
                <p>5W Monocrystalline panel with MPPT charging controller for 3.7V 3000mAh battery.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
