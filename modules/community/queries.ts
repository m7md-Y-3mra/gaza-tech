import 'server-only';

import z from 'zod';
import { createClient } from '@/lib/supabase/server';
import { authHandler } from '@/utils/auth-handler';
import { zodValidation } from '@/lib/zod-error';
import CustomError from '@/utils/CustomError';
import {
  createCommunityPostServerSchema,
  updateCommunityPostServerSchema,
  postIdSchema,
  commentIdSchema,
  paginationSchema,
  commentContentSchema,
  feedQuerySchema,
} from './server-schema';
import type {
  CommunityPost,
  CommunityPostAttachment,
  AuthorStub,
  FeedAttachment,
  FeedPost,
  CommentNode,
  TopLevelComment,
  Page,
  TogglePostLikeResult,
  TogglePostBookmarkResult,
  ToggleCommentLikeResult,
  DeletePostResult,
  DeleteCommentResult,
  EditCommentResult,
} from './types';
import { DELETED_USER_NAME_KEY } from './constant';

// ── Feed row mapper ───────────────────────────────────────────────────

function mapAuthorStub(
  raw: { id: unknown; name: unknown; avatar_url: unknown } | null
): AuthorStub {
  if (!raw || raw.id === null) {
    return { id: null, name: DELETED_USER_NAME_KEY, avatar_url: null };
  }
  return {
    id: raw.id as string,
    name: (raw.name as string) || DELETED_USER_NAME_KEY,
    avatar_url: (raw.avatar_url as string | null) ?? null,
  };
}

function mapFeedPostRow(row: {
  post_id: string;
  title: string;
  content: string;
  post_category: string;
  published_at: string;
  author: unknown;
  attachments: unknown;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
}): FeedPost {
  const authorRaw = row.author as {
    id: unknown;
    name: unknown;
    avatar_url: unknown;
  } | null;
  const attachmentsRaw =
    (row.attachments as { attachment_id: string; file_url: string }[]) ?? [];

  return {
    post_id: row.post_id,
    author: mapAuthorStub(authorRaw),
    title: row.title,
    content: row.content,
    post_category: row.post_category,
    published_at: row.published_at,
    attachments: attachmentsRaw.map(
      (a): FeedAttachment => ({
        attachment_id: a.attachment_id,
        file_url: a.file_url,
      })
    ),
    like_count: Number(row.like_count),
    comment_count: Number(row.comment_count),
    is_liked: row.is_liked,
    is_bookmarked: row.is_bookmarked,
  };
}

function mapCommentNodeRow(row: {
  comment_id: string;
  post_id: string;
  author: unknown;
  content: string;
  parent_comment_id: string | null;
  is_edited: boolean;
  edited_at: string | null;
  is_deleted: boolean;
  created_at: string;
  like_count: number;
  is_liked: boolean;
}): CommentNode {
  const authorRaw = row.author as {
    id: unknown;
    name: unknown;
    avatar_url: unknown;
  } | null;
  return {
    comment_id: row.comment_id,
    post_id: row.post_id,
    author: mapAuthorStub(authorRaw),
    content: row.content,
    parent_comment_id: row.parent_comment_id,
    is_edited: row.is_edited,
    edited_at: row.edited_at ?? null,
    is_deleted: row.is_deleted,
    created_at: row.created_at,
    like_count: Number(row.like_count),
    is_liked: row.is_liked,
  };
}

function mapRpcError(
  message: string
): { code: string; userMessage: string } | null {
  if (message.includes('POST_NOT_FOUND'))
    return { code: 'POST_NOT_FOUND', userMessage: 'Post not found' };
  if (message.includes('COMMENT_NOT_FOUND'))
    return { code: 'COMMENT_NOT_FOUND', userMessage: 'Comment not found' };
  if (message.includes('UNAUTHENTICATED'))
    return { code: 'UNAUTHENTICATED', userMessage: 'Authentication required' };
  return null;
}

// ── Types ─────────────────────────────────────────────────────────────

export type CommunityPostWithAttachments = CommunityPost & {
  community_posts_attachments: CommunityPostAttachment[];
};

// ── Private helpers ───────────────────────────────────────────────────

async function insertCommunityPostAttachmentsQuery(
  client: Awaited<ReturnType<typeof createClient>>,
  postId: string,
  attachments: { url: string }[]
): Promise<void> {
  if (attachments.length === 0) return;

  const records = attachments.map((a) => ({
    post_id: postId,
    file_url: a.url,
  }));

  const { error } = await client
    .from('community_posts_attachments')
    .insert(records);

  if (error) {
    console.error('Error inserting community post attachments:', error);
    throw new Error('Failed to save post attachments');
  }
}

