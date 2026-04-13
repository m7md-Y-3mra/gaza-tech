import { ReportRow, ReportStatus } from '@/modules/reports/types';

export interface ReportQueueItem {
  report_id: string;
  reason: string;
  report_status: ReportStatus;
  created_at: string;
  reporter_name: string;
  content_type: 'listing' | 'post' | 'comment' | 'user';
  content_id: string;
}

export interface ReportDetail extends ReportRow {
  reporter: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  reported_content: {
    type: 'listing' | 'post' | 'comment' | 'user';
    data: any; // We'll cast this to specific types in components
  };
  history: {
    report_id: string;
    reason: string;
    created_at: string;
    report_status: string;
  }[];
}

export const CONTENT_TYPE_LABELS = {
  listing: 'Listing',
  post: 'Post',
  comment: 'Comment',
  user: 'User',
} as const;
