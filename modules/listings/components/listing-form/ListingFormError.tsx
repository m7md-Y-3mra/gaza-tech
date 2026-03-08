'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { FallbackProps } from 'react-error-boundary';

/**
 * Error component for ListingForm - used with ErrorBoundary
 * Provides clear error indication and recovery options
 */
export const ListingFormError = ({
  error,
  resetErrorBoundary,
}: FallbackProps) => {
  const handleRefresh = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  // Extract error message from unknown error type
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
          <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-lg">
            {/* Error Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>

            {/* Error Title */}
            <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">
              Unable to Load Form
            </h2>

            {/* Error Description */}
            <p className="mb-6 text-center text-gray-600">
              We encountered an issue while loading the listing form. This could
              be due to a network problem or server issue.
            </p>

            {/* Error Details (if available) */}
            {errorMessage && (
              <div className="mb-6 rounded-lg bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800">
                  Error Details:
                </p>
                <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                onClick={handleRefresh}
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

            {/* Help Text */}
            <p className="mt-6 text-center text-sm text-gray-500">
              If the problem persists, please try again later or contact
              support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
