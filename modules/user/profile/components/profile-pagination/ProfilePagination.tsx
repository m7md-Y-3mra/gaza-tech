'use client';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ProfilePaginationProps } from './types';
import { useProfilePagination } from './hooks/useProfilePagination';

const ProfilePagination = ({
  totalCount,
  pageSize,
}: ProfilePaginationProps) => {
  const t = useTranslations('Profile.Pagination');
  const { page, totalPages, visiblePages, handlePageChange } =
    useProfilePagination(totalCount, pageSize);
  if (totalPages <= 1) return null;

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationLink
            aria-label={t('previous')}
            size="default"
            onClick={() => handlePageChange(Math.max(1, page - 1))}
            className={`gap-1 px-2.5 sm:ps-2.5 ${
              page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
            }`}
          >
            <ChevronLeftIcon />
            <span className="hidden sm:block">{t('previous')}</span>
          </PaginationLink>
        </PaginationItem>

        {visiblePages.map((pageNum) => (
          <PaginationItem key={pageNum}>
            <PaginationLink
              onClick={() => handlePageChange(pageNum)}
              isActive={pageNum === page}
              className="cursor-pointer"
            >
              {pageNum}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationLink
            aria-label={t('next')}
            size="default"
            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
            className={`gap-1 px-2.5 sm:pe-2.5 ${
              page >= totalPages
                ? 'pointer-events-none opacity-50'
                : 'cursor-pointer'
            }`}
          >
            <span className="hidden sm:block">{t('next')}</span>
            <ChevronRightIcon />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default ProfilePagination;
