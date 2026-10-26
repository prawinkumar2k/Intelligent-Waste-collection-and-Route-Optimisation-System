import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DEPOTS } from '../data/initialData';
import { StatusBadge } from '../components/common/StatusBadge';
import { FillLevelBar } from '../components/common/FillLevelBar';
import { PerunduraiMap } from '../components/map/PerunduraiMap';
import { CollectionStop } from '../types';
import {
  Truck,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  CheckCircle2,
  Clock,
  Play,
  Check,
  Send,
  MapPin,
  Calendar,
  AlertCircle,
  HelpCircle,
  Info,
} from 'lucide-react';

export const CollectionPlanningPage: React.FC = () => {
  const {
    dustbins,
    collectionPlan,
    updateCollectionPlan,
    addStopToPlan,
    removeStopFromPlan,
    reorderStops,
    setStopStatus,
    resetCollectionPlan,
    showToast,
  } = useApp();

  const [selectedDepotId, setSelectedDepotId] = useState(collectionPlan.depotId);

  // Available candidate bins not yet in route
  const candidateBins = useMemo(() => {
    const scheduledIds = new Set(collectionPlan.stops.map(s => s.binId));
    return dustbins
      .filter(b => !scheduledIds.has(b.id) && b.status !== 'Offline')
      .sort((a, b) => b.fillLevel - a.fillLevel);
  }, [dustbins, collectionPlan.stops]);

  // Coordinates for map preview
  const routeCoords = useMemo(() => {
    const depot = DEPOTS.find(d => d.id === selectedDepotId) || DEPOTS[0];
    const points: [number, number][] = [depot.coords];
    collectionPlan.stops.forEach(s => points.push([s.latitude, s.longitude]));
    if (collectionPlan.stops.length > 0) points.push(depot.coords);
    return points;
  }, [collectionPlan.stops, selectedDepotId]);

  const handleMoveStop = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= collectionPlan.stops.length) return;

    const newStops = [...collectionPlan.stops];
    const temp = newStops[index];
    newStops[index] = newStops[targetIndex];
    newStops[targetIndex] = temp;
    reorderStops(newStops);
    showToast('Sequence Updated', `Moved stop to position #${targetIndex + 1}.`, 'info');
  };

  const handleDispatch = () => {
    updateCollectionPlan({ status: 'In Progress' });
    showToast(
      'Dispatch Order Issued',
      `Transmitted digital manifest to vehicle ${collectionPlan.assignedVehicle}.`,
      'success'
    );
  };

  const handleCompletePlan = () => {
    // Mark all remaining stops as collected
    collectionPlan.stops.forEach(s => {
      if (s.status !== 'Collected') {
        setStopStatus(s.binId, 'Collected');
      }
    });
    updateCollectionPlan({ status: 'Completed' });
    showToast(
      'Shift Complete',
      `Shift finalized with ${collectionPlan.totalCollectedKg} kg municipal waste cleared.`,
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* Title & Topbar summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Municipal Collection Planning & Dispatch
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Perundurai Town Panchayat Daily Resource Routing & Vehicle Assignment
          </p>
        </div>

        <div className="flex items-center gap-2">
          {collectionPlan.status === 'Planned' && (
            <button
              onClick={handleDispatch}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-xs"
            >
              <Send className="h-4 w-4" />
              <span>Dispatch Route</span>
            </button>
          )}

          {collectionPlan.status === 'In Progress' && (
            <button
              onClick={handleCompletePlan}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors shadow-xs"
            >
              <Check className="h-4 w-4" />
              <span>Finalize & Clear All</span>
            </button>
          )}

          <button
            onClick={resetCollectionPlan}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Itinerary</span>
          </button>
        </div>
      </div>

      {/* Primary 3-Section Grid: Vehicle / Route Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Depot selection */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Dispatch Origin Depot
          </span>
          <select
            value={selectedDepotId}
            onChange={e => {
              setSelectedDepotId(e.target.value);
              const depot = DEPOTS.find(d => d.id === e.target.value);
              if (depot) {
                updateCollectionPlan({
                  depotId: depot.id,
                  depotName: depot.name,
                  depotCoords: depot.coords,
                });
              }
            }}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
          >
            {DEPOTS.map(d => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Designated municipal staging point for weigh-bridge and fuel telemetry.
          </p>
        </div>

        {/* Assigned Vehicle */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Assigned Vehicle & Crew
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
              Ready
            </span>
          </div>
          <div className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="h-4 w-4 text-emerald-500" />
            <span>{collectionPlan.assignedVehicle}</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Operator: <strong>{collectionPlan.driverName}</strong> • Cap: 4,500 kg
          </div>
        </div>

        {/* Itinerary Metrics */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Shift Load & Logistics
            </span>
            <StatusBadge status={collectionPlan.status} size="sm" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Stops</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {collectionPlan.stops.length}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Est. Dist.</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {collectionPlan.totalDistanceKm} km
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Total Load</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {collectionPlan.totalCollectedKg} kg
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace: Left = Itinerary Sequence, Right = Candidates + Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Planned Stops List (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Current Collection Sequence ({collectionPlan.stops.length} Stops)
              </h3>
            </div>
            <span className="text-xs text-slate-400">Drag or use arrows to adjust sequence</span>
          </div>

          <div className="space-y-2.5">
            {collectionPlan.stops.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Truck className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  No stops currently scheduled in this itinerary.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Select high priority dustbins from the candidate list on the right.
                </p>
              </div>
            ) : (
              collectionPlan.stops.map((stop, idx) => (
                <div
                  key={stop.binId}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    stop.status === 'Collected'
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30 opacity-80'
                      : stop.status === 'In Progress'
                      ? 'bg-sky-50/60 dark:bg-sky-950/30 border-sky-500/40'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Sequence Badge */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs">
                      #{stop.stopOrder}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {stop.binId}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {stop.binArea}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        <span>Fill: {stop.fillLevel}%</span>
                        <span>•</span>
                        <span>Cap: {stop.capacityKg} kg</span>
                        <span>•</span>
                        <span>ETA: {stop.estimatedArrival}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <select
                      value={stop.status}
                      onChange={e => setStopStatus(stop.binId, e.target.value as any)}
                      className="px-2.5 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Collected">Collected</option>
                      <option value="Skipped">Skipped</option>
                    </select>

                    <div className="flex items-center border-l border-slate-200 dark:border-slate-800 pl-2">
                      <button
                        onClick={() => handleMoveStop(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveStop(idx, 'down')}
                        disabled={idx === collectionPlan.stops.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => removeStopFromPlan(stop.binId)}
                        className="p-1 text-rose-500 hover:text-rose-600 ml-1"
                        title="Remove Stop"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Mini Map Preview + Collection Candidates (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Map Preview */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Itinerary Spatial Preview
            </h4>
            <PerunduraiMap
              dustbins={dustbins.filter(b => collectionPlan.stops.some(s => s.binId === b.id))}
              routeCoordinates={routeCoords}
              showRouteOverlay={true}
              heightClass="h-[250px]"
              zoomLevel={13}
            />
          </div>

          {/* Candidate Bins to Add */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Candidate Dustbins ({candidateBins.length})
              </h4>
              <span className="text-[10px] text-slate-400">Ranked by Priority</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto pr-1">
              {candidateBins.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  All active Perundurai bins are scheduled in the itinerary.
                </p>
              ) : (
                candidateBins.map(bin => (
                  <div key={bin.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {bin.id}
                        </span>
                        <StatusBadge status={bin.status} size="sm" showDot={false} />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                        {bin.name} ({bin.area})
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {bin.fillLevel}%
                      </span>
                      <button
                        onClick={() => addStopToPlan(bin.id)}
                        className="px-2.5 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
