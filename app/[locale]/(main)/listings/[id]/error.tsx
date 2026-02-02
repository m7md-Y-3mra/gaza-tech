'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('ListingDetails.errors.unexpected');

  useEffect(() => {
    console.error('Listing details error:', error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-6">
        <AlertCircle className="text-destructive mx-auto size-16" />
        <h2 className="text-2xl font-semibold">{t('title')}</h2>
        <p className="text-muted-foreground">{t('description')}</p>

        {error.digest && (
          <p className="text-muted-foreground text-xs">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset}>
            <RefreshCw className="mr-2 size-4" />
            {t('retry')}
          </Button>
          <Button variant="outline" asChild className="hover:text-white!">
            <Link href="/">
              <Home className="mr-2 size-4" />
              {t('goHome')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
