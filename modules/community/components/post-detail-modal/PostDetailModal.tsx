'use client';

import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PostDetailHeader } from './components/post-detail-header/PostDetailHeader';
import { PostDetailContent } from './components/post-detail-content/PostDetailContent';
import { PostDetailActions } from './components/post-detail-actions/PostDetailActions';
import { CommentSection } from '@/modules/community/components/comments';
import type { FeedPost } from '@/modules/community/types';
import { ApiResponseError, ApiResponseSuccess } from '@/utils/error-handler';
import { use } from 'react';

type PostDetailModalProps = {
  data: Promise<ApiResponseError | ApiResponseSuccess<FeedPost>>;
};

export function PostDetailModal({ data }: PostDetailModalProps) {
  const router = useRouter();
  const result = use(data);

  if (!result.success || !result.data) {
    return null;
  }

  const post = result.data;
  return (
    <Dialog open={true} onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 px-4 pt-4 pb-0">
          <DialogTitle className="sr-only">{post.title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 space-y-4 overflow-y-auto px-4 pt-4 pb-4">
          <PostDetailHeader post={post} />
          <h2 dir="auto" className="text-lg font-semibold">
            {post.title}
          </h2>
          <PostDetailContent
            content={post.content}
            attachments={post.attachments}
          />
          <PostDetailActions post={post} />
          <CommentSection
            postId={post.post_id}
            commentCount={post.comment_count}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
