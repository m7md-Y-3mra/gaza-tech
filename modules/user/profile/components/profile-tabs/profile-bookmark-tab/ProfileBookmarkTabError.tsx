'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { FallbackProps } from 'react-error-boundary';

export const ProfileBookmarkTabError = ({
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
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="bg-destructive/10 mb-4 flex h-14 w-14 items-center justify-center rounded-full">
        <AlertTriangle className="text-destructive h-7 w-7" />
      </div>
      <h3 className="mb-1 text-sm font-semibold">Failed to load bookmarks</h3>
      {errorMessage && (
        <p className="text-muted-foreground mb-4 text-xs">{errorMessage}</p>
      )}
      <Button
        onClick={resetErrorBoundary}
        variant="outline"
        size="sm"
        className="border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
      >
        <RefreshCw className="mr-2 h-3 w-3" />
        Try again
      </Button>
    </div>
  );
};
