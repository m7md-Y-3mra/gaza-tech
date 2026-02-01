'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { FallbackProps } from 'react-error-boundary';
import { useTranslations } from 'next-intl';

const SimilarProductsError = ({ error, resetErrorBoundary }: FallbackProps) => {
  const t = useTranslations('ListingDetails.SimilarProducts.error');

  return (
    <div className="bg-destructive/10 text-destructive flex flex-col items-center justify-center gap-4 rounded-lg p-6 text-center">
      <AlertCircle className="size-10" />
      <div className="space-y-2">
        <h3 className="font-semibold">{t('title')}</h3>
        <p className="text-sm opacity-90">
          {error instanceof Error && error.message}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={resetErrorBoundary}
        className="bg-background/50 hover:bg-background/80"
      >
        <RefreshCw className="mr-2 size-4" />
        {t('tryAgain')}
      </Button>
    </div>
  );
};

export default SimilarProductsError;
