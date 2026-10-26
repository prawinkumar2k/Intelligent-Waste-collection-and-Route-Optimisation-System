import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Dustbin, DustbinStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { FillLevelBar } from '../common/FillLevelBar';
import { PERUNDURAI_CENTER, DEPOTS } from '../../data/initialData';
import { Battery, Wifi, Clock, Plus, ArrowRight, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PerunduraiMapProps {
  dustbins: Dustbin[];
  selectedBinId?: string | null;
  onSelectBin?: (bin: Dustbin) => void;
  onAddStop?: (binId: string) => void;
  showRouteOverlay?: boolean;
  routeCoordinates?: [number, number][];
  heightClass?: string;
  zoomLevel?: number;
}

// Map helper to pan/zoom when requested
const MapViewController: React.FC<{
  center?: [number, number];
  zoom?: number;
  bins: Dustbin[];
}> = ({ center, zoom, bins }) => {
  const map = useMap();

  useEffect(() => {
    if (center && zoom) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);

  return null;
};

// Function to generate modern SVG / HTML Leaflet icons
const createBinIcon = (status: DustbinStatus, fillLevel: number) => {
  let bgColor = '#10b981'; // green
  let ringColor = 'rgba(16, 185, 129, 0.3)';
  let label = `${fillLevel}%`;

  if (status === 'Full') {
    bgColor = '#ef4444'; // red
    ringColor = 'rgba(239, 68, 68, 0.4)';
  } else if (status === 'Nearly Full') {
    bgColor = '#f59e0b'; // amber
    ringColor = 'rgba(245, 158, 11, 0.4)';
  } else if (status === 'Offline') {
    bgColor = '#94a3b8'; // grey
    ringColor = 'rgba(148, 163, 184, 0.3)';
    label = 'OFF';
  }

  return L.divIcon({
    className: 'custom-bin-marker',
    html: `
      <div style="
        background-color: ${bgColor};
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 700;
        box-shadow: 0 4px 10px ${ringColor}, 0 0 0 3px white;
        cursor: pointer;
        transition: transform 0.2s ease;
      " onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
        ${label}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

const depotIcon = L.divIcon({
  className: 'custom-depot-marker',
  html: `
    <div style="
      background-color: #2563eb;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 800;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4), 0 0 0 2px white;
      letter-spacing: 0.5px;
    ">
      DEPOT
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

export const PerunduraiMap: React.FC<PerunduraiMapProps> = ({
  dustbins,
  selectedBinId,
  onSelectBin,
  onAddStop,
  showRouteOverlay = true,
  routeCoordinates,
  heightClass = 'h-[540px]',
  zoomLevel = PERUNDURAI_CENTER.zoom,
}) => {
  const navigate = useNavigate();

  // Find center if a bin is selected
  const targetCenter: [number, number] = useMemo(() => {
    if (selectedBinId) {
      const match = dustbins.find(b => b.id === selectedBinId);
      if (match) return [match.latitude, match.longitude];
    }
    return [PERUNDURAI_CENTER.lat, PERUNDURAI_CENTER.lng];
  }, [selectedBinId, dustbins]);

  // Route overlay coordinates: default from active plan or sample path
  const polylinePositions = useMemo(() => {
    if (routeCoordinates && routeCoordinates.length > 0) return routeCoordinates;
    // Fallback: connect the depots to full bins for visual clarity
    const fullBins = dustbins.filter(b => b.status === 'Full').slice(0, 5);
    if (fullBins.length === 0) return [];
    return [
      DEPOTS[0].coords,
      ...fullBins.map(b => [b.latitude, b.longitude] as [number, number]),
      DEPOTS[0].coords,
    ];
  }, [routeCoordinates, dustbins]);

  return (
    <div className={`relative w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm ${heightClass}`}>
      <MapContainer
        center={[PERUNDURAI_CENTER.lat, PERUNDURAI_CENTER.lng]}
        zoom={zoomLevel}
        scrollWheelZoom={false}
        className="w-full h-full z-10"
      >
        <MapViewController center={targetCenter} zoom={zoomLevel} bins={dustbins} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Depots */}
        {DEPOTS.map(depot => (
          <Marker key={depot.id} position={depot.coords} icon={depotIcon}>
            <Popup>
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 min-w-[200px]">
                <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>{depot.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold">
                    Depot
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  Fleet dispatch & municipal weighing station
                </p>
                <div className="text-[11px] text-slate-400 font-mono">
                  {depot.coords[0].toFixed(4)}, {depot.coords[1].toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Illustrative Collection Route Polyline */}
        {showRouteOverlay && polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: '#059669',
              weight: 4,
              opacity: 0.85,
              dashArray: '8, 8',
            }}
          />
        )}

        {/* Dustbin Markers */}
        {dustbins.map(bin => {
          const icon = createBinIcon(bin.status, bin.fillLevel);
          return (
            <Marker
              key={bin.id}
              position={[bin.latitude, bin.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectBin && onSelectBin(bin),
              }}
            >
              <Popup>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 text-xs space-y-3 min-w-[250px]">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {bin.id}
                      </span>
                      <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                        {bin.area}
                      </h4>
                    </div>
                    <StatusBadge status={bin.status} size="sm" />
                  </div>

                  {/* Fill Level */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">Current Fill Level</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {bin.currentKg} kg / {bin.capacityKg} kg
                      </span>
                    </div>
                    <FillLevelBar fillLevel={bin.fillLevel} status={bin.status} size="sm" />
                  </div>

                  {/* Quick Telemetry Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Battery className="h-3.5 w-3.5 text-slate-400" />
                      <span>{bin.battery}%</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Wifi className="h-3.5 w-3.5 text-slate-400" />
                      <span>{bin.signalRssi} dBm</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 col-span-2">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>Updated {bin.lastUpdated}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    {onAddStop && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onAddStop(bin.id);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Stop</span>
                      </button>
                    )}
                    <button
                      onClick={() => navigate('/analytics')}
                      className="flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <span>Telemetry</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Illustrative Demo Badge */}
      <div className="absolute top-3 left-12 z-[1000] pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 text-white text-[10px] font-semibold px-2.5 py-1 rounded-md shadow-md flex items-center gap-1.5">
          <ShieldAlert className="h-3 w-3 text-amber-400" />
          <span>PERUNDURAI PILOT • ILLUSTRATIVE COORDINATES</span>
        </div>
      </div>
    </div>
  );
};
