import { requireRole } from '@/utils/rbac-handler';
import { getAdminDashboardStatsAction } from '@/modules/dashboard/actions';
import { DashboardPage } from '@/modules/dashboard/dashboard-page';
import { dashboardSearchParamsCache } from '@/modules/dashboard/search-params';
import { SearchParams } from 'nuqs/server';
import { setRequestLocale } from 'next-intl/server';
import { TimeRange } from '@/modules/dashboard/types';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}

const rangeToDays: Record<TimeRange, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

export default async function Page({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // 1. RBAC Check - Only admins allowed
  await requireRole(['admin']);

  // 2. Parse Search Params
  const { range } = await dashboardSearchParamsCache.parse(searchParams);

  // 3. Fetch Data
  const days = rangeToDays[range as TimeRange] || 7;
  const result = await getAdminDashboardStatsAction(days);

  if (!result.success) {
    throw new Error(result.message);
  }

  // 4. Render Module Page
  return <DashboardPage stats={result.data} timeRange={range as TimeRange} />;
}
