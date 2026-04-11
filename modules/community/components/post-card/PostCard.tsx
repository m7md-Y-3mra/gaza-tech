'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';
import { enUS, ar as arLocale } from 'date-fns/locale';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Paperclip,
} from 'lucide-react';
import {
  CATEGORY_COLOR_MAP,
  AVATAR_PALETTE,
  getAvatarColorIndex,
} from './constants';
import { usePostCard } from './hooks/usePostCard';
import type { PostCardProps } from './types';
import type { PostCategory } from '@/modules/community/types';

export function PostCard({ post }: PostCardProps) {
  const t = useTranslations('PostCard');
  const {
    isLiked,
    likeCount,
    handleLike,
    isBookmarked,
    handleBookmark,
    handleShare,
    locale,
    commentCount,
  } = usePostCard({ post });

  const author = post.author;
  const isDeletedAuthor = author.id === null;
  const displayName = isDeletedAuthor ? t('deletedUser') : author.name;

  // ── Avatar ────────────────────────────────────────────────────────────
  const avatarColorIndex = getAvatarColorIndex(displayName);
  const avatarBg = AVATAR_PALETTE[avatarColorIndex];
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  // ── Time display ──────────────────────────────────────────────────────
  const publishedDate = new Date(post.published_at);
  const dateFnsLocale = locale === 'ar' ? arLocale : enUS;
  const isRecent = differenceInDays(new Date(), publishedDate) < 7;
  const timeDisplay = isRecent
    ? formatDistanceToNow(publishedDate, {
        addSuffix: true,
        locale: dateFnsLocale,
      })
    : format(publishedDate, locale === 'ar' ? 'd MMMM yyyy' : 'MMM d, yyyy', {
        locale: dateFnsLocale,
      });

  // ── Category badge ────────────────────────────────────────────────────
  const categoryKey = post.post_category as PostCategory;
  const categoryColors = CATEGORY_COLOR_MAP[categoryKey];
  const categoryLabel = t(
    `categories.${categoryKey}` as Parameters<typeof t>[0]
  );

  // ── Compact number format ─────────────────────────────────────────────
  const formatCount = (n: number) =>
    new Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(n);

  // ── Content preview (collapse newlines) ──────────────────────────────
  const contentPreview = post.content.replace(/\n+/g, ' ');

  // ── Author element (link or static) ──────────────────────────────────
  const authorAvatarEl = (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${avatarBg} overflow-hidden`}
      aria-hidden="true"
    >
      {author.avatar_url ? (
        <Image
          src={author.avatar_url}
          alt={displayName}
          width={40}
          height={40}
          className="h-full w-full object-cover"
        />
      ) : (
        initials
      )}
    </span>
  );

  const authorHeader = isDeletedAuthor ? (
    <div className="flex min-w-0 items-center gap-3">
      {authorAvatarEl}
      <div className="min-w-0">
        <p
          dir="auto"
          className="text-foreground truncate text-sm font-semibold"
        >
          {displayName}
        </p>
        <p className="text-muted-foreground text-xs">{timeDisplay}</p>
      </div>
    </div>
  ) : (
    <Link
      href={`/profile/${author.id}`}
      className="group focus-visible:ring-ring flex min-w-0 items-center gap-3 rounded-sm focus:outline-none focus-visible:ring-2"
      aria-label={t('viewProfile', { name: displayName })}
    >
      {authorAvatarEl}
      <div className="min-w-0">
        <p
          dir="auto"
          className="text-foreground truncate text-sm font-semibold group-hover:underline"
        >
          {displayName}
        </p>
        <p className="text-muted-foreground text-xs">{timeDisplay}</p>
      </div>
    </Link>
  );

  return (
    <article className="border-border bg-card space-y-3 rounded-xl border p-4">
      {/* Author header + category badge */}
      <div className="flex items-start justify-between gap-3">
        {authorHeader}
        {categoryColors && (
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors.bg} ${categoryColors.text}`}
          >
            {categoryLabel}
          </span>
        )}
      </div>

      {/* Title — Link to post detail */}
      <h3 className="text-base leading-snug font-semibold">
        <Link
          dir="auto"
          href={`/community/${post.post_id}`}
          className="focus-visible:ring-ring line-clamp-1 w-full rounded-sm text-start hover:underline focus:outline-none focus-visible:ring-2"
        >
          {post.title}
        </Link>
      </h3>

      {/* Content preview — Link to post detail */}
      <Link
        dir="auto"
        href={`/${locale}/community/${post.post_id}`}
        className={`text-muted-foreground focus-visible:ring-ring w-full rounded-sm text-start text-sm focus:outline-none focus-visible:ring-2 ${post.content ? 'line-clamp-2' : 'min-h-[2lh]'}`}
      >
        {contentPreview || <span className="invisible">placeholder</span>}
      </Link>

      {/* Attachment indicator */}
      {post.attachments.length > 0 && (
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Paperclip className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{t('attachments', { count: post.attachments.length })}</span>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-1 pt-0.5">
        {/* Like button */}
        <button
          type="button"
          onClick={handleLike}
          className="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2"
          aria-label={isLiked ? t('unlike') : t('like')}
          aria-pressed={isLiked}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
            aria-hidden="true"
          />
          <span>{formatCount(likeCount)}</span>
        </button>

        {/* Comment button — Link to post detail */}
        <Link
          href={`/${locale}/community/${post.post_id}`}
          className="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2"
          aria-label={t('openCommentsFor', { title: post.title })}
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          <span>{formatCount(commentCount)}</span>
        </Link>

        <div className="ms-auto flex items-center gap-1">
          {/* Share button */}
          <button
            type="button"
            onClick={handleShare}
            className="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring rounded-md p-1.5 transition-colors focus:outline-none focus-visible:ring-2"
            aria-label={t('share')}
          >
            <Share2 className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Bookmark button */}
          <button
            type="button"
            onClick={handleBookmark}
            className="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring rounded-md p-1.5 transition-colors focus:outline-none focus-visible:ring-2"
            aria-label={isBookmarked ? t('unbookmark') : t('bookmark')}
            aria-pressed={isBookmarked}
          >
            <Bookmark
              className={`h-4 w-4 transition-colors ${isBookmarked ? 'text-foreground fill-current' : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </article>
  );
}
