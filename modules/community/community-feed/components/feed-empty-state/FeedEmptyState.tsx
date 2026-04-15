'use client';

import { useTranslations } from 'next-intl';
import { MessageCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

interface FeedEmptyStateProps {
  hasActiveFilters: boolean;
}

export function FeedEmptyState({ hasActiveFilters }: FeedEmptyStateProps) {
  const t = useTranslations('CommunityFeed');

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <MessageCircle
        className="text-muted-foreground mb-4 h-12 w-12"
        aria-hidden="true"
      />
      <h2 className="text-lg font-semibold">{t('emptyState.title')}</h2>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm">
        {hasActiveFilters
          ? t('emptyState.descriptionFiltered')
          : t('emptyState.description')}
      </p>
      <Button asChild className="mt-6">
        <Link href="/community/create">{t('emptyState.cta')}</Link>
      </Button>
    </div>
  );
}
