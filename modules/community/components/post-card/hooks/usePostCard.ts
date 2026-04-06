'use client';

import { useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { togglePostLikeAction } from '@/modules/community/actions';
import { togglePostBookmarkAction } from '@/modules/community/actions';
import { useCurrentUser } from '@/hooks/use-current-user';
import type { FeedPost } from '@/modules/community/types';

type UsePostCardOptions = {
  post: FeedPost;
  onOpenComments: (postId: string) => void;
};

export function usePostCard({ post, onOpenComments }: UsePostCardOptions) {
  const t = useTranslations('PostCard');
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { user, isLoading: isAuthLoading } = useCurrentUser();

  // ── Like state ────────────────────────────────────────────────────────
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const likeInFlight = useRef(false);

  const handleLike = async () => {
    if (isAuthLoading || likeInFlight.current) return;

    if (!user) {
      const redirectTarget = pathname + window.location.search;
      router.push(
        `/${locale}/login?redirect=${encodeURIComponent(redirectTarget)}`
      );
      return;
    }

    const prevLiked = isLiked;
    const prevCount = likeCount;

    likeInFlight.current = true;
    setIsLiked(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);

    const result = await togglePostLikeAction({ post_id: post.post_id });

    likeInFlight.current = false;

    if (!result.success) {
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
      toast.error(t('likeError'));
    }
  };

  // ── Bookmark state ────────────────────────────────────────────────────
  const [isBookmarked, setIsBookmarked] = useState(post.is_bookmarked);
  const bookmarkInFlight = useRef(false);

  const handleBookmark = async () => {
    if (isAuthLoading || bookmarkInFlight.current) return;

    if (!user) {
      const redirectTarget = pathname + window.location.search;
      router.push(
        `/${locale}/login?redirect=${encodeURIComponent(redirectTarget)}`
      );
      return;
    }

    const prevBookmarked = isBookmarked;

    bookmarkInFlight.current = true;
    setIsBookmarked(!prevBookmarked);

    const result = await togglePostBookmarkAction({ post_id: post.post_id });

    bookmarkInFlight.current = false;

    if (!result.success) {
      setIsBookmarked(prevBookmarked);
      toast.error(t('bookmarkError'));
    } else {
      toast.success(prevBookmarked ? t('bookmarkRemoved') : t('bookmarkAdded'));
    }
  };

  // ── Share ─────────────────────────────────────────────────────────────
  const handleShare = async () => {
    const url = `${window.location.origin}/community/${post.post_id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('shareCopied'));
    } catch {
      toast.error(t('shareError'));
    }
  };

  // ── Open comments ─────────────────────────────────────────────────────
  const handleOpenComments = () => {
    onOpenComments(post.post_id);
  };

  return {
    isLiked,
    likeCount,
    handleLike,
    isBookmarked,
    handleBookmark,
    handleShare,
    handleOpenComments,
    locale,
  };
}
