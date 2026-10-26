import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  colorScheme?: 'emerald' | 'amber' | 'rose' | 'slate' | 'sky' | 'indigo';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'emerald',
  onClick,
}) => {
  const colorStyles = {
    emerald: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    amber: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    rose: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20',
      badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
    slate: {
      bg: 'bg-slate-500/10 dark:bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/20',
      badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
    },
    sky: {
      bg: 'bg-sky-500/10 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/20',
      badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    },
    indigo: {
      bg: 'bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    },
  }[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {value}
            </span>
            {trend && (
              <span
                className={`inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded ${
                  trend.isPositive
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50'
                    : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50'
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
        <div className={`rounded-lg p-2.5 ${colorStyles.bg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};
