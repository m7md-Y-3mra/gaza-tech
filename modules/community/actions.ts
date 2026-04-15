'use server';

import { errorHandler } from '@/utils/error-handler';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  createCommunityPostQuery,
  updateCommunityPostQuery,
  getCommunityPostDetailsQuery,
  getCommunityFeedQuery,
  togglePostLikeQuery,
  togglePostBookmarkQuery,
  getCommunityPostDetailQuery,
  getPostCommentsQuery,
  getCommentRepliesQuery,
  addCommentQuery,
  editOwnCommentQuery,
  deleteOwnCommentQuery,
  deleteCommunityPostQuery,
  getUserCommunityPostsQuery,
  toggleCommentLikeQuery,
} from './queries';
import type {
  GetCommunityFeedInput,
  GetPostCommentsInput,
  GetCommentRepliesInput,
  AddCommentInput,
  EditOwnCommentInput,
  DeleteOwnCommentInput,
  DeleteCommunityPostInput,
  GetUserCommunityPostsInput,
} from './queries';

async function resolvePostAuthorId(post_id: string): Promise<string> {
  const client = await createClient();
  const { data } = await client
    .from('community_posts')
    .select('author_id')
    .eq('post_id', post_id)
    .single();
  return data?.author_id ?? '';
}

/**
 * Create a new community post
 * Server action wrapped with error handler
 * Revalidates community path after creation
 */
export const createCommunityPostAction = errorHandler(
  async (
    data: Parameters<typeof createCommunityPostQuery>[0]
  ): Promise<ReturnType<typeof createCommunityPostQuery>> => {
    const result = await createCommunityPostQuery(data);

    revalidatePath('/community');
    return result;
  }
);

/**
 * Update an existing community post
 * Server action wrapped with error handler
 * Revalidates community paths after update
 */
export const updateCommunityPostAction = errorHandler(
  async (
    postId: string,
    data: Parameters<typeof updateCommunityPostQuery>[1]
  ): Promise<void> => {
    await updateCommunityPostQuery(postId, data);

    revalidatePath('/community');
    revalidatePath(`/community/${postId}`);
  }
);

/**
 * Get community post details
 * Server action wrapped with error handler
 */
export const getCommunityPostDetailsAction = errorHandler(
  getCommunityPostDetailsQuery
);

// ── US1: Browse Community Feed ────────────────────────────────────────

export const getCommunityFeedAction = errorHandler(
  async (input: GetCommunityFeedInput) => {
    return getCommunityFeedQuery(input);
  }
);

// ── US2: Toggle Post Like ─────────────────────────────────────────────

export const togglePostLikeAction = errorHandler(
  async ({ post_id }: { post_id: string }) => {
    const result = await togglePostLikeQuery({ post_id });
    const authorId = await resolvePostAuthorId(post_id);
    revalidatePath('/community', 'page');
    if (authorId) revalidatePath(`/profile/${authorId}`, 'page');
    return result;
  }
);

// ── US3: Toggle Post Bookmark ─────────────────────────────────────────

export const togglePostBookmarkAction = errorHandler(
  async ({ post_id }: { post_id: string }) => {
    const result = await togglePostBookmarkQuery({ post_id });
    const authorId = await resolvePostAuthorId(post_id);
    revalidatePath('/community', 'page');
    if (authorId) revalidatePath(`/profile/${authorId}`, 'page');
    return result;
  }
);

// ── US10: Get Post Detail ─────────────────────────────────────────────

export const getCommunityPostDetailAction = errorHandler(
  async ({ post_id }: { post_id: string }) => {
    return getCommunityPostDetailQuery({ post_id });
  }
);

// ── US4: View Comments ────────────────────────────────────────────────

export const getPostCommentsAction = errorHandler(
  async (input: GetPostCommentsInput) => {
    return getPostCommentsQuery(input);
  }
);

export const getCommentRepliesAction = errorHandler(
  async (input: GetCommentRepliesInput) => {
    return getCommentRepliesQuery(input);
  }
);

// ── US5: Add Comment ──────────────────────────────────────────────────

export const addCommentAction = errorHandler(async (input: AddCommentInput) => {
  const result = await addCommentQuery(input);
  const authorId = await resolvePostAuthorId(input.post_id);
  revalidatePath('/community', 'page');
  if (authorId) revalidatePath(`/profile/${authorId}`, 'page');
  return result;
});

// ── US6: Edit / Delete Own Comment ────────────────────────────────────

export const editOwnCommentAction = errorHandler(
  async (input: EditOwnCommentInput) => {
    const { post_author_id, ...payload } = await editOwnCommentQuery(input);
    revalidatePath('/community', 'page');
    if (post_author_id) revalidatePath(`/profile/${post_author_id}`, 'page');
    return payload;
  }
);

export const deleteOwnCommentAction = errorHandler(
  async (input: DeleteOwnCommentInput) => {
    const result = await deleteOwnCommentQuery(input);
    revalidatePath('/community', 'page');
    if (result.post_author_id)
      revalidatePath(`/profile/${result.post_author_id}`, 'page');
    return { comment_id: result.comment_id };
  }
);

// ── US8: Delete Own Post ──────────────────────────────────────────────

export const deleteCommunityPostAction = errorHandler(
  async (input: DeleteCommunityPostInput) => {
    const result = await deleteCommunityPostQuery(input);
    revalidatePath('/community', 'page');
    revalidatePath(`/profile/${result.author_id}`, 'page');
    return { post_id: result.post_id };
  }
);

// ── US9: Get User Community Posts ─────────────────────────────────────

export const getUserCommunityPostsAction = errorHandler(
  async (input: GetUserCommunityPostsInput) => {
    return getUserCommunityPostsQuery(input);
  }
);

// ── US7: Toggle Comment Like ──────────────────────────────────────────

export const toggleCommentLikeAction = errorHandler(
  async ({ comment_id }: { comment_id: string }) => {
    const client = await createClient();
    const result = await toggleCommentLikeQuery({ comment_id });
    const { data: commentRow } = await client
      .from('community_post_comments')
      .select('post_id, community_posts!inner(author_id)')
      .eq('comment_id', comment_id)
      .single();
    if (commentRow) {
      const postAuthorId = (
        commentRow.community_posts as unknown as { author_id: string }[]
      )?.[0]?.author_id;
      revalidatePath('/community', 'page');
      if (postAuthorId) revalidatePath(`/profile/${postAuthorId}`, 'page');
    }
    return result;
  }
);
