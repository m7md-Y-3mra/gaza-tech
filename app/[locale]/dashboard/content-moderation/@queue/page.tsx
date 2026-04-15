import { Suspense } from 'react';
import { reportQueueSearchParamsCache } from '@/modules/content-moderation/search-params';
import QueueContent from '@/modules/content-moderation/components/queue-content/QueueContent';
import QueueContentSkeleton from '@/modules/content-moderation/components/queue-content-skeleton/QueueContentSkeleton';

export default async function ReportQueuePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = reportQueueSearchParamsCache.parse(await searchParams);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { reportId: _reportId, ...queueParams } = params;

  return (
    <Suspense
      key={JSON.stringify(queueParams)}
      fallback={<QueueContentSkeleton />}
    >
      <QueueContent params={params} />
    </Suspense>
  );
}
