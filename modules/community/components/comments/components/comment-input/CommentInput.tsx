'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CommentInputProps } from '../../types';

export function CommentInput({
  onSubmit,
  replyingTo,
  onCancelReply,
  isSubmitting,
}: CommentInputProps) {
  const t = useTranslations('PostDetail');
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const maxLength = 2000;
  const isOverLimit = content.length > maxLength;
  const isValid = content.trim().length > 0 && !isOverLimit;

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.overflowY = 'hidden'; // hide BEFORE measuring for accurate scrollHeight
      const scrollH = textarea.scrollHeight;
      const newHeight = Math.min(scrollH, 120);
      textarea.style.height = `${newHeight}px`;
      // Show scrollbar only when content exceeds max height (multi-line cap)
      textarea.style.overflowY = scrollH > 120 ? 'auto' : 'hidden';
    }
  }, [content]);

  // Focus on reply
  useEffect(() => {
    if (replyingTo) {
      textareaRef.current?.focus();
    }
  }, [replyingTo]);

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;
    await onSubmit(content.trim(), replyingTo?.commentId);
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-background sticky bottom-0 border-t p-4">
      <div className="mx-auto max-w-2xl space-y-3">
        {replyingTo && (
          <div className="bg-muted flex items-center justify-between rounded-lg px-3 py-1.5">
            <span className="text-muted-foreground text-xs">
              {t('comments.replyingTo', { name: replyingTo.authorName })}
            </span>
            <button
              onClick={onCancelReply}
              className="hover:bg-background/50 rounded-full p-0.5 transition-colors"
              aria-label={t('commentActions.cancel')}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        <div className="relative flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              dir="auto"
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                replyingTo
                  ? t('commentInput.replyPlaceholder')
                  : t('commentInput.placeholder')
              }
              style={{ overflowY: 'hidden' }}
              className={cn(
                'bg-muted focus:border-primary focus:bg-background focus:ring-primary w-full resize-none rounded-xl border px-4 py-2.5 text-sm transition-all focus:ring-1 focus:outline-none disabled:opacity-50',
                isOverLimit && 'border-destructive focus:ring-destructive'
              )}
              rows={1}
              disabled={isSubmitting}
            />
            {content.length > maxLength - 100 && (
              <span
                className={cn(
                  'absolute end-3 bottom-1 text-[10px]',
                  isOverLimit ? 'text-destructive' : 'text-muted-foreground'
                )}
              >
                {t('commentInput.charCount', {
                  current: content.length,
                  max: maxLength,
                })}
              </span>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 mb-1 rounded-full p-2.5 shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:active:scale-100"
            aria-label={t('commentInput.send')}
          >
            <Send className={cn('h-4 w-4', isSubmitting && 'animate-pulse')} />
          </button>
        </div>
      </div>
    </div>
  );
}
