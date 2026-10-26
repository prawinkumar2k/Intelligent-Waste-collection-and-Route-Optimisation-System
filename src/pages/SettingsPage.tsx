import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Sliders,
  Moon,
  Sun,
  Shield,
  RotateCcw,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  Info,
  Radio,
  Play,
  Pause,
  Database,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    theme,
    toggleTheme,
    settings,
    updateSettings,
    resetSettings,
    isSimulating,
    toggleSimulation,
    simSpeed,
    setSimSpeed,
    resetSimulation,
    stepSimulationTick,
    showToast,
  } = useApp();

  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(localSettings);
    showToast('Settings Saved', 'System preferences saved to local storage.', 'success');
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          System & Simulation Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure sensor threshold triggers, UI themes, and telemetry streaming rates
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Fill Level Trigger Thresholds */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Container Fill-Level & Hardware Thresholds
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                Full Threshold (%)
              </label>
              <input
                type="number"
                min="75"
                max="99"
                value={localSettings.fullThreshold}
                onChange={e =>
                  setLocalSettings({ ...localSettings, fullThreshold: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Triggers Critical alarm (Default: 90%)
              </span>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                Nearly Full Threshold (%)
              </label>
              <input
                type="number"
                min="50"
                max="85"
                value={localSettings.nearlyFullThreshold}
                onChange={e =>
                  setLocalSettings({ ...localSettings, nearlyFullThreshold: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Triggers Warning alert (Default: 70%)
              </span>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                Low Battery Alert (%)
              </label>
              <input
                type="number"
                min="5"
                max="40"
                value={localSettings.lowBatteryThreshold}
                onChange={e =>
                  setLocalSettings({ ...localSettings, lowBatteryThreshold: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Flags hardware maintenance (Default: 20%)
              </span>
            </div>
          </div>
        </div>

        {/* Simulation Engine Controls */}
        <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-emerald-500 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                IoT Telemetry Simulation Engine
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              {isSimulating ? 'Stream Active' : 'Paused'}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            Generates live ultrasonic distance changes, waste accumulation spikes, and occasional
            signal dropouts across Perundurai demo nodes.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={toggleSimulation}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                isSimulating
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isSimulating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isSimulating ? 'Pause IoT Stream' : 'Resume Telemetry'}</span>
            </button>

            <button
              type="button"
              onClick={stepSimulationTick}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Step Single Tick</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 text-[11px]">Interval Speed:</span>
              {(['Slow', 'Normal', 'Fast'] as const).map(speed => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => setSimSpeed(speed)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    simSpeed === speed
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {speed}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={resetSimulation}
              className="ml-auto text-xs text-rose-600 dark:text-rose-400 hover:underline"
            >
              Reset Baseline 24 Bins
            </button>
          </div>
        </div>

        {/* Display & Theme Preferences */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Appearance & Workspace Preferences
          </h3>

          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Color Theme
              </span>
              <span className="text-[11px] text-slate-500">
                Switch between Deep Navy Dark Theme and Clean Light Mode
              </span>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
            >
              {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span>{theme === 'dark' ? 'Dark Navy' : 'Light Mode'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Audio Chimes on Critical Alerts
              </span>
              <span className="text-[11px] text-slate-500">
                Synthesize acoustic tone when bin exceeds 90%
              </span>
            </div>
            <input
              type="checkbox"
              checked={localSettings.soundAlerts}
              onChange={e =>
                setLocalSettings({ ...localSettings, soundAlerts: e.target.checked })
              }
              className="h-4 w-4 rounded accent-emerald-600"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Automatic Map Bounds Framing
              </span>
              <span className="text-[11px] text-slate-500">
                Auto-pan viewport to Perundurai coordinates on marker selection
              </span>
            </div>
            <input
              type="checkbox"
              checked={localSettings.mapAutoFit}
              onChange={e =>
                setLocalSettings({ ...localSettings, mapAutoFit: e.target.checked })
              }
              className="h-4 w-4 rounded accent-emerald-600"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={resetSettings}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            Reset Defaults
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors shadow-xs"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
