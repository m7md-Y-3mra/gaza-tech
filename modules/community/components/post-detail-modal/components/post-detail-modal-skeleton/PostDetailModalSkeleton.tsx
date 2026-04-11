'use client';

import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PostDetailSkeleton } from '../post-detail-skeleton/PostDetailSkeleton';
import { CommentSkeleton } from '@/modules/community/components/comments/components/comment-skeleton/CommentSkeleton';

export function PostDetailModalSkeleton() {
  const router = useRouter();

  return (
    <Dialog open={true} onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 px-4 pt-4 pb-0">
          <DialogTitle className="sr-only">Loading…</DialogTitle>
        </DialogHeader>
        <div className="flex-1 space-y-6 overflow-y-auto px-4 pt-4 pb-4">
          <PostDetailSkeleton />
          <div className="border-border border-t pt-4">
            <CommentSkeleton />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
