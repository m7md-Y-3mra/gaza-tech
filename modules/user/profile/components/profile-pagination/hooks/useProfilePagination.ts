import { useQueryState } from 'nuqs';
import { profileSearchParams } from '../../../search-params';
import { MAX_VISIBLE_PAGES } from '../constants';

export const useProfilePagination = (totalCount: number, pageSize: number) => {
  const [page, setPage] = useQueryState(
    'page',
    profileSearchParams.page.withOptions({ shallow: false })
  );

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const getVisiblePages = () => {
    const pages: number[] = [];

    let start = Math.max(1, page - Math.floor(MAX_VISIBLE_PAGES / 2));
    const end = Math.min(totalPages, start + MAX_VISIBLE_PAGES - 1);

    // Adjust start if we're near the end
    if (end - start + 1 < MAX_VISIBLE_PAGES) {
      start = Math.max(1, end - MAX_VISIBLE_PAGES + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return {
    page,
    totalPages,
    visiblePages,
    handlePageChange,
  };
};
