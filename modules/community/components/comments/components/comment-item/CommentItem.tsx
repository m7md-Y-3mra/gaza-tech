'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { Heart, Pencil, Trash2, Reply } from 'lucide-react';
import { ReportButton } from '@/modules/reports/components';

import { cn } from '@/lib/utils';
import {
  AVATAR_PALETTE,
  getAvatarColorIndex,
} from '@/modules/community/components/post-card/constants';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { CommentItemProps } from '../../types';

export function CommentItem({
  comment,
  isReply = false,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onToggleLike,
  isEditing,
  onStartEdit,
  onCancelEdit,
}: CommentItemProps) {
  const t = useTranslations('PostDetail');
  const locale = useLocale();
  const dateLocale = locale === 'ar' ? ar : enUS;

  const [editContent, setEditContent] = useState(comment.content);
  const isOwnComment = currentUserId === comment.author.id;
  const authorName = comment.author.name || t('comments.deletedComment');

  const avatarColor = AVATAR_PALETTE[getAvatarColorIndex(authorName)];
  const relativeTime = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: dateLocale,
  });

  const handleSaveEdit = async () => {
    if (editContent.trim() === '' || editContent.trim() === comment.content) {
      onCancelEdit();
      return;
    }
    await onEdit(comment.comment_id, editContent.trim());
  };

  return (
    <div className={cn('flex gap-3 transition-colors', isReply && 'ms-10')}>
      {/* Avatar */}
      <div className="shrink-0">
        {comment.author.avatar_url ? (
          <div className="relative h-8 w-8 overflow-hidden rounded-full border">
            <Image
              src={comment.author.avatar_url}
              alt={authorName}
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
        ) : (
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-medium text-white',
              avatarColor
            )}
          >
            {authorName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            dir="auto"
            className="text-foreground truncate text-xs font-semibold"
          >
            {authorName}
          </span>
          <span className="text-muted-foreground text-[10px] whitespace-nowrap">
            {relativeTime}
          </span>
          {comment.is_edited && (
            <span className="text-muted-foreground text-[10px] italic">
              {t('comments.edited')}
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="mt-2 space-y-2">
            <textarea
              dir="auto"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="bg-muted focus:ring-primary w-full resize-none rounded-lg border p-2 text-sm focus:ring-1 focus:outline-none"
              rows={3}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={onCancelEdit}
                className="hover:bg-muted rounded-md px-3 py-1 text-xs transition-colors"
              >
                {t('commentActions.cancel')}
              </button>
              <button
                onClick={handleSaveEdit}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1 text-xs transition-colors"
              >
                {t('commentActions.save')}
              </button>
            </div>
          </div>
        ) : (
          <p
            dir="auto"
            className="text-foreground mt-1 text-sm leading-normal break-words whitespace-pre-wrap"
          >
            {comment.content}
          </p>
        )}

        {/* Actions */}
        {!isEditing && (
          <div className="mt-1.5 flex items-center gap-3">
            <button
              onClick={() => onToggleLike(comment.comment_id)}
              className={cn(
                'flex items-center gap-1 text-[11px] transition-colors hover:text-red-500',
                comment.is_liked ? 'text-red-500' : 'text-muted-foreground'
              )}
              aria-label={
                comment.is_liked
                  ? t('commentActions.unlike')
                  : t('commentActions.like')
              }
              aria-pressed={comment.is_liked}
            >
              <Heart
                className={cn(
                  'h-3.5 w-3.5',
                  comment.is_liked && 'fill-current'
                )}
              />
              <span>{comment.like_count > 0 && comment.like_count}</span>
            </button>

            {onReply && (
              <button
                onClick={() => onReply(comment.comment_id, authorName)}
                className="text-muted-foreground hover:text-primary flex items-center gap-1 text-[11px] transition-colors"
              >
                <Reply className="h-3.5 w-3.5" />
                <span>{t('commentActions.reply')}</span>
              </button>
            )}

            {!isOwnComment && (
              <ReportButton
                contentType="comment"
                contentId={comment.comment_id}
                contentOwnerId={comment.author.id || ''}
                size="sm"
                className="h-auto w-auto p-0"
              />
            )}

            {isOwnComment && (
              <div className="ms-auto flex items-center gap-2">
                <button
                  onClick={() => onStartEdit(comment.comment_id)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={t('commentActions.edit')}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={t('commentActions.delete')}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-lg sm:max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t('deleteConfirm.title')}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('deleteConfirm.message')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        {t('deleteConfirm.cancel')}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => onDelete(comment.comment_id)}
                      >
                        {t('deleteConfirm.confirm')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
