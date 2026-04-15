'use client';

import { useOptimistic, useState, useTransition } from 'react';
import { PostCard } from '@/modules/community/components/post-card';
import ProfilePagination from '../../profile-pagination';
import { FileText, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { toast } from 'sonner';
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
import { deleteCommunityPostAction } from '@/modules/community/actions';
import { useProfilePagination } from '../../profile-pagination/hooks/useProfilePagination';
import type { ProfilePostsTabClientProps } from './types';
import type { FeedPost } from '@/modules/community/types';

export const ProfilePostsTabClient = ({
  posts,
  postsCount,
  pageSize,
  isOwner,
}: ProfilePostsTabClientProps) => {
  const t = useTranslations('Profile.PostsTab');
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { page, handlePageChange } = useProfilePagination(postsCount, pageSize);
  const currentPage = page ?? 1;

  const [optimisticPosts, removeOptimisticPost] = useOptimistic(
    posts,
    (state: FeedPost[], postId: string) =>
      state.filter((post) => post.post_id !== postId)
  );

  const handleDelete = (postId: string) => {
    setDeletingId(postId);
    startTransition(async () => {
      removeOptimisticPost(postId);
      const result = await deleteCommunityPostAction({ post_id: postId });

      if (!result.success) {
        toast.error(result.message || t('deleteError'));
      } else {
        toast.success(t('deleteSuccess'));
        // FR-020: if this delete left the current page empty AND page > 1, step back one page.
        const remainingOnPage = optimisticPosts.length - 1;
        if (remainingOnPage <= 0 && currentPage > 1) {
          handlePageChange(currentPage - 1);
        }
      }
      setDeletingId(null);
    });
  };

  if (optimisticPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 py-20 text-center">
        <FileText className="text-muted-foreground mb-4 size-12 opacity-50" />
        <p className="text-muted-foreground font-medium">{t('emptyTitle')}</p>
        <p className="text-muted-foreground mb-6 text-sm">
          {t('emptyDescription')}
        </p>
        {isOwner && (
          <Link
            href="/community/create"
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow transition-colors focus-visible:ring-1 focus-visible:outline-none"
          >
            {t('createFirstPost')}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 sm:px-0">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        {optimisticPosts.map((post) => (
          <div key={post.post_id} className="relative">
            <PostCard post={post} />
            {isOwner && (
              <div className="absolute end-4 top-4 flex gap-2">
                <Link
                  href={`/community/${post.post_id}/edit`}
                  aria-label={t('edit')}
                  className="bg-card/80 text-muted-foreground hover:text-primary hover:border-primary/20 rounded-full border border-transparent p-1.5 shadow-sm backdrop-blur-sm transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Pencil className="size-4" />
                </Link>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      disabled={isPending && deletingId === post.post_id}
                      className="bg-card/80 text-muted-foreground hover:text-destructive hover:border-destructive/20 rounded-full border border-transparent p-1.5 shadow-sm backdrop-blur-sm transition-colors disabled:opacity-50"
                      aria-label={t('delete')}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t('deleteConfirmTitle')}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('deleteConfirmMessage')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('deleteCancel')}</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() => handleDelete(post.post_id)}
                      >
                        {t('deleteConfirmAction')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        ))}
      </div>
      {postsCount > pageSize && (
        <div className="mt-8">
          <ProfilePagination totalCount={postsCount} pageSize={pageSize} />
        </div>
      )}
    </div>
  );
};
