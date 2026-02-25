'use client';

import { useQueryState } from 'nuqs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { queueSearchParams } from '@/modules/verification-review/search-params';

type QueuePaginationProps = {
  totalCount: number;
  pageSize: number;
};

export default function QueuePagination({
  totalCount,
  pageSize,
}: QueuePaginationProps) {
  const [currentPage, setCurrentPage] = useQueryState(
    'page',
    queueSearchParams.page.withOptions({ shallow: false })
  );

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-2 dark:border-gray-700">
      <button
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-800"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Previous
      </button>

      <span className="text-xs text-gray-500 dark:text-gray-400">
        {currentPage} / {totalPages}
      </span>

      <button
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-800"
      >
        Next
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
