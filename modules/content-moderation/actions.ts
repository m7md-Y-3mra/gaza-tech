'use server';

import { revalidatePath } from 'next/cache';
import { errorHandler } from '@/utils/error-handler';
import {
  resolveReportQuery,
  hidePostQuery,
  hideListingQuery,
  hideCommentQuery,
  banUserQuery,
} from './queries';

/**
 * Dismiss a report.
 */
export const dismissReportAction = errorHandler(
  async ({ reportId, resolutionNotes }: { reportId: string; resolutionNotes?: string }) => {
    const result = await resolveReportQuery({
      reportId,
      status: 'dismissed',
      resolutionNotes,
    });
    revalidatePath('/dashboard/content-moderation');
    return result;
  }
);

/**
 * Remove content and resolve report.
 */
export const removeContentAction = errorHandler(
  async ({
    reportId,
    contentType,
    contentId,
    resolutionNotes,
  }: {
    reportId: string;
    contentType: 'post' | 'listing' | 'comment';
    contentId: string;
    resolutionNotes?: string;
  }) => {
    if (contentType === 'post') await hidePostQuery(contentId);
    else if (contentType === 'listing') await hideListingQuery(contentId);
    else if (contentType === 'comment') await hideCommentQuery(contentId);

    const result = await resolveReportQuery({
      reportId,
      status: 'resolved',
      actionTaken: 'content_removed',
      resolutionNotes,
    });

    revalidatePath('/dashboard/content-moderation');
    return result;
  }
);

/**
 * Ban user and resolve report.
 */
export const banUserAction = errorHandler(
  async ({
    reportId,
    userId,
    reason,
    expiresAt,
    resolutionNotes,
  }: {
    reportId: string;
    userId: string;
    reason: string;
    expiresAt?: string | null;
    resolutionNotes?: string;
  }) => {
    await banUserQuery({ userId, reason, expiresAt });

    const result = await resolveReportQuery({
      reportId,
      status: 'resolved',
      actionTaken: 'user_banned',
      resolutionNotes,
    });

    revalidatePath('/dashboard/content-moderation');
    return result;
  }
);
