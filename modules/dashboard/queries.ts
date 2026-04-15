import { SupabaseClient } from '@supabase/supabase-js';
import { ExtendedDatabase } from './types';

/**
 * Fetches dashboard statistics from Supabase via RPC.
 * @param supabase Supabase server client
 * @param timeRangeDays Number of days for trend analysis
 */
export async function getAdminDashboardStatsQuery(
  supabase: SupabaseClient<ExtendedDatabase>,
  timeRangeDays: number
) {
  return await supabase.rpc('get_admin_dashboard_stats', {
    time_range_days: timeRangeDays,
  });
}
