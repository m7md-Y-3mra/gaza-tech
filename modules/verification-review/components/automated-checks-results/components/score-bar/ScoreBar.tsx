import { ScoreBarProps } from './types';

function getScoreColor(score: number): string {
  if (score >= 71) return 'bg-green-500';
  if (score >= 41) return 'bg-amber-500';
  return 'bg-red-500';
}

function getScoreTextColor(score: number): string {
  if (score >= 71) return 'text-green-600 dark:text-green-400';
  if (score >= 41) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

export default function ScoreBar({ label, value }: ScoreBarProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        {value === null ? (
          <span className="text-xs font-medium text-gray-400">Pending…</span>
        ) : (
          <span className={`text-sm font-bold ${getScoreTextColor(value)}`}>
            {value}%
          </span>
        )}
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        {value === null ? (
          <div className="h-full w-full animate-pulse bg-gray-300 dark:bg-gray-600" />
        ) : (
          <div
            className={`h-full rounded-full transition-all duration-500 ${getScoreColor(value)}`}
            style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
          />
        )}
      </div>
    </div>
  );
}
