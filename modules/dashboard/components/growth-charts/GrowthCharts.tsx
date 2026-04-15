import { useTranslations } from 'next-intl';
import { GrowthChart } from './GrowthChart';
import { AdminDashboardTrends } from '../../types';

interface GrowthChartsProps {
  trends: AdminDashboardTrends;
}

export function GrowthCharts({ trends }: GrowthChartsProps) {
  const t = useTranslations('Dashboard.charts');

  return (
    <>
      <GrowthChart
        title={t('newUsers')}
        data={trends.daily_new_users}
        lineColor="#2563eb" // Blue
      />
      <GrowthChart
        title={t('listingGrowth')}
        data={trends.listing_growth}
        lineColor="#10b981" // Emerald
      />
    </>
  );
}
