'use client';

import { useTranslations } from 'next-intl';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useCommentSection } from './hooks/useCommentSection';
import { CommentInput } from './components/comment-input';
import { CommentList } from './components/comment-list';
import { CommentSkeleton } from './components/comment-skeleton';
import type { CommentSectionProps } from './types';

export function CommentSection({ postId, commentCount }: CommentSectionProps) {
  const t = useTranslations('PostDetail');
  const { user } = useCurrentUser();
  const {
    comments,
    isLoading,
    isSubmitting,
    addComment,
    loadMore,
    hasMore,
    editComment,
    deleteComment,
    toggleCommentLike,
    replyingTo,
    setReplyingTo,
    cancelReply,
    editingCommentId,
    startEdit,
    cancelEdit,
  } = useCommentSection(postId, commentCount);

  return (
    <div className="mt-4 flex flex-col border-t">
      <div className="flex-1 space-y-6 px-4 py-4">
        <h3 className="text-base font-semibold">
          {t('comments.titleWithCount', { count: commentCount })}
        </h3>

        {isLoading && comments.length === 0 ? (
          <CommentSkeleton />
        ) : comments.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center text-sm italic">
            {t('comments.empty')}
          </p>
        ) : (
          <CommentList
            comments={comments}
            currentUserId={user?.id ?? null}
            onReply={setReplyingTo}
            onEdit={editComment}
            onDelete={deleteComment}
            onToggleLike={toggleCommentLike}
            editingCommentId={editingCommentId}
            onStartEdit={startEdit}
            onCancelEdit={cancelEdit}
            hasMore={hasMore}
            isLoading={isLoading}
            onLoadMore={loadMore}
          />
        )}
      </div>

      {user ? (
        <CommentInput
          postId={postId}
          onSubmit={addComment}
          replyingTo={replyingTo}
          onCancelReply={cancelReply}
          isSubmitting={isSubmitting}
        />
      ) : (
        <div className="bg-muted/20 sticky bottom-0 border-t p-4 text-center">
          <p className="text-muted-foreground text-xs">
            {t('comments.loginToComment')}
          </p>
        </div>
      )}
    </div>
  );
}
