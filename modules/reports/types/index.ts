import { Database } from '@/types/supabase';

export type ReportRow = Database['public']['Tables']['reports']['Row'];
export type ReportInsert = Database['public']['Tables']['reports']['Insert'];
export type ReportUpdate = Database['public']['Tables']['reports']['Update'];

export const REPORT_REASONS = [
  'spam',
  'inappropriate',
  'harassment',
  'misleading',
  'fraud',
  'hate_speech',
  'other',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_STATUSES = ['pending', 'resolved', 'dismissed'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const ACTION_TYPES = [
  'content_removed',
  'user_warned',
  'user_banned',
] as const;
export type ActionType = (typeof ACTION_TYPES)[number];
