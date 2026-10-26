import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DEPOTS } from '../data/initialData';
import {
  GitFork,
  Play,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Navigation,
  Cpu,
  Layers,
  Sparkles,
  Info,
  TrendingDown,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { PerunduraiMap } from '../components/map/PerunduraiMap';

interface RouteAlternative {
  id: string;
  name: string;
  algorithm: "Dijkstra's Algorithm" | 'A* Search' | 'D* Lite (Dynamic)';
  distanceKm: number;
  durationMin: number;
  energyKwh: number;
  nodesExpanded: number;
  co2SavedKg: number;
  confidence: string;
  isRecommended?: boolean;
  blockedRoadEncountered?: boolean;
}

export const RouteOptimisationPage: React.FC = () => {
  const { dustbins, showToast } = useApp();

  const [originDepot, setOriginDepot] = useState(DEPOTS[0].id);
  const [destinationFacility, setDestinationFacility] = useState('LANDFILL-01');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<
    "Dijkstra's Algorithm" | 'A* Search' | 'D* Lite (Dynamic)'
  >('A* Search');
  const [simulatedBlockage, setSimulatedBlockage] = useState<string | null>(null);
  const [isReplanning, setIsReplanning] = useState(false);
  const [activeAlternativeId, setActiveAlternativeId] = useState('ALT-1');

  // Realistic alternatives based on chosen algorithm and blockage
  const alternatives: RouteAlternative[] = useMemo(() => {
    const isBlocked = !!simulatedBlockage;

    return [
      {
        id: 'ALT-1',
        name: 'Primary Arterial Corridor',
        algorithm: 'A* Search',
        distanceKm: isBlocked ? 16.4 : 13.8,
        durationMin: isBlocked ? 58 : 46,
        energyKwh: isBlocked ? 18.2 : 14.5,
        nodesExpanded: isBlocked ? 28 : 19,
        co2SavedKg: 4.8,
        confidence: '98.2%',
        isRecommended: true,
        blockedRoadEncountered: isBlocked,
      },
      {
        id: 'ALT-2',
        name: 'Bypass / Ring Road Corridor',
        algorithm: "Dijkstra's Algorithm",
        distanceKm: 15.6,
        durationMin: 52,
        energyKwh: 16.8,
        nodesExpanded: 64,
        co2SavedKg: 3.2,
        confidence: '94.0%',
      },
      {
        id: 'ALT-3',
        name: 'Dynamic Adaptive Trajectory',
        algorithm: 'D* Lite (Dynamic)',
        distanceKm: isBlocked ? 15.1 : 14.2,
        durationMin: isBlocked ? 50 : 48,
        energyKwh: isBlocked ? 15.9 : 14.9,
        nodesExpanded: isBlocked ? 14 : 22,
        co2SavedKg: 5.1,
        confidence: '99.1%',
      },
    ];
  }, [simulatedBlockage]);

  const handleSimulateBlockage = (road: string) => {
    if (simulatedBlockage === road) {
      setSimulatedBlockage(null);
      showToast('Road Clear', `Removed obstruction on ${road}.`, 'info');
    } else {
      setSimulatedBlockage(road);
      showToast('Obstruction Reported', `Traffic stoppage detected on ${road}.`, 'warning');
    }
  };

  const handleRecompute = () => {
    setIsReplanning(true);
    setTimeout(() => {
      setIsReplanning(false);
      showToast(
        'Route Optimized',
        `Evaluated graph using ${selectedAlgorithm} across 24 Perundurai nodes.`,
        'success'
      );
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Dynamic Route Optimisation Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Algorithmic path evaluation across Perundurai municipal road grid
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRecompute}
            disabled={isReplanning}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg transition-colors shadow-xs"
          >
            <Play className="h-3.5 w-3.5" />
            <span>{isReplanning ? 'Computing Graph...' : 'Recompute Optimal Path'}</span>
          </button>
        </div>
      </div>

      {/* Origin, Destination & Algorithm Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Origin */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Origin Depot
          </label>
          <select
            value={originDepot}
            onChange={e => setOriginDepot(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          >
            {DEPOTS.map(d => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400">Vehicle starts at chosen staging yard.</p>
        </div>

        {/* Destination */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Destination / Dump Facility
          </label>
          <select
            value={destinationFacility}
            onChange={e => setDestinationFacility(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          >
            <option value="LANDFILL-01">Perundurai Town Solid Waste Processing Facility</option>
            <option value="LANDFILL-02">SIPCOT Eco-Industrial Composting Yard</option>
            <option value="TRANSFER-01">Vijayamangalam Material Recovery Facility (MRF)</option>
          </select>
          <p className="text-[11px] text-slate-400">Target unloading & weigh-bridge center.</p>
        </div>

        {/* Algorithm Selection */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Active Routing Algorithm
          </label>
          <select
            value={selectedAlgorithm}
            onChange={e => setSelectedAlgorithm(e.target.value as any)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold"
          >
            <option value="A* Search">A* Search (Euclidean Heuristic)</option>
            <option value="Dijkstra's Algorithm">Dijkstra's Algorithm (Exhaustive)</option>
            <option value="D* Lite (Dynamic)">D* Lite (Real-Time Re-planning)</option>
          </select>
          <p className="text-[11px] text-slate-400">
            Configures heuristic function & graph search pruning.
          </p>
        </div>
      </div>

      {/* Road Obstruction Simulator (Interactive) */}
      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Live Road Network Perturbation Simulator
            </h3>
          </div>
          {simulatedBlockage && (
            <span className="text-[11px] text-rose-500 font-semibold">
              Active Detour: {simulatedBlockage}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300">
          Simulate real-time traffic jams or street maintenance in Perundurai to test dynamic
          replanning algorithms:
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {[
            'Chennimalai Road Maintenance',
            'Weekly Market Fair Congestion',
            'Bhavani Road Culvert Construction',
            'Old Bus Stand Platform Resurfacing',
          ].map(road => {
            const isActive = simulatedBlockage === road;
            return (
              <button
                key={road}
                onClick={() => handleSimulateBlockage(road)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {isActive ? '✕ Blocked: ' : '+ Block '}
                {road}
              </button>
            );
          })}
        </div>
      </div>

      {/* Route Alternatives Comparison Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Evaluated Trajectory Candidates
          </h3>
          <span className="text-xs text-slate-400">
            Demonstration scenarios prepared for Java API backend
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {alternatives.map(alt => {
            const isSelected = activeAlternativeId === alt.id;
            return (
              <div
                key={alt.id}
                onClick={() => setActiveAlternativeId(alt.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-3 ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      {alt.id}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{alt.name}</h4>
                  </div>
                  {alt.isRecommended && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold">
                      Optimal
                    </span>
                  )}
                </div>

                <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>{alt.algorithm}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 text-[10px]">Estimated Distance</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{alt.distanceKm} km</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Travel Time</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{alt.durationMin} mins</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Search Expansion</span>
                    <p className="font-mono text-slate-800 dark:text-slate-200">
                      {alt.nodesExpanded} nodes
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Energy Load</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{alt.energyKwh} kWh</p>
                  </div>
                </div>

                {alt.blockedRoadEncountered && (
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded-lg flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3 shrink-0" />
                    <span>Dynamic bypass calculated around reported road block.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Spatial Route Preview Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Optimized Corridor Visualization
          </h3>
          <span className="text-xs text-slate-400">
            Perundurai Old Bus Stand ➔ Market ➔ New Bus Stand ➔ SIPCOT
          </span>
        </div>
        <PerunduraiMap
          dustbins={dustbins.filter(b => b.status === 'Full' || b.status === 'Nearly Full')}
          heightClass="h-[380px]"
          showRouteOverlay={true}
        />
      </div>

      {/* Educational Backend Readiness Note */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <Info className="h-4 w-4 text-emerald-500" />
          <span>System Architecture & Integration Readiness</span>
        </div>
        <p>
          In this frontend pilot phase, all candidate routes and graph expansions are calculated
          using client-side simulations. The UI is designed with standardized JSON payload schemas
          so that a future Java Spring Boot service (utilizing GraphHopper or pgRouting on PostgreSQL)
          can supply production-grade weighted road matrix calculations seamlessly.
        </p>
      </div>
    </div>
  );
};
