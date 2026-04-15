'use client';

import React from 'react';
import { useQueryState } from 'nuqs';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { QUEUE_PAGE_SIZE } from '../../search-params';
import { useQueuePending } from '../queue-pending-context/QueuePendingContext';

interface ReportQueuePaginationProps {
  totalCount: number;
}

const ReportQueuePagination: React.FC<ReportQueuePaginationProps> = ({
  totalCount,
}) => {
  const { startTransition } = useQueuePending();

  const [page, setPage] = useQueryState('page', {
    parse: (value) => parseInt(value) || 1,
    serialize: (value) => value.toString(),
    defaultValue: 1,
    shallow: false,
    startTransition,
  });

  const totalPages = Math.ceil(totalCount / QUEUE_PAGE_SIZE);

  if (totalPages <= 1) return null;

  return (
    <Pagination className="bg-background mt-auto border-t py-2">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page > 1) setPage(page - 1);
            }}
            className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>

        <PaginationItem>
          <span className="px-2 text-xs font-medium">
            {page} / {totalPages}
          </span>
        </PaginationItem>

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page < totalPages) setPage(page + 1);
            }}
            className={
              page >= totalPages ? 'pointer-events-none opacity-50' : ''
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default ReportQueuePagination;