// ── Create ────────────────────────────────────────────────────────────

export async function createCommunityPostQuery(
  data: z.infer<typeof createCommunityPostServerSchema>
): Promise<{ postId: string }> {
  'use server';
  const client = await createClient();
  const user = await authHandler();

  const validatedData = zodValidation(createCommunityPostServerSchema, data);
  const { attachments, ...postFields } = validatedData;

  const { data: insertedRow, error } = await client
    .from('community_posts')
    .insert({
      ...postFields,
      author_id: user.id,
      content_status: 'published',
      published_at: new Date().toISOString(),
    })
    .select('post_id')
    .single();

  if (error) {
    console.error('Error creating community post:', error);
    throw new Error('Failed to create post');
  }

  if (attachments && attachments.length > 0) {
    try {
      await insertCommunityPostAttachmentsQuery(
        client,
        insertedRow.post_id,
        attachments
      );
    } catch (attachmentError) {
      await client
        .from('community_posts')
        .delete()
        .eq('post_id', insertedRow.post_id);
      throw attachmentError;
    }
  }

  return { postId: insertedRow.post_id };
}

// ── Update ────────────────────────────────────────────────────────────

export async function updateCommunityPostQuery(
  postId: string,
  data: z.infer<typeof updateCommunityPostServerSchema>
): Promise<void> {
  'use server';
  const client = await createClient();
  const user = await authHandler();

  const validatedData = zodValidation(updateCommunityPostServerSchema, data);
  const { attachments, ...updateFields } = validatedData;

  const hasFieldUpdates =
    updateFields.title !== undefined ||
    updateFields.content !== undefined ||
    updateFields.post_category !== undefined;

  const hasAttachmentUpdates = attachments !== undefined;

  if (!hasFieldUpdates && !hasAttachmentUpdates) {
    return;
  }

  if (hasFieldUpdates) {
    const { data: updatedRows, error } = await client
      .from('community_posts')
      .update(updateFields)
      .eq('post_id', postId)
      .eq('author_id', user.id)
      .select('post_id');

    if (error) {
      console.error('Error updating community post:', error);
      throw new Error('Failed to update post');
    }

    if (!updatedRows || updatedRows.length === 0) {
      const { data: existingPost } = await client
        .from('community_posts')
        .select('post_id')
        .eq('post_id', postId)
        .single();

      if (!existingPost) {
        throw new CustomError({ message: 'Post not found' });
      }

      throw new CustomError({
        message: 'You are not authorised to edit this post',
      });
    }
  }

  if (attachments !== undefined) {
    const { data: currentAttachments, error: fetchError } = await client
      .from('community_posts_attachments')
      .select('*')
      .eq('post_id', postId);

    if (fetchError) {
      console.error('Error fetching current attachments:', fetchError);
      throw new Error('Failed to fetch current attachments');
    }

    const currentUrls = new Set(
      (currentAttachments || []).map((a) => a.file_url)
    );
    const incomingUrls = new Set(attachments.map((a) => a.url));

    const urlsToDelete = [...currentUrls].filter(
      (url) => !incomingUrls.has(url)
    );
    const urlsToInsert = attachments.filter(
      (a) => !a.isExisting && !currentUrls.has(a.url)
    );

    if (urlsToDelete.length > 0) {
      const { error: deleteError } = await client
        .from('community_posts_attachments')
        .delete()
        .eq('post_id', postId)
        .in('file_url', urlsToDelete);

      if (deleteError) {
        console.error('Error deleting attachments:', deleteError);
        throw new Error('Failed to delete old attachments');
      }
    }

    if (urlsToInsert.length > 0) {
      await insertCommunityPostAttachmentsQuery(client, postId, urlsToInsert);
    }
  }
}

// ── Get Details ───────────────────────────────────────────────────────

export async function getCommunityPostDetailsQuery(
  postId: string
): Promise<CommunityPostWithAttachments | null> {
  'use server';
  const client = await createClient();

  const { data, error } = await client
    .from('community_posts')
    .select('*, community_posts_attachments(*)')
    .eq('post_id', postId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching community post details:', error);
    return null;
  }

  return data as unknown as CommunityPostWithAttachments;
}

// ── US1: Browse Community Feed ────────────────────────────────────────

export type GetCommunityFeedInput = z.infer<typeof feedQuerySchema>;

