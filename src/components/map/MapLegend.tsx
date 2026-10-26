import React from 'react';

export const MapLegend: React.FC = () => {
  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-md text-xs space-y-2">
      <div className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider">
        Status Legend
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-500 shadow-xs ring-2 ring-rose-200 dark:ring-rose-950" />
          <span className="text-slate-700 dark:text-slate-300">Full (≥ 90%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-amber-500 shadow-xs ring-2 ring-amber-200 dark:ring-amber-950" />
          <span className="text-slate-700 dark:text-slate-300">Nearly Full (70–89%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-xs ring-2 ring-emerald-200 dark:ring-emerald-950" />
          <span className="text-slate-700 dark:text-slate-300">Normal (&lt; 70%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-slate-400 shadow-xs ring-2 ring-slate-200 dark:ring-slate-800" />
          <span className="text-slate-700 dark:text-slate-300">Offline / Stale</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="h-3 w-3 rounded-sm bg-blue-600 shadow-xs ring-2 ring-blue-200 dark:ring-blue-950" />
          <span className="text-slate-700 dark:text-slate-300">Municipal Depot</span>
        </div>
      </div>
    </div>
  );
};
