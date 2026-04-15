import { getTranslations } from 'next-intl/server';
import { AdminDashboardStatsResponse, TimeRange } from '../types';
import { SummaryCards } from '../components/summary-cards';
import { GrowthCharts } from '../components/growth-charts';
import { TimeRangeFilter } from '../components/time-range-filter';
import { ExportButton } from '../components/export-button';

interface DashboardPageProps {
  stats: AdminDashboardStatsResponse;
  timeRange: TimeRange;
}

export async function DashboardPage({ stats }: DashboardPageProps) {
  const t = await getTranslations('Dashboard');

  return (
    <div className="container mx-auto space-y-8 p-4">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            {/* Page description or context */}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton stats={stats} />
          <TimeRangeFilter />
        </div>
      </div>

      <div className="space-y-8">
        {/* Summary Cards Section */}
        <section>
          <SummaryCards summary={stats.summary} />
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <GrowthCharts trends={stats.trends} />
        </section>
      </div>
    </div>
  );
}
