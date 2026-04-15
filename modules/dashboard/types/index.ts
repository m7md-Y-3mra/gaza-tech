import { Database } from '@/types/supabase';

export interface MetricComparison {
  current: number;
  previous: number;
  percentage_change: number; // Calculated on frontend: ((current - previous) / previous) * 100
}

export interface AdminDashboardSummary {
  total_users: MetricComparison;
  new_listings: MetricComparison;
  new_posts: MetricComparison;
  pending_reports: MetricComparison;
  pending_verifications: MetricComparison;
}

export interface AdminTrendPoint {
  date: string; // ISO format (YYYY-MM-DD)
  count: number;
}

export interface AdminDashboardTrends {
  daily_new_users: AdminTrendPoint[];
  listing_growth: AdminTrendPoint[];
}

export interface AdminDashboardStatsResponse {
  summary: AdminDashboardSummary;
  trends: AdminDashboardTrends;
}

export type TimeRange = '7d' | '30d' | '90d';

// Extend the Database type to include our new RPC
export interface ExtendedDatabase extends Database {
  public: Database['public'] & {
    Functions: Database['public']['Functions'] & {
      get_admin_dashboard_stats: {
        Args: {
          time_range_days: number;
        };
        Returns: unknown;
      };
    };
  };
}
