import React from 'react';

interface FillLevelBarProps {
  fillLevel: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  status?: string;
}

export const FillLevelBar: React.FC<FillLevelBarProps> = ({
  fillLevel,
  showPercentage = true,
  size = 'md',
  status,
}) => {
  const clamped = Math.max(0, Math.min(100, fillLevel));

  const getColor = () => {
    if (status === 'Offline') return 'bg-slate-400 dark:bg-slate-600';
    if (clamped >= 90) return 'bg-rose-500';
    if (clamped >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getTextColor = () => {
    if (status === 'Offline') return 'text-slate-500 dark:text-slate-400';
    if (clamped >= 90) return 'text-rose-600 dark:text-rose-400 font-semibold';
    if (clamped >= 70) return 'text-amber-600 dark:text-amber-400 font-semibold';
    return 'text-emerald-600 dark:text-emerald-400 font-medium';
  };

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className="w-full flex items-center gap-2">
      <div className={`flex-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${heightClass} rounded-full transition-all duration-500 ${getColor()}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showPercentage && (
        <span className={`text-xs tabular-nums min-w-[38px] text-right ${getTextColor()}`}>
          {status === 'Offline' ? 'N/A' : `${clamped}%`}
        </span>
      )}
    </div>
  );
};
