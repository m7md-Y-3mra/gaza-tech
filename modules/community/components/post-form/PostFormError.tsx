'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { FallbackProps } from 'react-error-boundary';
import { useTranslations } from 'next-intl';

export const PostFormError = ({ error, resetErrorBoundary }: FallbackProps) => {
  const t = useTranslations('PostForm.error');

  const handleRefresh = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  const getErrorMessage = (err: unknown): string | null => {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    return null;
  };

  const errorMessage = getErrorMessage(error);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6">
        <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-lg sm:p-8">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">
            {t('title')}
          </h2>

          <p className="mb-6 text-center text-gray-600">{t('description')}</p>

          {errorMessage && (
            <div className="mb-6 rounded-lg bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                {t('errorDetails')}
              </p>
              <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              onClick={handleRefresh}
              className="flex items-center justify-center gap-2"
              size="lg"
            >
              <RefreshCw className="h-4 w-4" />
              {t('tryAgain')}
            </Button>

            <Button
              variant="outline"
              onClick={() => window.history.back()}
              size="lg"
            >
              {t('goBack')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
