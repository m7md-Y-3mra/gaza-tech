'use server';

import { createClient } from '@/lib/supabase/server';
import { authHandler } from '@/utils/auth-handler';
import CustomError from '@/utils/CustomError';
import { CreateReportInput } from './schema';

/**
 * Check if a user has already reported a specific content.
 */
export async function checkDuplicateReportQuery(
  reporterId: string,
  targetType: 'listing' | 'post' | 'comment' | 'user',
  targetId: string
): Promise<boolean> {
  const supabase = await createClient();

  const columnMap = {
    listing: 'reported_listing_id',
    post: 'reported_post_id',
    comment: 'reported_comment_id',
    user: 'reported_user_id',
  };

  const { data, error } = await supabase
    .from('reports')
    .select('report_id')
    .eq('reporter_id', reporterId)
    .eq(columnMap[targetType], targetId)
    .maybeSingle();

  if (error) {
    console.error('Error checking duplicate report:', error);
    throw new CustomError({
      message: 'Failed to check duplicate report',
    });
  }

  return !!data;
}

/**
 * Create a new report.
 */
export async function createReportQuery(input: CreateReportInput) {
  const user = await authHandler();
  const supabase = await createClient();

  // Determine target type and ID
  let targetType: 'listing' | 'post' | 'comment' | 'user' | undefined;
  let targetId: string | undefined;

  if (input.reported_listing_id) {
    targetType = 'listing';
    targetId = input.reported_listing_id;
  } else if (input.reported_post_id) {
    targetType = 'post';
    targetId = input.reported_post_id;
  } else if (input.reported_comment_id) {
    targetType = 'comment';
    targetId = input.reported_comment_id;
  } else if (input.reported_user_id) {
    targetType = 'user';
    targetId = input.reported_user_id;
  }
  console.log(targetType, targetId);
  if (!targetType || !targetId) {
    throw new CustomError({
      message: 'Exactly one reported content ID must be provided',
    });
  }

  // Check for duplicate
  const isDuplicate = await checkDuplicateReportQuery(
    user.id,
    targetType,
    targetId
  );
  if (isDuplicate) {
    throw new CustomError({
      message: 'You have already reported this content',
      code: 'ALREADY_REPORTED',
    });
  }

  // Insert report
  const { data, error } = await supabase
    .from('reports')
    .insert({
      reporter_id: user.id,
      reason: input.reason,
      description: input.description || null,
      reported_listing_id: input.reported_listing_id || null,
      reported_post_id: input.reported_post_id || null,
      reported_comment_id: input.reported_comment_id || null,
      reported_user_id: input.reported_user_id || null,
      report_status: 'pending',
    })
    .select('report_id')
    .single();

  if (error) {
    console.error('Error creating report:', error);
    // Handle foreign key violation (content not found)
    if (error.code === '23503') {
      throw new CustomError({
        message: 'The content you are trying to report no longer exists',
        code: 'CONTENT_NOT_FOUND',
      });
    }
    throw new CustomError({
      message: 'Failed to submit report',
    });
  }

  return data.report_id;
}
