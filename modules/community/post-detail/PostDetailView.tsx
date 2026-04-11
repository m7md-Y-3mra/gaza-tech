'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { PostDetailHeader } from '@/modules/community/components/post-detail-modal/components/post-detail-header/PostDetailHeader';
import { PostDetailContent } from '@/modules/community/components/post-detail-modal/components/post-detail-content/PostDetailContent';
import { PostDetailActions } from '@/modules/community/components/post-detail-modal/components/post-detail-actions/PostDetailActions';
import { CommentSection } from '@/modules/community/components/comments';
import type { FeedPost } from '@/modules/community/types';

export function PostDetailView({ post }: { post: FeedPost }) {
  const t = useTranslations('PostDetail');
  const locale = useLocale();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <Link
        href={`/${locale}/community`}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('fullPage.backToFeed')}
      </Link>
      <article className="border-border bg-card space-y-6 rounded-xl border p-6 shadow-sm">
        <div className="space-y-4">
          <PostDetailHeader post={post} />
          <h1 dir="auto" className="text-2xl font-bold tracking-tight">
            {post.title}
          </h1>
          <PostDetailContent
            content={post.content}
            attachments={post.attachments}
          />
          <PostDetailActions post={post} />
        </div>

        <CommentSection
          postId={post.post_id}
          commentCount={post.comment_count}
        />
      </article>
    </div>
  );
}