export async function getCommunityFeedQuery(
  input: GetCommunityFeedInput
): Promise<Page<FeedPost>> {
  'use server';
  const client = await createClient();
  const { page, limit, category } = feedQuerySchema.parse(input);

  const { data, error } = await client.rpc('get_community_feed', {
    p_page: page,
    p_limit: limit + 1,
    p_category: category ?? null,
  });

  if (error) throw error;

  const rows = data ?? [];
  const has_more = rows.length > limit;
  const sliced = has_more ? rows.slice(0, limit) : rows;

  return {
    data: sliced.map(mapFeedPostRow),
    has_more,
    next_page: has_more ? page + 1 : null,
  };
}

// ── US2: Toggle Post Like ─────────────────────────────────────────────

export async function togglePostLikeQuery({
  post_id,
}: {
  post_id: string;
}): Promise<TogglePostLikeResult> {
  'use server';
  const client = await createClient();
  zodValidation(postIdSchema, post_id);

  const { data, error } = await client.rpc('toggle_post_like', {
    p_post_id: post_id,
  });

  if (error) {
    const mapped = mapRpcError(error.message);
    if (mapped)
      throw new CustomError({ code: mapped.code, message: mapped.userMessage });
    throw error;
  }

  const row = (data as { is_liked: boolean; like_count: number }[])[0];
  return { is_liked: row.is_liked, like_count: Number(row.like_count) };
}

// ── US3: Toggle Post Bookmark ─────────────────────────────────────────

export async function togglePostBookmarkQuery({
  post_id,
}: {
  post_id: string;
}): Promise<TogglePostBookmarkResult> {
  'use server';
  const client = await createClient();
  zodValidation(postIdSchema, post_id);

  const { data, error } = await client.rpc('toggle_post_bookmark', {
    p_post_id: post_id,
  });

  if (error) {
    const mapped = mapRpcError(error.message);
    if (mapped)
      throw new CustomError({ code: mapped.code, message: mapped.userMessage });
    throw error;
  }

  const row = (data as { is_bookmarked: boolean }[])[0];
  return { is_bookmarked: row.is_bookmarked };
}

// ── US10: Get Post Detail ─────────────────────────────────────────────

export async function getCommunityPostDetailQuery({
  post_id,
}: {
  post_id: string;
}): Promise<FeedPost> {
  'use server';
  const client = await createClient();
  zodValidation(postIdSchema, post_id);

  const { data, error } = await client.rpc('get_community_post_detail', {
    p_post_id: post_id,
  });

  if (error) {
    const mapped = mapRpcError(error.message);
    if (mapped)
      throw new CustomError({ code: mapped.code, message: mapped.userMessage });
    throw error;
  }

  const rows = data ?? [];
  if (rows.length === 0) {
    throw new CustomError({
      code: 'POST_NOT_FOUND',
      message: 'Post not found',
    });
  }

  return mapFeedPostRow(rows[0]);
}

// ── US4: Get Post Comments ────────────────────────────────────────────

export type GetPostCommentsInput = {
  post_id: string;
  page?: number;
  limit?: number;
};

export async function getPostCommentsQuery(
  input: GetPostCommentsInput
): Promise<Page<TopLevelComment>> {
  'use server';
  const client = await createClient();
  zodValidation(postIdSchema, input.post_id);
  const { page, limit } = paginationSchema.parse({
    page: input.page,
    limit: input.limit,
  });

  const { data, error } = await client.rpc('get_post_comments', {
    p_post_id: input.post_id,
    p_page: page,
    p_limit: limit + 1,
  });

  if (error) throw error;

  const rows = data ?? [];
  const has_more = rows.length > limit;
  const sliced = has_more ? rows.slice(0, limit) : rows;

  return {
    data: sliced.map(
      (
        row: Parameters<typeof mapCommentNodeRow>[0] & {
          replies: unknown;
          replies_count: number;
          has_more_replies: boolean;
        }
      ) => {
        const base = mapCommentNodeRow(row);
        const repliesRaw = (row.replies as unknown[] | null) ?? [];
        const replies = repliesRaw.map((r: unknown) =>
          mapCommentNodeRow(r as Parameters<typeof mapCommentNodeRow>[0])
        );
        return {
          ...base,
          replies,
          replies_count: Number(row.replies_count),
          has_more_replies: row.has_more_replies,
        } satisfies TopLevelComment;
      }
    ),
    has_more,
    next_page: has_more ? page + 1 : null,
  };
}

export type GetCommentRepliesInput = {
  comment_id: string;
  page?: number;
  limit?: number;
};

const repliesPaginationSchema = paginationSchema.extend({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .default(20)
    .transform((n) => Math.min(n, 50)),
});

