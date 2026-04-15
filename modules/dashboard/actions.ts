import { createClient } from '@/lib/supabase/server';
import { errorHandler } from '@/utils/error-handler';
import { getAdminDashboardStatsQuery } from './queries';
import { AdminDashboardStatsResponse, ExtendedDatabase } from './types';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Server action to fetch dashboard statistics.
 * Wrapped with errorHandler to handle Zod validation, CustomError, and unexpected errors.
 */
export const getAdminDashboardStatsAction = errorHandler(
  async (timeRangeDays: number): Promise<AdminDashboardStatsResponse> => {
    const supabase = (await createClient()) as unknown as SupabaseClient<ExtendedDatabase>;
    const { data, error } = await getAdminDashboardStatsQuery(
      supabase,
      timeRangeDays
    );

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from dashboard statistics query');
    }

    return data as unknown as AdminDashboardStatsResponse;
  }
);
