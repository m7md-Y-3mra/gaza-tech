'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { FallbackProps } from 'react-error-boundary';
import { useTranslations } from 'next-intl';

/**
 * Error component for CategoryFilters - used with ErrorBoundary
 */
export const CategoryFiltersError = ({
  error,
  resetErrorBoundary,
}: FallbackProps) => {
  const t = useTranslations('ListingsHome.CategoryFilters.error');
  const handleRefresh = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  // Extract error message
  const getErrorMessage = (err: unknown): string | null => {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    return null;
  };

  const errorMessage = getErrorMessage(error);

  return (
    <section className="bg-destructive/5 border-destructive/20 border-b py-4">
      <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <div className="flex items-center gap-3">
          <div className="bg-destructive/10 flex h-10 w-10 items-center justify-center rounded-full">
            <AlertTriangle className="text-destructive h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {t('title')}
            </h3>
            {errorMessage && (
              <p className="text-xs text-gray-600">{errorMessage}</p>
            )}
          </div>
        </div>

        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="border-destructive/20 hover:bg-destructive/10 hover:text-destructive w-full md:w-auto"
        >
          <RefreshCw className="mr-2 h-3 w-3" />
          {t('tryAgain')}
        </Button>
      </div>
    </section>
  );
};
