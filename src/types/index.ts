export type DustbinStatus = 'Normal' | 'Nearly Full' | 'Full' | 'Offline';

export interface Dustbin {
  id: string;
  name: string;
  area: string;
  latitude: number;
  longitude: number;
  fillLevel: number; // 0 - 100%
  capacityKg: number;
  currentKg: number;
  status: DustbinStatus;
  battery: number; // 0 - 100%
  connectivity: 'Online' | 'Offline' | 'Weak';
  signalRssi: number; // -30 to -110 dBm
  lastUpdated: string;
  distanceCm: number; // sensor distance from bin top
  totalDepthCm: number; // e.g. 100cm total depth
  temperatureC: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  installDate: string;
  wasteType: 'General Municipal' | 'Recyclable' | 'Organic / Market' | 'Commercial';
  simulated?: boolean;
}

export interface SensorReading {
  timestamp: string;
  binId: string;
  fillLevel: number;
  distanceCm: number;
  battery: number;
  rssi: number;
  temperatureC: number;
}

export type AlertSeverity = 'Critical' | 'Warning' | 'Info';
export type AlertType =
  | 'Dustbin Full'
  | 'Nearly Full'
  | 'Device Offline'
  | 'Stale Sensor Data'
  | 'Low Battery'
  | 'Sensor Reading Error';

export interface AlertItem {
  id: string;
  binId: string;
  binArea: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  isRead: boolean;
  value?: string | number;
}

export interface CollectionStop {
  stopOrder: number;
  binId: string;
  binArea: string;
  fillLevel: number;
  capacityKg: number;
  latitude: number;
  longitude: number;
  status: 'Pending' | 'In Progress' | 'Collected' | 'Skipped';
  estimatedArrival: string;
}

export interface CollectionPlan {
  id: string;
  title: string;
  depotId: string;
  depotName: string;
  depotCoords: [number, number];
  assignedVehicle: string;
  driverName: string;
  status: 'Planned' | 'In Progress' | 'Completed';
  createdAt: string;
  stops: CollectionStop[];
  totalDistanceKm: number;
  estimatedDurationMin: number;
  totalCollectedKg: number;
}

export interface CollectionHistoryRecord {
  id: string;
  binId: string;
  area: string;
  plannedTime: string;
  completionTime: string;
  operator: string;
  vehicleId: string;
  status: 'Completed' | 'Delayed' | 'Partial';
  recordedFill: number;
  weightCollectedKg: number;
}

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'depot' | 'bin' | 'intersection' | 'landfill';
  binId?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number; // distance / cost in km or min
  isBlocked?: boolean;
}

export interface SystemSettings {
  fullThreshold: number; // default 90
  nearlyFullThreshold: number; // default 70
  lowBatteryThreshold: number; // default 20
  refreshIntervalSec: number;
  defaultDepot: string;
  mapAutoFit: boolean;
  soundAlerts: boolean;
  simulationSpeed: 'Slow' | 'Normal' | 'Fast';
}
