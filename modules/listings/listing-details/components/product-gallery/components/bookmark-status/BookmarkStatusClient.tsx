'use client';

import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBookmarkStatus } from './hooks/useBookmarkStatus';
import { BookmarkStatusClientProps } from './types';

const BookmarkStatusClient = ({
  listingId,
  initialIsBookmarked,
}: BookmarkStatusClientProps) => {
  const { isPending, handleBookmark, isBookmarked } = useBookmarkStatus({
    initialIsBookmarked,
    listingId,
  });
  return (
    <button
      onClick={handleBookmark}
      disabled={isPending}
      className={cn(
        'bg-background/80 hover:bg-background rounded-full p-2 shadow-sm backdrop-blur-sm transition-colors disabled:opacity-50',
        isBookmarked && 'text-primary'
      )}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark listing'}
    >
      <Bookmark className={cn('size-5', isBookmarked && 'fill-current')} />
    </button>
  );
};

export default BookmarkStatusClient;
