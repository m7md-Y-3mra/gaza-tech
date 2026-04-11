'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Heart, Bookmark, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter, usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/hooks/use-current-user';
import {
  togglePostLikeAction,
  togglePostBookmarkAction,
} from '@/modules/community/actions';
import { usePostDetailContext } from '@/modules/community/components/post-detail-context';
import type { FeedPost } from '@/modules/community/types';

type PostDetailActionsProps = {
  post: FeedPost;
};

export function PostDetailActions({ post }: PostDetailActionsProps) {
  const t = useTranslations('PostCard');
  const locale = useLocale();
  const { user } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();
  const { updatePost } = usePostDetailContext();

  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [isBookmarked, setIsBookmarked] = useState(post.is_bookmarked);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (!user) {
      router.push(`/${locale}/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isLoading) return;

    // Optimistic update
    const newIsLiked = !isLiked;
    const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;
    setIsLiked(newIsLiked);
    setLikeCount(newLikeCount);

    setIsLoading(true);
    const result = await togglePostLikeAction({ post_id: post.post_id });
    setIsLoading(false);

    if (result.success && result.data) {
      setIsLiked(result.data.is_liked);
      setLikeCount(result.data.like_count);
      updatePost({
        post_id: post.post_id,
        is_liked: result.data.is_liked,
        like_count: result.data.like_count,
      });
    } else {
      // Revert on error
      setIsLiked(!newIsLiked);
      setLikeCount(likeCount);
      toast.error(t('likeError'));
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      router.push(`/${locale}/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isLoading) return;

    // Optimistic update
    const newIsBookmarked = !isBookmarked;
    setIsBookmarked(newIsBookmarked);

    setIsLoading(true);
    const result = await togglePostBookmarkAction({ post_id: post.post_id });
    setIsLoading(false);

    if (result.success && result.data) {
      setIsBookmarked(result.data.is_bookmarked);
      updatePost({
        post_id: post.post_id,
        is_bookmarked: result.data.is_bookmarked,
      });
      toast.success(
        result.data.is_bookmarked ? t('bookmarkAdded') : t('bookmarkRemoved')
      );
    } else {
      // Revert on error
      setIsBookmarked(!newIsBookmarked);
      toast.error(t('bookmarkError'));
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/${locale}/community/${post.post_id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('shareCopied'));
    } catch {
      toast.error(t('shareError'));
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <div className="flex items-center justify-between border-y py-1">
      <div className="flex items-center gap-1">
        <button
          onClick={handleLike}
          disabled={isLoading}
          className={cn(
            'hover:bg-muted focus-visible:ring-ring flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2',
            isLiked
              ? 'text-red-500'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-label={isLiked ? t('unlike') : t('like')}
        >
          <Heart
            className={cn('h-5 w-5', isLiked && 'fill-current')}
            aria-hidden="true"
          />
          <span>{formatCount(likeCount)}</span>
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={handleBookmark}
          disabled={isLoading}
          className={cn(
            'hover:bg-muted focus-visible:ring-ring flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2',
            isBookmarked
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-label={isBookmarked ? t('unbookmark') : t('bookmark')}
        >
          <Bookmark
            className={cn('h-5 w-5', isBookmarked && 'fill-current')}
            aria-hidden="true"
          />
        </button>

        <button
          onClick={handleShare}
          className="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2"
          aria-label={t('share')}
        >
          <Share2 className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
