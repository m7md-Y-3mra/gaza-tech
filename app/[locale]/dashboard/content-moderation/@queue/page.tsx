import { Suspense } from 'react';
import { reportQueueSearchParamsCache } from '@/modules/content-moderation/search-params';
import ReportQueueSearch from '@/modules/content-moderation/components/report-queue-search/ReportQueueSearch';
import ReportQueueFilters from '@/modules/content-moderation/components/report-queue-filters/ReportQueueFilters';
import QueueContent from '@/modules/content-moderation/components/queue-content/QueueContent';
import QueueContentSkeleton from '@/modules/content-moderation/components/queue-content-skeleton/QueueContentSkeleton';

export default async function ReportQueuePage({
  searchParams,
}: {
  searchParams: Promise<any>;
}) {
  const params = reportQueueSearchParamsCache.parse(await searchParams);

  return (
    <div className="flex h-full flex-col">
      <div className="bg-background/50 sticky top-0 z-10 space-y-3 border-b p-4 backdrop-blur-sm">
        <h2 className="text-lg font-bold">Report Queue</h2>
        <ReportQueueSearch />
        <ReportQueueFilters />
      </div>

      <Suspense
        key={JSON.stringify(params)}
        fallback={<QueueContentSkeleton />}
      >
        <QueueContent params={params} />
      </Suspense>
    </div>
  );
}
