import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dustbin,
  AlertItem,
  CollectionPlan,
  CollectionHistoryRecord,
  SystemSettings,
  DustbinStatus,
} from '../types';
import {
  INITIAL_DUSTBINS,
  INITIAL_ALERTS,
  INITIAL_COLLECTION_PLAN,
  INITIAL_COLLECTION_HISTORY,
} from '../data/initialData';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  dustbins: Dustbin[];
  addDustbin: (bin: Omit<Dustbin, 'id' | 'lastUpdated'>) => void;
  updateDustbin: (id: string, updates: Partial<Dustbin>) => void;
  deleteDustbin: (id: string) => void;
  resetDustbins: () => void;
  alerts: AlertItem[];
  markAlertRead: (id: string) => void;
  markAllAlertsRead: () => void;
  dismissAlert: (id: string) => void;
  collectionPlan: CollectionPlan;
  updateCollectionPlan: (updates: Partial<CollectionPlan>) => void;
  addStopToPlan: (binId: string) => void;
  removeStopFromPlan: (binId: string) => void;
  reorderStops: (newStops: CollectionPlan['stops']) => void;
  setStopStatus: (binId: string, status: 'Pending' | 'In Progress' | 'Collected' | 'Skipped') => void;
  resetCollectionPlan: () => void;
  collectionHistory: CollectionHistoryRecord[];
  addCollectionHistory: (record: CollectionHistoryRecord) => void;
  settings: SystemSettings;
  updateSettings: (updates: Partial<SystemSettings>) => void;
  resetSettings: () => void;
  // Simulation
  isSimulating: boolean;
  simSpeed: 'Slow' | 'Normal' | 'Fast';
  toggleSimulation: () => void;
  setSimSpeed: (speed: 'Slow' | 'Normal' | 'Fast') => void;
  stepSimulationTick: () => void;
  resetSimulation: () => void;
  // Toasts
  toasts: ToastMessage[];
  showToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  // Global search
  globalSearch: string;
  setGlobalSearch: (s: string) => void;
}

