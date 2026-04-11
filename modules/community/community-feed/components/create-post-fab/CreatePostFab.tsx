'use client';

import { useTranslations } from 'next-intl';
import { Pen } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export function CreatePostFab() {
  const t = useTranslations('CommunityFeed');

  return (
    <div className="fixed end-4 bottom-6 z-40 md:hidden">
      <Link
        href="/community/create"
        className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        aria-label={t('createPostFab')}
      >
        <Pen className="h-4 w-4" aria-hidden="true" />
        <span>{t('createPostFab')}</span>
      </Link>
    </div>
  );
}
