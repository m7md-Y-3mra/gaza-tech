import { CheckBadgeProps } from './types';

export default function CheckBadge({
  label,
  value,
  passedLabel = 'Passed',
  failedLabel = 'Failed',
}: CheckBadgeProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
      {value === null ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gray-400" />
          Pending…
        </span>
      ) : value ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          {passedLabel}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          {failedLabel}
        </span>
      )}
    </div>
  );
}
