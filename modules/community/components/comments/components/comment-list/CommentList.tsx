'use client';

import { useTranslations } from 'next-intl';
import { CommentItem } from '../comment-item';
import type { CommentListProps } from '../../types';

export function CommentList({
  comments,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onToggleLike,
  editingCommentId,
  onStartEdit,
  onCancelEdit,
  hasMore,
  isLoading,
  onLoadMore,
}: CommentListProps) {
  const t = useTranslations('PostDetail');

  return (
    <div className="space-y-6">
      {hasMore && (
        <div className="flex justify-center border-b pb-4">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="text-primary text-sm font-medium transition-all hover:underline disabled:opacity-50"
          >
            {isLoading ? '...' : t('comments.loadMore')}
          </button>
        </div>
      )}

      <div className="space-y-8">
        {comments.map((comment) => (
          <div key={comment.comment_id} className="space-y-6">
            <CommentItem
              comment={comment}
              isReply={false}
              currentUserId={currentUserId}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleLike={onToggleLike}
              isEditing={editingCommentId === comment.comment_id}
              onStartEdit={onStartEdit}
              onCancelEdit={onCancelEdit}
            />

            {comment.replies && comment.replies.length > 0 && (
              <div className="space-y-6">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.comment_id}
                    comment={reply}
                    isReply={true}
                    currentUserId={currentUserId}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleLike={onToggleLike}
                    isEditing={editingCommentId === reply.comment_id}
                    onStartEdit={onStartEdit}
                    onCancelEdit={onCancelEdit}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
