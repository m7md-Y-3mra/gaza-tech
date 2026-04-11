'use client';

import { useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { togglePostLikeAction } from '@/modules/community/actions';
import { togglePostBookmarkAction } from '@/modules/community/actions';
import { useCurrentUser } from '@/hooks/use-current-user';
import { usePostUpdate } from '@/modules/community/components/post-detail-context';
import type { FeedPost } from '@/modules/community/types';

type UsePostCardOptions = {
  post: FeedPost;
};

export function usePostCard({ post }: UsePostCardOptions) {
  const t = useTranslations('PostCard');
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { user, isLoading: isAuthLoading } = useCurrentUser();

  // ── Context Sync ──────────────────────────────────────────────────────
  const postUpdate = usePostUpdate(post.post_id);

  // ── Like state ────────────────────────────────────────────────────────
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const likeInFlight = useRef(false);

  const effectiveLiked = postUpdate?.is_liked ?? isLiked;
  const effectiveLikeCount = postUpdate?.like_count ?? likeCount;

  const handleLike = async () => {
    if (isAuthLoading || likeInFlight.current) return;

    if (!user) {
      const redirectTarget = pathname + window.location.search;
      router.push(
        `/${locale}/login?redirect=${encodeURIComponent(redirectTarget)}`
      );
      return;
    }

    const prevLiked = effectiveLiked;
    const prevCount = effectiveLikeCount;

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

  const effectiveBookmarked = postUpdate?.is_bookmarked ?? isBookmarked;

  const handleBookmark = async () => {
    if (isAuthLoading || bookmarkInFlight.current) return;

    if (!user) {
      const redirectTarget = pathname + window.location.search;
      router.push(
        `/${locale}/login?redirect=${encodeURIComponent(redirectTarget)}`
      );
      return;
    }

    const prevBookmarked = effectiveBookmarked;

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
    const url = `${window.location.origin}/${locale}/community/${post.post_id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('shareCopied'));
    } catch {
      toast.error(t('shareError'));
    }
  };

  const effectiveCommentCount = postUpdate?.comment_count ?? post.comment_count;

  return {
    isLiked: effectiveLiked,
    likeCount: effectiveLikeCount,
    handleLike,
    isBookmarked: effectiveBookmarked,
    handleBookmark,
    handleShare,
    locale,
    commentCount: effectiveCommentCount,
  };
}