export async function getCommentRepliesQuery(
  input: GetCommentRepliesInput
): Promise<Page<CommentNode>> {
  'use server';
  const client = await createClient();
  zodValidation(commentIdSchema, input.comment_id);
  const { page, limit } = repliesPaginationSchema.parse({
    page: input.page,
    limit: input.limit,
  });

  const { data, error } = await client.rpc('get_comment_replies', {
    p_comment_id: input.comment_id,
    p_page: page,
    p_limit: limit + 1,
  });

  if (error) throw error;

  const rows = data ?? [];
  const has_more = rows.length > limit;
  const sliced = has_more ? rows.slice(0, limit) : rows;

  return {
    data: sliced.map((r: Parameters<typeof mapCommentNodeRow>[0]) =>
      mapCommentNodeRow(r)
    ),
    has_more,
    next_page: has_more ? page + 1 : null,
  };
}

// ── US5: Add Comment ──────────────────────────────────────────────────

export type AddCommentInput = {
  post_id: string;
  parent_comment_id?: string | null;
  content: string;
};

export async function addCommentQuery(
  input: AddCommentInput
): Promise<CommentNode> {
  'use server';
  const client = await createClient();
  zodValidation(postIdSchema, input.post_id);
  if (input.parent_comment_id)
    zodValidation(commentIdSchema, input.parent_comment_id);
  const content = zodValidation(commentContentSchema, input.content);

  const { data, error } = await client.rpc('add_comment', {
    p_post_id: input.post_id,
    p_parent_comment_id: input.parent_comment_id ?? null,
    p_content: content,
  });

  if (error) {
    const mapped = mapRpcError(error.message);
    if (mapped)
      throw new CustomError({ code: mapped.code, message: mapped.userMessage });
    throw error;
  }

  const rows = data ?? [];
  if (rows.length === 0)
    throw new CustomError({ message: 'Failed to add comment' });

  return mapCommentNodeRow(rows[0] as Parameters<typeof mapCommentNodeRow>[0]);
}

// ── US6: Edit Own Comment ─────────────────────────────────────────────

export type EditOwnCommentInput = { comment_id: string; content: string };

export async function editOwnCommentQuery(
  input: EditOwnCommentInput
): Promise<EditCommentResult & { post_author_id: string }> {
  'use server';
  const client = await createClient();
  const user = await authHandler();
  zodValidation(commentIdSchema, input.comment_id);
  const content = zodValidation(commentContentSchema, input.content);

  const { data: existing, error: fetchError } = await client
    .from('community_post_comments')
    .select('comment_id, author_id, post_id, is_deleted')
    .eq('comment_id', input.comment_id)
    .single();

  if (fetchError || !existing) {
    throw new CustomError({
      code: 'COMMENT_NOT_FOUND',
      message: 'Comment not found',
    });
  }
  if (existing.is_deleted) {
    throw new CustomError({
      code: 'COMMENT_NOT_FOUND',
      message: 'Comment not found',
    });
  }
  if (existing.author_id !== user.id) {
    throw new CustomError({
      code: 'UNAUTHORIZED',
      message: 'You are not the author of this comment',
    });
  }

  const { data: post, error: postError } = await client
    .from('community_posts')
    .select('content_status, author_id')
    .eq('post_id', existing.post_id)
    .single();

  if (postError || !post || post.content_status !== 'published') {
    throw new CustomError({
      code: 'POST_NOT_FOUND',
      message: 'Post not found',
    });
  }

  const { data: updated, error: updateError } = await client
    .from('community_post_comments')
    .update({ content, is_edited: true, edited_at: new Date().toISOString() })
    .eq('comment_id', input.comment_id)
    .select(
      'comment_id, post_id, author_id, content, parent_comment_id, is_edited, edited_at, is_deleted, created_at'
    )
    .single();

  if (updateError || !updated) {
    throw new CustomError({ message: 'Failed to update comment' });
  }

  const { data: userData } = await client
    .from('users')
    .select('user_id, first_name, last_name, avatar_url')
    .eq('user_id', user.id)
    .single();

  return {
    comment_id: updated.comment_id,
    post_id: updated.post_id,
    author: mapAuthorStub(
      userData
        ? {
            id: userData.user_id,
            name: `${userData.first_name ?? ''} ${userData.last_name ?? ''}`.trim(),
            avatar_url: userData.avatar_url,
          }
        : null
    ),
    content: updated.content,
    parent_comment_id: updated.parent_comment_id,
    is_edited: updated.is_edited ?? true,
    edited_at: updated.edited_at ?? null,
    is_deleted: updated.is_deleted,
    created_at: updated.created_at ?? new Date().toISOString(),
    like_count: 0,
    is_liked: false,
    post_author_id: post.author_id,
  };
}

