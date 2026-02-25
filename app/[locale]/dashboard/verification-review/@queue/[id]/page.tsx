import { getVerificationQueueAction } from '@/modules/verification-review/actions';
import QueueList from '@/modules/verification-review/components/queue-list';
import QueuePagination from '@/modules/verification-review/components/queue-pagination';
import {
  queueSearchParamsCache,
  QUEUE_PAGE_SIZE,
} from '@/modules/verification-review/search-params';
import type { SearchParams } from 'nuqs';

export default async function QueueIdPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { query, page } = await queueSearchParamsCache.parse(searchParams);

  const result = await getVerificationQueueAction({ query, page });

  const {
    items: queue,
    totalCount,
    pageSize,
  } = result.success
    ? result.data
    : { items: [], totalCount: 0, pageSize: QUEUE_PAGE_SIZE };

  return (
    <>
      {/* Queue List */}
      <div className="flex-1 overflow-y-auto">
        <QueueList queue={queue} hasSearchQuery={!!query.trim()} />
      </div>

      {/* Pagination */}
      <QueuePagination totalCount={totalCount} pageSize={pageSize} />

      {/* Count */}
      <div className="border-t border-gray-200 px-4 py-2 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {totalCount} pending request{totalCount !== 1 ? 's' : ''}
        </p>
      </div>
    </>
  );
}
