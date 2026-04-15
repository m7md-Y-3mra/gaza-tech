'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { FallbackProps } from 'react-error-boundary';

export const ProfilePostsTabError = ({
  error,
  resetErrorBoundary,
}: FallbackProps) => {
  const t = useTranslations('Profile.PostsTab');

  const getErrorMessage = (err: unknown): string | null => {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    return null;
  };

  const errorMessage = getErrorMessage(error);

  return (
    <div className="flex flex-col items-center justify-center p-8 py-20 text-center">
      <div className="bg-destructive/10 mb-4 flex h-14 w-14 items-center justify-center rounded-full">
        <AlertTriangle className="text-destructive h-7 w-7" />
      </div>
      <h3 className="mb-1 text-sm font-semibold">{t('errorTitle')}</h3>
      <p className="text-muted-foreground mb-4 text-xs">
        {errorMessage || t('errorDescription')}
      </p>
      <Button
        onClick={resetErrorBoundary}
        variant="outline"
        size="sm"
        className="border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
      >
        <RefreshCw className="mr-2 h-3 w-3" />
        {/* We use a generic tryAgain or something similar if available, 
            but for now using what matches the likely intent of mirroring */}
        Try again
      </Button>
    </div>
  );
};
