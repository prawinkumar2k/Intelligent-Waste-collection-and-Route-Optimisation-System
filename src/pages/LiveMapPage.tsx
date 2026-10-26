import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PerunduraiMap } from '../components/map/PerunduraiMap';
import { MapLegend } from '../components/map/MapLegend';
import { StatusBadge } from '../components/common/StatusBadge';
import { FillLevelBar } from '../components/common/FillLevelBar';
import { Dustbin, DustbinStatus } from '../types';
import {
  Search,
  Filter,
  MapPin,
  List,
  Eye,
  Plus,
  Battery,
  Wifi,
  Clock,
  Thermometer,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LiveMapPage: React.FC = () => {
  const navigate = useNavigate();
  const { dustbins, addStopToPlan, collectionPlan } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedBin, setSelectedBin] = useState<Dustbin | null>(null);
  const [showRouteOverlay, setShowRouteOverlay] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'split'>('map');

  // Filtered dustbins
  const filteredBins = useMemo(() => {
    return dustbins.filter(bin => {
      const matchSearch =
        bin.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bin.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bin.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        selectedStatus === 'ALL' ? true : bin.status.toUpperCase() === selectedStatus.toUpperCase();

      return matchSearch && matchStatus;
    });
  }, [dustbins, searchQuery, selectedStatus]);

  const counts = useMemo(() => {
    return {
      ALL: dustbins.length,
      FULL: dustbins.filter(b => b.status === 'Full').length,
      NEARLY_FULL: dustbins.filter(b => b.status === 'Nearly Full').length,
      NORMAL: dustbins.filter(b => b.status === 'Normal').length,
      OFFLINE: dustbins.filter(b => b.status === 'Offline').length,
    };
  }, [dustbins]);

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search Perundurai bin (e.g. Bus Stand, Hospital, SIPCOT)..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedStatus === 'ALL'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All ({counts.ALL})
          </button>
          <button
            onClick={() => setSelectedStatus('FULL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedStatus === 'FULL'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
            }`}
          >
            Full ({counts.FULL})
          </button>
          <button
            onClick={() => setSelectedStatus('NEARLY FULL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedStatus === 'NEARLY FULL'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            Nearly Full ({counts.NEARLY_FULL})
          </button>
          <button
            onClick={() => setSelectedStatus('NORMAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedStatus === 'NORMAL'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            Normal ({counts.NORMAL})
          </button>
          <button
            onClick={() => setSelectedStatus('OFFLINE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedStatus === 'OFFLINE'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Offline ({counts.OFFLINE})
          </button>
        </div>

        {/* View Mode & Overlay toggles */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <button
            onClick={() => setShowRouteOverlay(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showRouteOverlay
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Route Overlay</span>
          </button>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
              title="Map only"
            >
              <MapPin className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
              title="Split map + inventory"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Map View Area */}
      <div className={`grid gap-4 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {/* Map Container */}
        <div className={`relative ${viewMode === 'split' ? 'lg:col-span-2' : ''}`}>
          <PerunduraiMap
            dustbins={filteredBins}
            selectedBinId={selectedBin?.id}
            onSelectBin={bin => setSelectedBin(bin)}
            onAddStop={addStopToPlan}
            showRouteOverlay={showRouteOverlay}
            heightClass="h-[620px]"
          />

          {/* Floating Map Legend */}
          <div className="absolute bottom-5 right-5 z-[1000] hidden sm:block">
            <MapLegend />
          </div>

          {/* Informational Pill */}
          <div className="absolute top-4 right-4 z-[1000] bg-slate-900/80 backdrop-blur-md text-white text-[11px] px-3 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5 shadow-md">
            <Info className="h-3.5 w-3.5 text-emerald-400" />
            <span>Showing {filteredBins.length} of {dustbins.length} dustbins in Perundurai Pilot</span>
          </div>
        </div>

        {/* Split View Sidebar / Selected Bin Detail Drawer */}
        {viewMode === 'split' ? (
          <div className="h-[620px] overflow-y-auto space-y-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs">
            <div className="p-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Filtered Bins ({filteredBins.length})
              </h3>
            </div>
            {filteredBins.map(bin => (
              <div
                key={bin.id}
                onClick={() => setSelectedBin(bin)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedBin?.id === bin.id
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{bin.id}</span>
                  <StatusBadge status={bin.status} size="sm" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-1.5">{bin.area}</p>
                <FillLevelBar fillLevel={bin.fillLevel} status={bin.status} size="sm" />
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
                  <span>Batt: {bin.battery}%</span>
                  <span>{bin.signalRssi} dBm</span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      addStopToPlan(bin.id);
                    }}
                    className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    + Add Stop
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Selected Dustbin Bottom Drawer (when a bin is clicked on the map) */}
      {selectedBin && (
        <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-950/10 dark:bg-slate-900/95 backdrop-blur-md shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                {selectedBin.id}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {selectedBin.name}
              </span>
              <StatusBadge status={selectedBin.status} size="sm" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selectedBin.area} • Coordinates: {selectedBin.latitude.toFixed(4)}° N, {selectedBin.longitude.toFixed(4)}° E • Waste Type: {selectedBin.wasteType}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="min-w-[140px]">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-slate-500 dark:text-slate-400">Fill Level</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedBin.fillLevel}%</span>
              </div>
              <FillLevelBar fillLevel={selectedBin.fillLevel} status={selectedBin.status} size="sm" />
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <Battery className="h-4 w-4 text-emerald-500" />
                <span>{selectedBin.battery}% Battery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Wifi className="h-4 w-4 text-sky-500" />
                <span>{selectedBin.signalRssi} dBm</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Thermometer className="h-4 w-4 text-amber-500" />
                <span>{selectedBin.temperatureC}°C</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => addStopToPlan(selectedBin.id)}
                className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Include in Route</span>
              </button>
              <button
                onClick={() => navigate('/analytics')}
                className="px-3 py-2 text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors flex items-center gap-1"
              >
                <span>Full Telemetry</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setSelectedBin(null)}
                className="px-2.5 py-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
