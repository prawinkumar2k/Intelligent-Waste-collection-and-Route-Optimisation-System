import React from 'react';
import { DustbinStatus, AlertSeverity } from '../../types';

interface StatusBadgeProps {
  status:
    | DustbinStatus
    | AlertSeverity
    | 'Pending'
    | 'Planned'
    | 'In Progress'
    | 'Collected'
    | 'Skipped'
    | 'Delayed'
    | 'Completed'
    | 'Partial'
    | 'Online'
    | 'Offline'
    | 'Weak';
  size?: 'sm' | 'md';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
}) => {
  const getStyle = () => {
    switch (status) {
      case 'Full':
      case 'Critical':
        return {
          bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
          dot: 'bg-rose-500',
        };
      case 'Nearly Full':
      case 'Warning':
      case 'Delayed':
      case 'Weak':
        return {
          bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          dot: 'bg-amber-500',
        };
      case 'Normal':
      case 'Info':
      case 'Collected':
      case 'Completed':
      case 'Online':
        return {
          bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-500',
        };
      case 'Offline':
        return {
          bg: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20',
          dot: 'bg-slate-400',
        };
      case 'In Progress':
        return {
          bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
          dot: 'bg-sky-500 animate-pulse',
        };
      case 'Pending':
      case 'Planned':
        return {
          bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
          dot: 'bg-indigo-500',
        };
      case 'Skipped':
      case 'Partial':
        return {
          bg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
          dot: 'bg-orange-500',
        };
      default:
        return {
          bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          dot: 'bg-slate-400',
        };
    }
  };

  const style = getStyle();
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${style.bg} ${sizeClasses}`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />}
      {status}
    </span>
  );
};
