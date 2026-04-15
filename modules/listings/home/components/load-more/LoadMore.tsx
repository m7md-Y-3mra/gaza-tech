'use client';

import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { InfiniteScrollSentinel } from '@/components/infinite-scroll-sentinel';
import { getListingsAction } from '@/modules/listings/actions';
import { ListingCardItem, ListingsFilters } from '@/modules/listings/queries';
import { ListingCardSkeleton } from '../listing-card';
import ListingsGrid from '../listings-grid';
import { DEFAULT_LIMIT_NUMBER } from '@/constants/pagination';

type LoadMoreProps = {
  filters: ListingsFilters;
  initialHasMore: boolean;
};

const ListingCardSkeletonGrid = () => (
  <div className="col-span-1 mt-6 grid grid-cols-1 gap-6 sm:col-span-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <ListingCardSkeleton key={i} />
    ))}
  </div>
);

const fetchListings = (params: {
  filters: ListingsFilters;
  page: number;
  limit: number;
}) =>
  getListingsAction({
    filters: params.filters,
    page: params.page,
    limit: params.limit,
  });

const LoadMore = ({ filters, initialHasMore }: LoadMoreProps) => {
  const { items, isLoading, error, hasMore, retry, sentinelRef } =
    useInfiniteScroll<ListingCardItem, ListingsFilters>({
      fetchFn: fetchListings,
      filters,
      initialItems: [],
      initialHasMore,
      limit: DEFAULT_LIMIT_NUMBER,
    });

  return (
    <>
      <ListingsGrid listings={items} className="mt-6" />

      <InfiniteScrollSentinel
        sentinelRef={sentinelRef}
        isLoading={isLoading}
        error={error}
        hasMore={hasMore}
        retry={retry}
        skeleton={<ListingCardSkeletonGrid />}
      />
    </>
  );
};

export default LoadMore;
