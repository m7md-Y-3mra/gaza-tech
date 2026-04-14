'use server';

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/utils/rbac-handler';
import CustomError from '@/utils/CustomError';
import { ReportQueueItem, ReportDetail } from './types';
import {
  DEFAULT_LIMIT_NUMBER,
  DEFAULT_PAGE_NUMBER,
} from '@/constants/pagination';

/**
 * Fetch report queue with filters and pagination.
 */
export async function getReportQueueQuery({
  query = '',
  page = DEFAULT_PAGE_NUMBER,
  contentType = 'all',
  reason = 'all',
  status = 'pending',
}: {
  query?: string;
  page?: number;
  contentType?: string;
  reason?: string;
  status?: string;
} = {}): Promise<{
  items: ReportQueueItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}> {
  const supabase = await createClient();
  await requireRole(['admin', 'moderator']);

  const from = (page - 1) * DEFAULT_LIMIT_NUMBER;
  const to = from + DEFAULT_LIMIT_NUMBER - 1;

  let request = supabase
    .from('reports')
    .select(
      `
      report_id,
      reason,
      report_status,
      created_at,
      reported_post_id,
      reported_listing_id,
      reported_comment_id,
      reported_user_id,
      users!reports_reporter_id_fkey (
        first_name,
        last_name
      )
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: true });

  // Apply status filter
  if (status !== 'all') {
    request = request.eq('report_status', status);
  }

  // Apply reason filter
  if (reason !== 'all') {
    request = request.eq('reason', reason);
  }

  // Apply content type filter
  if (contentType === 'post')
    request = request.not('reported_post_id', 'is', null);
  if (contentType === 'listing')
    request = request.not('reported_listing_id', 'is', null);
  if (contentType === 'comment')
    request = request.not('reported_comment_id', 'is', null);
  if (contentType === 'user')
    request = request.not('reported_user_id', 'is', null);

  // Apply search query (on reporter name)
  if (query.trim()) {
    request = request.or(
      `first_name.ilike.%${query}%,last_name.ilike.%${query}%`,
      { foreignTable: 'users' }
    );
  }

  // Apply pagination
  request = request.range(from, to);

  const { data, error, count } = await request;

  if (error) {
    console.error('Error fetching report queue:', error);
    throw new CustomError({
      message: 'Failed to fetch report queue',
    });
  }

  const items: ReportQueueItem[] = (data || []).map((item) => {
    const reporter = item.users as any;
    let type: 'listing' | 'post' | 'comment' | 'user' = 'user';
    let id = '';

    if (item.reported_post_id) {
      type = 'post';
      id = item.reported_post_id;
    } else if (item.reported_listing_id) {
      type = 'listing';
      id = item.reported_listing_id;
    } else if (item.reported_comment_id) {
      type = 'comment';
      id = item.reported_comment_id;
    } else if (item.reported_user_id) {
      type = 'user';
      id = item.reported_user_id;
    }

    return {
      report_id: item.report_id,
      reason: item.reason,
      report_status: item.report_status as any,
      created_at: item.created_at!,
      reporter_name:
        `${reporter?.first_name || ''} ${reporter?.last_name || ''}`.trim(),
      content_type: type,
      content_id: id,
    };
  });

  return {
    items,
    totalCount: count ?? 0,
    page,
    pageSize: DEFAULT_LIMIT_NUMBER,
  };
}

/**
 * Fetch full report details including joined content and history.
 */
export async function getReportByIdQuery(
  reportId: string
): Promise<ReportDetail> {
  const supabase = await createClient();
  await requireRole(['admin', 'moderator']);

  // 1. Fetch the base report
  const { data: report, error } = await supabase
    .from('reports')
    .select(
      `
      *,
      reporter:users!reports_reporter_id_fkey (
        first_name,
        last_name,
        avatar_url
      )
    `
    )
    .eq('report_id', reportId)
    .single();

  if (error || !report) {
    throw new CustomError({
      message: 'Report not found',
    });
  }

  // 2. Fetch reported content
  let contentType: 'listing' | 'post' | 'comment' | 'user' = 'user';
  let contentId = '';
  let contentData: any = null;

  if (report.reported_post_id) {
    contentType = 'post';
    contentId = report.reported_post_id;
    const { data } = await supabase
      .from('community_posts')
      .select('*, author:users!community_posts_author_id_fkey(*)')
      .eq('post_id', contentId)
      .single();
    contentData = data;
  } else if (report.reported_listing_id) {
    contentType = 'listing';
    contentId = report.reported_listing_id;
    const { data } = await supabase
      .from('marketplace_listings')
      .select('*, seller:users!marketplace_listings_seller_id_fkey(*)')
      .eq('listing_id', contentId)
      .single();
    contentData = data;
  } else if (report.reported_comment_id) {
    contentType = 'comment';
    contentId = report.reported_comment_id;
    const { data } = await supabase
      .from('community_post_comments')
      .select('*, author:users!community_post_comments_author_id_fkey(*)')
      .eq('comment_id', contentId)
      .single();
    contentData = data;
  } else if (report.reported_user_id) {
    contentType = 'user';
    contentId = report.reported_user_id;
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', contentId)
      .single();
    contentData = data;
  }

  // 3. Fetch history (other reports for same content)
  const historyQuery = supabase
    .from('reports')
    .select('report_id, reason, created_at, report_status')
    .neq('report_id', reportId)
    .order('created_at', { ascending: false });

  if (contentType === 'post') historyQuery.eq('reported_post_id', contentId);
  else if (contentType === 'listing')
    historyQuery.eq('reported_listing_id', contentId);
  else if (contentType === 'comment')
    historyQuery.eq('reported_comment_id', contentId);
  else if (contentType === 'user')
    historyQuery.eq('reported_user_id', contentId);

  const { data: history } = await historyQuery;

  return {
    ...report,
    reporter: report.reporter as any,
    reported_content: {
      type: contentType,
      data: contentData,
    },
    history: (history || []).map((h) => ({
      ...h,
      created_at: h.created_at!,
    })),
  };
}

/**
 * Resolve or Dismiss a report.
 */
export async function resolveReportQuery({
  reportId,
  status,
  actionTaken,
  resolutionNotes,
}: {
  reportId: string;
  status: 'resolved' | 'dismissed';
  actionTaken?: string;
  resolutionNotes?: string;
}) {
  const supabase = await createClient();
  const { user: reviewer } = await requireRole(['admin', 'moderator']);

  const { error } = await supabase
    .from('reports')
    .update({
      report_status: status,
      action_taken: actionTaken || null,
      resolution_notes: resolutionNotes || null,
      reviewed_by: reviewer.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('report_id', reportId);

  if (error) {
    console.error('Error resolving report:', error);
    throw new CustomError({ message: 'Failed to resolve report' });
  }

  // Fetch report to get owner/content details for notification
  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('report_id', reportId)
    .single();

  if (report && status === 'resolved' && actionTaken) {
    const ownerId =
      report.reported_user_id || (await getOwnerId(supabase, report));

    if (ownerId) {
      let title = '';
      let description = '';

      if (actionTaken === 'content_removed') {
        title = 'Content Removed';
        description = `Your content has been removed for violating our community guidelines: ${report.reason}`;
      } else if (actionTaken === 'user_banned') {
        title = 'Account Suspended';
        description = `Your account has been suspended for: ${report.reason}`;
      }

      await supabase.from('notifications').insert({
        user_id: ownerId,
        title,
        description,
        notification_type: 'moderation',
        notification_data: { report_id: reportId, action: actionTaken },
      });
    }
  }

  return { success: true };
}

async function getOwnerId(supabase: any, report: any) {
  if (report.reported_post_id) {
    const { data } = await supabase
      .from('community_posts')
      .select('author_id')
      .eq('post_id', report.reported_post_id)
      .single();
    return data?.author_id;
  }
  if (report.reported_listing_id) {
    const { data } = await supabase
      .from('marketplace_listings')
      .select('seller_id')
      .eq('listing_id', report.reported_listing_id)
      .single();
    return data?.seller_id;
  }
  if (report.reported_comment_id) {
    const { data } = await supabase
      .from('community_post_comments')
      .select('author_id')
      .eq('comment_id', report.reported_comment_id)
      .single();
    return data?.author_id;
  }
  return null;
}

/**
 * Hide community post.
 */
export async function hidePostQuery(postId: string) {
  const supabase = await createClient();
  await requireRole(['admin', 'moderator']);

  const { error } = await supabase
    .from('community_posts')
    .update({ content_status: 'removed' })
    .eq('post_id', postId);

  if (error) throw new CustomError({ message: 'Failed to hide post' });
  return { success: true };
}

/**
 * Hide marketplace listing.
 */
export async function hideListingQuery(listingId: string) {
  const supabase = await createClient();
  await requireRole(['admin', 'moderator']);

  const { error } = await supabase
    .from('marketplace_listings')
    .update({ content_status: 'removed' })
    .eq('listing_id', listingId);

  if (error) throw new CustomError({ message: 'Failed to hide listing' });
  return { success: true };
}

/**
 * Soft delete comment.
 */
export async function hideCommentQuery(commentId: string) {
  const supabase = await createClient();
  await requireRole(['admin', 'moderator']);

  const { error } = await supabase
    .from('community_post_comments')
    .update({
      is_deleted: true,
      content: '[Removed by moderator]',
      updated_at: new Date().toISOString(),
    })
    .eq('comment_id', commentId);

  if (error) throw new CustomError({ message: 'Failed to hide comment' });
  return { success: true };
}

/**
 * Ban user.
 */
export async function banUserQuery({
  userId,
  reason,
  expiresAt,
}: {
  userId: string;
  reason: string;
  expiresAt?: string | null;
}) {
  const supabase = await createClient();
  await requireRole(['admin', 'moderator']);

  const me = await supabase.auth.getUser();
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', me.data.user?.id)
    .single();
  console.log(data);

  const { error } = await supabase
    .from('users')
    .update({
      is_active: false,
      ban_reason: reason,
      banned_expires_at: expiresAt || null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  console.log(error);

  if (error) throw new CustomError({ message: 'Failed to ban user' });
  return { success: true };
}

/**
 * Get count of pending reports.
 */
export async function getPendingReportCountQuery() {
  const supabase = await createClient();
  // Any moderator or admin can see this count
  await requireRole(['admin', 'moderator']);

  const { count, error } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('report_status', 'pending');

  if (error) {
    console.error('Error fetching pending report count:', error);
    return 0;
  }

  return count || 0;
}
