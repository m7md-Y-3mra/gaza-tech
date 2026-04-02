'use server';

import { errorHandler } from '@/utils/error-handler';
import { revalidatePath } from 'next/cache';
import {
  createCommunityPostQuery,
  updateCommunityPostQuery,
  getCommunityPostDetailsQuery,
} from './queries';

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
