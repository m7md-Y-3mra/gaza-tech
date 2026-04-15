import { Suspense } from 'react';
import { reportQueueSearchParamsCache } from '@/modules/content-moderation/search-params';
import QueueContent from '@/modules/content-moderation/components/queue-content/QueueContent';
import QueueContentSkeleton from '@/modules/content-moderation/components/queue-content-skeleton/QueueContentSkeleton';

export default async function ReportQueuePage({
  searchParams,
}: {
  searchParams: Promise<any>;
}) {
  const params = reportQueueSearchParamsCache.parse(await searchParams);
  const { reportId: _reportId, ...queueParams } = params;

  return (
    <Suspense key={JSON.stringify(queueParams)} fallback={<QueueContentSkeleton />}>
      <QueueContent params={params} />
    </Suspense>
  );
}
