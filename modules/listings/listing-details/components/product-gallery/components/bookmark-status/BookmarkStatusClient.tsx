'use client';

import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBookmarkStatus } from './hooks/useBookmarkStatus';
import { BookmarkStatusClientProps } from './types';
import { useTranslations } from 'next-intl';

const BookmarkStatusClient = ({
  listingId,
  initialIsBookmarked,
}: BookmarkStatusClientProps) => {
  const { isPending, handleBookmark, isBookmarked } = useBookmarkStatus({
    initialIsBookmarked,
    listingId,
  });
  const t = useTranslations('ListingDetails.a11y');

  return (
    <button
      onClick={handleBookmark}
      disabled={isPending}
      className={cn(
        'bg-background/80 hover:bg-background focus-visible:ring-primary rounded-full p-2 shadow-sm backdrop-blur-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50',
        isBookmarked && 'text-primary'
      )}
      aria-label={isBookmarked ? t('bookmarkSaved') : t('bookmarkUnsaved')}
      aria-pressed={isBookmarked}
    >
      <Bookmark className={cn('size-5', isBookmarked && 'fill-current')} />
    </button>
  );
};

export default BookmarkStatusClient;
