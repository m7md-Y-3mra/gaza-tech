'use client';

import { AlertCircle, RotateCcw } from 'lucide-react';

export default function ActionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-red-400" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        Failed to Load Tools
      </h3>
      <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        {error.message ||
          'Something went wrong while loading verification tools.'}
      </p>
      <button
        onClick={reset}
        className="mt-4 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        <RotateCcw className="h-4 w-4" />
        Try Again
      </button>
    </div>
  );
}
