import { OCR_STATUS_CONFIG, PULSE_COLOR } from './constants';
import { OcrStatusBadgeProps } from './types';

export default function OcrStatusBadge({ status, error }: OcrStatusBadgeProps) {
  const config =
    OCR_STATUS_CONFIG[status ?? 'pending'] ?? OCR_STATUS_CONFIG.pending;

  return (
    <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          AI Processing Status
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.bg} ${config.text}`}
        >
          {config.pulse && (
            <span
              className={`h-1.5 w-1.5 animate-pulse rounded-full ${PULSE_COLOR[status ?? ''] ?? ''}`}
            />
          )}
          {config.label}
        </span>
      </div>
      {status === 'failed' && error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
