import { usePathname } from '@/i18n/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useBookmarkStatusProps } from '../types';
import { toggleBookmarkAction } from '@/modules/listings/actions';

export const useBookmarkStatus = ({
  initialIsBookmarked,
  listingId,
}: useBookmarkStatusProps) => {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  const handleBookmark = () => {
    // Optimistic update
    const previousState = isBookmarked;
    setIsBookmarked(!isBookmarked);

    startTransition(async () => {
      const result = await toggleBookmarkAction(listingId, pathname);

      if (!result.success) {
        // Revert on error
        setIsBookmarked(previousState);
        toast.error(result.message);
      } else if (result.data.isBookmarked !== undefined) {
        // Sync with server state
        setIsBookmarked(result.data.isBookmarked);
        toast.success(
          result.data.isBookmarked
            ? 'Added to bookmarks'
            : 'Removed from bookmarks'
        );
      }
    });
  };

  return {
    isPending,
    handleBookmark,
    isBookmarked,
  };
};