const DEFAULT_SETTINGS: SystemSettings = {
  fullThreshold: 90,
  nearlyFullThreshold: 70,
  lowBatteryThreshold: 20,
  refreshIntervalSec: 5,
  defaultDepot: 'DEPOT-01',
  mapAutoFit: true,
  soundAlerts: false,
  simulationSpeed: 'Normal',
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme management with dark as primary enterprise palette
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('iwcrs_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('iwcrs_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Settings
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('iwcrs_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    return DEFAULT_SETTINGS;
  });

  const updateSettings = useCallback((updates: Partial<SystemSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('iwcrs_settings', JSON.stringify(next));
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('iwcrs_settings');
  }, []);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = useCallback(
    (title: string, message?: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts(prev => [...prev, { id, title, message, type }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Dustbins state
  const [dustbins, setDustbins] = useState<Dustbin[]>(() => {
    const saved = localStorage.getItem('iwcrs_dustbins');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_DUSTBINS;
  });

  useEffect(() => {
    localStorage.setItem('iwcrs_dustbins', JSON.stringify(dustbins));
  }, [dustbins]);

  // Alerts state
  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    const saved = localStorage.getItem('iwcrs_alerts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ALERTS;
  });

  useEffect(() => {
    localStorage.setItem('iwcrs_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Collection Plan state
  const [collectionPlan, setCollectionPlan] = useState<CollectionPlan>(() => {
    const saved = localStorage.getItem('iwcrs_plan');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_COLLECTION_PLAN;
  });

  useEffect(() => {
    localStorage.setItem('iwcrs_plan', JSON.stringify(collectionPlan));
  }, [collectionPlan]);

  // Collection History state
  const [collectionHistory, setCollectionHistory] = useState<CollectionHistoryRecord[]>(() => {
    const saved = localStorage.getItem('iwcrs_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_COLLECTION_HISTORY;
  });

  useEffect(() => {
    localStorage.setItem('iwcrs_history', JSON.stringify(collectionHistory));
  }, [collectionHistory]);

  // Global search
  const [globalSearch, setGlobalSearch] = useState('');

  // Simulation controls
  const [isSimulating, setIsSimulating] = useState(true);
  const [simSpeed, setSimSpeed] = useState<'Slow' | 'Normal' | 'Fast'>('Normal');

  // Helpers to calculate bin status from fill level
  const computeStatus = useCallback(
    (fill: number, connectivity: string): DustbinStatus => {
      if (connectivity === 'Offline') return 'Offline';
      if (fill >= settings.fullThreshold) return 'Full';
      if (fill >= settings.nearlyFullThreshold) return 'Nearly Full';
      return 'Normal';
    },
    [settings.fullThreshold, settings.nearlyFullThreshold]
  );

  // Simulation tick logic
  const stepSimulationTick = useCallback(() => {
    setDustbins(prevBins => {
      // Pick 2-4 random bins to increment or fluctuate
      const changedIndices = new Set<number>();
      const countToChange = Math.min(prevBins.length, Math.floor(Math.random() * 3) + 2);
      while (changedIndices.size < countToChange) {
        changedIndices.add(Math.floor(Math.random() * prevBins.length));
      }

      const newAlerts: AlertItem[] = [];

      const updated = prevBins.map((bin, idx) => {
        if (!changedIndices.has(idx)) return bin;

        // If offline, chance to reconnect or stay offline
        if (bin.connectivity === 'Offline') {
          const reconnect = Math.random() < 0.15;
          if (reconnect) {
            return {
              ...bin,
              connectivity: 'Online' as const,
              status: computeStatus(45, 'Online'),
              fillLevel: 45,
              battery: 50,
              lastUpdated: 'Just now',
              distanceCm: 55,
              currentKg: Math.round(bin.capacityKg * 0.45),
            };
          }
          return bin;
        }

        // Small fill change (+1 to +5%)
        const delta = Math.floor(Math.random() * 5) + 1;
        let newFill = bin.fillLevel + delta;
        if (newFill > 100) newFill = 100;

        const newDistance = Math.max(2, Math.round(bin.totalDepthCm * (1 - newFill / 100)));
        const newWeight = Math.round(bin.capacityKg * (newFill / 100));
        const newStatus = computeStatus(newFill, bin.connectivity);

        // Check if just reached full threshold
        if (bin.fillLevel < settings.fullThreshold && newFill >= settings.fullThreshold) {
          newAlerts.push({
            id: `ALT-SIM-${Date.now()}-${bin.id}`,
            binId: bin.id,
            binArea: bin.area,
            type: 'Dustbin Full',
            severity: 'Critical',
            message: `Telemetry trigger: ${bin.id} in ${bin.area} breached ${newFill}% threshold.`,
            timestamp: 'Just now',
            isRead: false,
            value: `${newFill}%`,
          });
        }

        // Minor battery drain (0.1% chance)
        const batteryDelta = Math.random() < 0.2 ? 1 : 0;
        const newBattery = Math.max(5, bin.battery - batteryDelta);

        return {
          ...bin,
          fillLevel: newFill,
          currentKg: newWeight,
          distanceCm: newDistance,
          battery: newBattery,
          status: newStatus,
          lastUpdated: 'Just now',
        };
      });

      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev].slice(0, 30));
      }

      return updated;
    });
  }, [computeStatus, settings.fullThreshold]);

  // Interval runner for simulation
  useEffect(() => {
    if (!isSimulating) return;
    const intervalMs = simSpeed === 'Fast' ? 2000 : simSpeed === 'Slow' ? 8000 : 4000;
    const timer = setInterval(() => {
      stepSimulationTick();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isSimulating, simSpeed, stepSimulationTick]);

  const toggleSimulation = useCallback(() => {
    setIsSimulating(prev => {
      const next = !prev;
      showToast(
        next ? 'Simulation Resumed' : 'Simulation Paused',
        next ? 'Telemetry data is actively updating.' : 'Data streams paused.',
        next ? 'info' : 'warning'
      );
      return next;
    });
  }, [showToast]);

  const resetSimulation = useCallback(() => {
    setDustbins(INITIAL_DUSTBINS);
    setAlerts(INITIAL_ALERTS);
    localStorage.removeItem('iwcrs_dustbins');
    localStorage.removeItem('iwcrs_alerts');
    showToast('Demo State Reset', 'Restored 24 baseline Perundurai dustbins and alerts.', 'info');
  }, [showToast]);

  // Dustbin actions
  const addDustbin = useCallback(
    (data: Omit<Dustbin, 'id' | 'lastUpdated'>) => {
      const nextNum = dustbins.length + 1;
      const id = `BIN-PD-${String(nextNum).padStart(3, '0')}`;
      const newBin: Dustbin = {
        ...data,
        id,
        lastUpdated: 'Just now',
        simulated: true,
      };
      setDustbins(prev => [newBin, ...prev]);
      showToast('Dustbin Registered', `Created ${id} in ${data.area}.`, 'success');
    },
    [dustbins.length, showToast]
  );

  const updateDustbin = useCallback(
    (id: string, updates: Partial<Dustbin>) => {
      setDustbins(prev =>
        prev.map(bin => {
          if (bin.id !== id) return bin;
          const merged = { ...bin, ...updates, lastUpdated: 'Just now' };
          merged.status = computeStatus(merged.fillLevel, merged.connectivity);
          return merged;
        })
      );
      showToast('Dustbin Updated', `Record for ${id} has been modified.`, 'success');
    },
    [computeStatus, showToast]
  );

  const deleteDustbin = useCallback(
    (id: string) => {
      setDustbins(prev => prev.filter(b => b.id !== id));
      // also remove from active plan
      setCollectionPlan(prev => ({
        ...prev,
        stops: prev.stops.filter(s => s.binId !== id),
      }));
      showToast('Dustbin Removed', `Removed ${id} from system registry.`, 'warning');
    },
    [showToast]
  );

  const resetDustbins = useCallback(() => {
    setDustbins(INITIAL_DUSTBINS);
    showToast('Registry Restored', '24 initial Perundurai bins restored.', 'info');
  }, [showToast]);

  // Alert actions
  const markAlertRead = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, isRead: true } : a)));
  }, []);

  const markAllAlertsRead = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
    showToast('Alerts Cleared', 'All alerts marked as read.', 'info');
  }, [showToast]);

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  // Collection plan actions
  const updateCollectionPlan = useCallback((updates: Partial<CollectionPlan>) => {
    setCollectionPlan(prev => ({ ...prev, ...updates }));
  }, []);

  const addStopToPlan = useCallback(
    (binId: string) => {
      const targetBin = dustbins.find(b => b.id === binId);
      if (!targetBin) return;
      if (collectionPlan.stops.some(s => s.binId === binId)) {
        showToast('Already in Route', `${binId} is already scheduled in the active plan.`, 'warning');
        return;
      }
      const newStop = {
        stopOrder: collectionPlan.stops.length + 1,
        binId: targetBin.id,
        binArea: targetBin.area,
        fillLevel: targetBin.fillLevel,
        capacityKg: targetBin.capacityKg,
        latitude: targetBin.latitude,
        longitude: targetBin.longitude,
        status: 'Pending' as const,
        estimatedArrival: `+${collectionPlan.stops.length * 15 + 15} mins`,
      };
      setCollectionPlan(prev => ({
        ...prev,
        stops: [...prev.stops, newStop],
        totalDistanceKm: Number((prev.totalDistanceKm + 2.3).toFixed(1)),
        estimatedDurationMin: prev.estimatedDurationMin + 15,
        totalCollectedKg: prev.totalCollectedKg + targetBin.currentKg,
      }));
      showToast('Stop Added', `Added ${targetBin.name} (${targetBin.area}) to collection itinerary.`, 'success');
    },
    [dustbins, collectionPlan.stops, showToast]
  );

  const removeStopFromPlan = useCallback(
    (binId: string) => {
      setCollectionPlan(prev => {
        const remaining = prev.stops.filter(s => s.binId !== binId);
        const reindexed = remaining.map((s, idx) => ({ ...s, stopOrder: idx + 1 }));
        return {
          ...prev,
          stops: reindexed,
          totalDistanceKm: Math.max(3, Number((prev.totalDistanceKm - 2.1).toFixed(1))),
          estimatedDurationMin: Math.max(10, prev.estimatedDurationMin - 12),
        };
      });
      showToast('Stop Removed', `Removed ${binId} from route itinerary.`, 'info');
    },
    [showToast]
  );

  const reorderStops = useCallback((newStops: CollectionPlan['stops']) => {
    const reindexed = newStops.map((s, idx) => ({ ...s, stopOrder: idx + 1 }));
    setCollectionPlan(prev => ({ ...prev, stops: reindexed }));
  }, []);

  const setStopStatus = useCallback(
    (binId: string, status: 'Pending' | 'In Progress' | 'Collected' | 'Skipped') => {
      setCollectionPlan(prev => ({
        ...prev,
        stops: prev.stops.map(s => (s.binId === binId ? { ...s, status } : s)),
      }));

      // If collected, reset that bin's fill level in state!
      if (status === 'Collected') {
        setDustbins(prev =>
          prev.map(b => {
            if (b.id !== binId) return b;
            return {
              ...b,
              fillLevel: 4,
              currentKg: Math.round(b.capacityKg * 0.04),
              distanceCm: 96,
              status: 'Normal',
              lastUpdated: 'Collected just now',
            };
          })
        );
        // Record in history
        const bin = dustbins.find(b => b.id === binId);
        if (bin) {
          const histId = `COL-${Math.floor(1000 + Math.random() * 9000)}`;
          const newHist: CollectionHistoryRecord = {
            id: histId,
            binId: bin.id,
            area: bin.area,
            plannedTime: 'Scheduled Shift',
            completionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            operator: collectionPlan.driverName.split(' ')[0] || 'Field Operator',
            vehicleId: collectionPlan.assignedVehicle.split(' ')[0] || 'TN-33-AX-4820',
            status: 'Completed',
            recordedFill: bin.fillLevel,
            weightCollectedKg: bin.currentKg,
          };
          setCollectionHistory(h => [newHist, ...h]);
        }
        showToast('Collection Completed', `${binId} marked collected; bin emptied to 4%.`, 'success');
      }
    },
    [dustbins, collectionPlan.driverName, collectionPlan.assignedVehicle, showToast]
  );

  const resetCollectionPlan = useCallback(() => {
    setCollectionPlan(INITIAL_COLLECTION_PLAN);
    showToast('Plan Reset', 'Default morning shift plan reloaded.', 'info');
  }, [showToast]);

  const addCollectionHistory = useCallback((record: CollectionHistoryRecord) => {
    setCollectionHistory(prev => [record, ...prev]);
  }, []);

  const contextValue = useMemo(
    () => ({
      theme,
      toggleTheme,
      dustbins,
      addDustbin,
      updateDustbin,
      deleteDustbin,
      resetDustbins,
      alerts,
      markAlertRead,
      markAllAlertsRead,
      dismissAlert,
      collectionPlan,
      updateCollectionPlan,
      addStopToPlan,
      removeStopFromPlan,
      reorderStops,
      setStopStatus,
      resetCollectionPlan,
      collectionHistory,
      addCollectionHistory,
      settings,
      updateSettings,
      resetSettings,
      isSimulating,
      simSpeed,
      toggleSimulation,
      setSimSpeed,
      stepSimulationTick,
      resetSimulation,
      toasts,
      showToast,
      removeToast,
      globalSearch,
      setGlobalSearch,
    }),
    [
      theme,
      toggleTheme,
      dustbins,
      addDustbin,
      updateDustbin,
      deleteDustbin,
      resetDustbins,
      alerts,
      markAlertRead,
      markAllAlertsRead,
      dismissAlert,
      collectionPlan,
      updateCollectionPlan,
      addStopToPlan,
      removeStopFromPlan,
      reorderStops,
      setStopStatus,
      resetCollectionPlan,
      collectionHistory,
      addCollectionHistory,
      settings,
      updateSettings,
      resetSettings,
      isSimulating,
      simSpeed,
      toggleSimulation,
      setSimSpeed,
      stepSimulationTick,
      resetSimulation,
      toasts,
      showToast,
      removeToast,
      globalSearch,
    ]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
