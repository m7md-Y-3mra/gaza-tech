import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  getPostCommentsAction,
  addCommentAction,
  editOwnCommentAction,
  deleteOwnCommentAction,
  toggleCommentLikeAction,
} from '@/modules/community/actions';
import { usePostDetailContext } from '@/modules/community/components/post-detail-context';
import type { TopLevelComment, CommentNode } from '@/modules/community/types';
import type { CommentSectionState } from '../types';

const COMMENTS_PER_PAGE = 20;

export function useCommentSection(postId: string, initialCommentCount: number) {
  const t = useTranslations('PostDetail');
  const { updatePost } = usePostDetailContext();

  const [state, setState] = useState<CommentSectionState>({
    comments: [],
    hasMore: true,
    currentPage: 1,
    isLoading: true,
    replyingTo: null,
    editingCommentId: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentCountRef = useRef(initialCommentCount);

  // ── Load comments ─────────────────────────────────────────────
  const loadComments = useCallback(
    async (page: number) => {
      setState((prev) => ({ ...prev, isLoading: true }));

      const result = await getPostCommentsAction({
        post_id: postId,
        page,
        limit: COMMENTS_PER_PAGE,
      });

      if (result.success && result.data) {
        setState((prev) => ({
          ...prev,
          comments:
            page === 1
              ? result.data.data
              : [...prev.comments, ...result.data.data],
          hasMore: result.data.has_more,
          currentPage: page,
          isLoading: false,
        }));
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
        toast.error(t('errors.loadFailed'));
      }
    },
    [postId, t]
  );

  // Initial load
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadComments(1);
  }, [loadComments]);

  const loadMore = useCallback(() => {
    loadComments(state.currentPage + 1);
  }, [loadComments, state.currentPage]);

  // ── Add comment ───────────────────────────────────────────────
  const addComment = useCallback(
    async (content: string, parentCommentId?: string) => {
      setIsSubmitting(true);

      const result = await addCommentAction({
        post_id: postId,
        content,
        parent_comment_id: parentCommentId,
      });

      setIsSubmitting(false);

      if (result.success && result.data) {
        const newComment = result.data as CommentNode;

        if (parentCommentId) {
          // Add as reply to parent
          setState((prev) => ({
            ...prev,
            comments: prev.comments.map((c) =>
              c.comment_id === parentCommentId
                ? {
                    ...c,
                    replies: [...c.replies, newComment],
                    replies_count: c.replies_count + 1,
                  }
                : c
            ),
            replyingTo: null,
          }));
        } else {
          // Add as top-level comment
          const topLevel: TopLevelComment = {
            ...newComment,
            replies: [],
            replies_count: 0,
            has_more_replies: false,
          };
          setState((prev) => ({
            ...prev,
            comments: [...prev.comments, topLevel],
          }));
        }

        commentCountRef.current += 1;
        updatePost({ post_id: postId, comment_count: commentCountRef.current });
      } else {
        toast.error(t('errors.addFailed'));
      }
    },
    [postId, t, updatePost]
  );

  // ── Edit comment ──────────────────────────────────────────────
  const editComment = useCallback(
    async (commentId: string, content: string) => {
      // Optimistic update
      setState((prev) => ({
        ...prev,
        comments: prev.comments.map((c) => {
          if (c.comment_id === commentId)
            return { ...c, content, is_edited: true };
          return {
            ...c,
            replies: c.replies.map((r) =>
              r.comment_id === commentId
                ? { ...r, content, is_edited: true }
                : r
            ),
          };
        }),
        editingCommentId: null,
      }));

      const result = await editOwnCommentAction({
        comment_id: commentId,
        content,
      });

      if (!result.success) {
        toast.error(t('errors.editFailed'));
        // Reload to revert
        loadComments(1);
      }
    },
    [t, loadComments]
  );

  // ── Delete comment ────────────────────────────────────────────
  const deleteComment = useCallback(
    async (commentId: string) => {
      // Find comment to calculate count decrease
      let countDecrease = 1;
      const targetComment = state.comments.find(
        (c) => c.comment_id === commentId
      );
      if (targetComment) {
        countDecrease += targetComment.replies.length; // cascade
      } else {
        // It might be a reply
        for (const parent of state.comments) {
          if (parent.replies.some((r) => r.comment_id === commentId)) {
            countDecrease = 1;
            break;
          }
        }
      }

      // Optimistic remove
      setState((prev) => ({
        ...prev,
        comments: prev.comments
          .filter((c) => c.comment_id !== commentId)
          .map((c) => ({
            ...c,
            replies: c.replies.filter((r) => r.comment_id !== commentId),
            replies_count: c.replies.some((r) => r.comment_id === commentId)
              ? c.replies_count - 1
              : c.replies_count,
          })),
      }));

      const result = await deleteOwnCommentAction({ comment_id: commentId });

      if (result.success) {
        commentCountRef.current -= countDecrease;
        updatePost({ post_id: postId, comment_count: commentCountRef.current });
      } else {
        toast.error(t('errors.deleteFailed'));
        loadComments(1);
      }
    },
    [state.comments, postId, t, updatePost, loadComments]
  );

  // ── Toggle comment like ───────────────────────────────────────
  const likeInFlight = useRef<Set<string>>(new Set());

  const toggleCommentLike = useCallback(
    async (commentId: string) => {
      // Prevent rapid clicks on the same comment
      if (likeInFlight.current.has(commentId)) return;
      likeInFlight.current.add(commentId);

      // Optimistic toggle
      setState((prev) => ({
        ...prev,
        comments: prev.comments.map((c) => {
          if (c.comment_id === commentId) {
            return {
              ...c,
              is_liked: !c.is_liked,
              like_count: c.is_liked ? c.like_count - 1 : c.like_count + 1,
            };
          }
          return {
            ...c,
            replies: c.replies.map((r) =>
              r.comment_id === commentId
                ? {
                    ...r,
                    is_liked: !r.is_liked,
                    like_count: r.is_liked
                      ? r.like_count - 1
                      : r.like_count + 1,
                  }
                : r
            ),
          };
        }),
      }));

      const result = await toggleCommentLikeAction({ comment_id: commentId });

      likeInFlight.current.delete(commentId);

      if (!result.success) {
        toast.error(t('errors.likeFailed'));
        loadComments(1);
      }
    },
    [t, loadComments]
  );

  // ── Reply/edit management ─────────────────────────────────────
  const setReplyingTo = useCallback((commentId: string, authorName: string) => {
    setState((prev) => ({
      ...prev,
      replyingTo: { commentId, authorName },
      editingCommentId: null,
    }));
  }, []);

  const cancelReply = useCallback(() => {
    setState((prev) => ({ ...prev, replyingTo: null }));
  }, []);

  const startEdit = useCallback((commentId: string) => {
    setState((prev) => ({
      ...prev,
      editingCommentId: commentId,
      replyingTo: null,
    }));
  }, []);

  const cancelEdit = useCallback(() => {
    setState((prev) => ({ ...prev, editingCommentId: null }));
  }, []);

  return {
    ...state,
    isSubmitting,
    loadMore,
    addComment,
    editComment,
    deleteComment,
    toggleCommentLike,
    setReplyingTo,
    cancelReply,
    startEdit,
    cancelEdit,
  };
}
