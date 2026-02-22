'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { FallbackProps } from 'react-error-boundary';

/**
 * Error boundary fallback for VerificationForm.
 * Shown when the server component throws (e.g. DB fetch failure).
 */
export const VerificationFormError = ({
  error,
  resetErrorBoundary,
}: FallbackProps) => {
  const getErrorMessage = (err: unknown): string | null => {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    return null;
  };

  const errorMessage = getErrorMessage(error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 via-white to-green-50">
      <div className="container mx-auto px-6 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-lg dark:border-red-900 dark:bg-gray-900">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>

            {/* Title */}
            <h2 className="mb-2 text-center text-2xl font-bold text-gray-900 dark:text-white">
              Unable to Load Verification Form
            </h2>

            {/* Description */}
            <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
              We encountered an issue while loading the verification form. This
              could be due to a network problem or server issue.
            </p>

            {/* Error details */}
            {errorMessage && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 dark:bg-red-950/30">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  Error Details:
                </p>
                <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                onClick={resetErrorBoundary ?? (() => window.location.reload())}
                className="flex items-center justify-center gap-2"
                size="lg"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                size="lg"
              >
                Go Back
              </Button>
            </div>

            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              If the problem persists, please try again later or contact
              support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
