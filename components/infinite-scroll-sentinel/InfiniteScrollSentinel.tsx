'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

interface InfiniteScrollSentinelProps {
  sentinelRef: (node?: Element | null) => void;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  retry: () => void;
  skeleton: ReactNode;
  className?: string;
}

const InfiniteScrollSentinel = ({
  sentinelRef,
  isLoading,
  error,
  hasMore,
  retry,
  skeleton,
  className,
}: InfiniteScrollSentinelProps) => {
  const t = useTranslations('InfiniteScrollSentinel');

  // Error state — show message + retry button
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground mb-4 text-sm">{t('error')}</p>
        <button
          type="button"
          onClick={retry}
          className="text-primary hover:text-primary/80 rounded-md px-4 py-2 text-sm font-medium underline-offset-4 transition-colors hover:underline focus:ring-2 focus:ring-offset-2 focus:outline-none"
          aria-label={t('retry')}
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  // Done — nothing more to load
  if (!hasMore) return null;

  // Loading state — render the domain-specific skeleton
  if (isLoading) {
    return <div className={className}>{skeleton}</div>;
  }

  // Idle — render invisible sentinel that triggers the next fetch on scroll
  return (
    <div
      ref={sentinelRef}
      className={className}
      aria-hidden="true"
      style={{ height: 1 }}
    />
  );
};

export default InfiniteScrollSentinel;
export type { InfiniteScrollSentinelProps };
