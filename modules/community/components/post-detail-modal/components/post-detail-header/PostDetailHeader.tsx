'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { formatDistanceToNow, format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

import { cn } from '@/lib/utils';
import type { FeedPost, PostCategory } from '@/modules/community/types';
import {
  CATEGORY_COLOR_MAP,
  AVATAR_PALETTE,
  getAvatarColorIndex,
} from '@/modules/community/components/post-card/constants';

type PostDetailHeaderProps = {
  post: FeedPost;
};

export function PostDetailHeader({ post }: PostDetailHeaderProps) {
  const t = useTranslations('PostCard');
  const locale = useLocale();
  const dateLocale = locale === 'ar' ? ar : enUS;

  const publishedAt = new Date(post.published_at);
  const timeAgo = formatDistanceToNow(publishedAt, {
    addSuffix: true,
    locale: dateLocale,
  });
  const fullDate = format(publishedAt, 'PPP p', { locale: dateLocale });

  const categoryColors =
    CATEGORY_COLOR_MAP[post.post_category as PostCategory] ||
    CATEGORY_COLOR_MAP.questions;
  const avatarColor = AVATAR_PALETTE[getAvatarColorIndex(post.author.name)];

  const authorName = post.author.name || t('deletedUser');
  const isDeletedUser = !post.author.id;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isDeletedUser ? (
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white',
                avatarColor
              )}
            >
              {authorName.charAt(0).toUpperCase()}
            </div>
          ) : (
            <Link
              href={`/${locale}/profile/${post.author.id}`}
              className="shrink-0 transition-opacity hover:opacity-80"
            >
              {post.author.avatar_url ? (
                <div className="relative h-10 w-10 overflow-hidden rounded-full border">
                  <Image
                    src={post.author.avatar_url}
                    alt={authorName}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
              ) : (
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium text-white',
                    avatarColor
                  )}
                >
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
          )}

          <div className="flex flex-col">
            {isDeletedUser ? (
              <span
                dir="auto"
                className="text-foreground text-sm font-semibold"
              >
                {authorName}
              </span>
            ) : (
              <Link
                dir="auto"
                href={`/${locale}/profile/${post.author.id}`}
                className="text-foreground hover:text-primary text-sm font-semibold transition-colors"
              >
                {authorName}
              </Link>
            )}
            <time
              dateTime={post.published_at}
              title={fullDate}
              className="text-muted-foreground text-xs"
            >
              {timeAgo}
            </time>
          </div>
        </div>

        <span
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-medium',
            categoryColors.bg,
            categoryColors.text
          )}
        >
          {t(`categories.${post.post_category}`)}
        </span>
      </div>
    </div>
  );
}