export type DeleteOwnCommentInput = { comment_id: string };

export async function deleteOwnCommentQuery(
  input: DeleteOwnCommentInput
): Promise<DeleteCommentResult & { post_id: string; post_author_id: string }> {
  'use server';
  const client = await createClient();
  const user = await authHandler();
  zodValidation(commentIdSchema, input.comment_id);

  const { data: existing, error: fetchError } = await client
    .from('community_post_comments')
    .select('comment_id, author_id, post_id, is_deleted, community_posts!inner(author_id)')
    .eq('comment_id', input.comment_id)
    .single();

  if (fetchError || !existing) {
    throw new CustomError({
      code: 'COMMENT_NOT_FOUND',
      message: 'Comment not found',
    });
  }
  if (existing.is_deleted) {
    throw new CustomError({
      code: 'COMMENT_NOT_FOUND',
      message: 'Comment not found',
    });
  }
  if (existing.author_id !== user.id) {
    throw new CustomError({
      code: 'UNAUTHORIZED',
      message: 'You are not the author of this comment',
    });
  }

  const { error: deleteError } = await client
    .from('community_post_comments')
    .update({ is_deleted: true, content: '' })
    .eq('comment_id', input.comment_id);

  if (deleteError)
    throw new CustomError({ message: 'Failed to delete comment' });

  const postAuthorId =
    (existing.community_posts as unknown as { author_id: string }[])?.[0]
      ?.author_id ?? '';

  return {
    comment_id: input.comment_id,
    post_id: existing.post_id,
    post_author_id: postAuthorId,
  };
}

// ── US8: Delete Own Post ──────────────────────────────────────────────

export type DeleteCommunityPostInput = { post_id: string };

export async function deleteCommunityPostQuery(
  input: DeleteCommunityPostInput
): Promise<DeletePostResult & { author_id: string }> {
  'use server';
  const client = await createClient();
  const user = await authHandler();
  zodValidation(postIdSchema, input.post_id);

  const { data: existing, error: fetchError } = await client
    .from('community_posts')
    .select('post_id, author_id, content_status')
    .eq('post_id', input.post_id)
    .single();

  if (fetchError || !existing) {
    throw new CustomError({
      code: 'POST_NOT_FOUND',
      message: 'Post not found',
    });
  }
  if (existing.content_status !== 'published') {
    throw new CustomError({
      code: 'POST_NOT_FOUND',
      message: 'Post not found',
    });
  }
  if (existing.author_id !== user.id) {
    throw new CustomError({
      code: 'UNAUTHORIZED',
      message: 'You are not the author of this post',
    });
  }

  const { error: updateError } = await client
    .from('community_posts')
    .update({ content_status: 'removed' })
    .eq('post_id', input.post_id);

  if (updateError) throw new CustomError({ message: 'Failed to delete post' });

  return { post_id: input.post_id, author_id: existing.author_id };
}

// ── US9: Get User Community Posts ─────────────────────────────────────

export type GetUserCommunityPostsInput = {
  user_id: string;
  page?: number;
  limit?: number;
};

export async function getUserCommunityPostsQuery(
  input: GetUserCommunityPostsInput
): Promise<Page<FeedPost>> {
  'use server';
  const client = await createClient();
  zodValidation(z.uuid(), input.user_id);
  const { page, limit } = paginationSchema.parse({
    page: input.page,
    limit: input.limit,
  });

  const { data, error } = await client.rpc('get_user_community_posts', {
    p_user_id: input.user_id,
    p_page: page,
    p_limit: limit + 1,
  });

  if (error) throw error;

  const rows = data ?? [];
  const has_more = rows.length > limit;
  const sliced = has_more ? rows.slice(0, limit) : rows;

  return {
    data: sliced.map(mapFeedPostRow),
    has_more,
    next_page: has_more ? page + 1 : null,
  };
}

// ── US7: Toggle Comment Like ──────────────────────────────────────────

export async function toggleCommentLikeQuery({
  comment_id,
}: {
  comment_id: string;
}): Promise<ToggleCommentLikeResult> {
  'use server';
  const client = await createClient();
  zodValidation(commentIdSchema, comment_id);

  const { data, error } = await client.rpc('toggle_comment_like', {
    p_comment_id: comment_id,
  });

  if (error) {
    const mapped = mapRpcError(error.message);
    if (mapped)
      throw new CustomError({ code: mapped.code, message: mapped.userMessage });
    throw error;
  }

  const row = (data as { is_liked: boolean; like_count: number }[])[0];
  return { is_liked: row.is_liked, like_count: Number(row.like_count) };
}
