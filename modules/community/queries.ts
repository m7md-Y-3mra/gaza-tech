import 'server-only';

import z from 'zod';
import { createClient } from '@/lib/supabase/server';
import { authHandler } from '@/utils/auth-handler';
import { zodValidation } from '@/lib/zod-error';
import CustomError from '@/utils/CustomError';
import {
  createCommunityPostServerSchema,
  updateCommunityPostServerSchema,
} from './server-schema';
import type { CommunityPost, CommunityPostAttachment } from './types';

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
