import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { FilterOpenProvider } from '../providers/FilterOpenProvider';
import SearchBar from './search-bar/SearchBar';
import {
  CategoryFilters,
  CategoryFiltersError,
  CategoryFiltersSkeleton,
} from './category-filters';
import ListingsToolbar from './listings-toolbar';
import ActiveFilters from './active-filters';
import {
  FilterModal,
  FilterModalError,
  FilterModalSkeleton,
} from './filter-modal';
import { getListingsAction } from '../../actions';
import LoadMore from './load-more';
import ListingsGridWithTitle from './listings-grid/ListingsGridWithTitle';
import { ListingsSearchParamsType } from '../search-params';
import ListingsGrid from './listings-grid';

const ListingsContent = async ({
  searchParams,
}: {
  searchParams: ListingsSearchParamsType;
}) => {
  const filters = {
    categories: searchParams.categories,
    locations: searchParams.locations,
    conditions: searchParams.conditions,
    minPrice: searchParams.minPrice,
    maxPrice: searchParams.maxPrice,
    currency: searchParams.currency,
    search: searchParams.search,
    sortBy: searchParams.sortBy,
    sortOrder: searchParams.sortOrder,
  };

  const listingsRes = await getListingsAction({ filters });

  const hasError = !listingsRes.success;
  const listings = hasError ? [] : listingsRes.data.data;
  const hasListings = listings.length > 0;

  return (
    <div className="container mx-auto px-4 pb-24 lg:px-6 lg:pb-8">
      <FilterOpenProvider>
        <SearchBar />
        <ErrorBoundary FallbackComponent={CategoryFiltersError}>
          <Suspense fallback={<CategoryFiltersSkeleton />}>
            <CategoryFilters />
          </Suspense>
        </ErrorBoundary>
        <ListingsToolbar />
        {/* <ActiveFilters searchParams={searchParams} /> */}

        {hasError && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-destructive/10 mb-4 rounded-full p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="text-destructive h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Something went wrong</h3>
            <p className="text-muted-foreground mt-1 max-w-md text-sm">
              We couldn&apos;t load the listings. Please try again later.
            </p>
          </div>
        )}

        {!hasError && !hasListings && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-muted mb-4 rounded-full p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="text-muted-foreground h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">No listings found</h3>
            <p className="text-muted-foreground mt-1 max-w-md text-sm">
              Try adjusting your filters or search to find what you&apos;re
              looking for.
            </p>
          </div>
        )}

        {hasListings && (
          <>
            <ListingsGrid listings={listings} />
            <LoadMore filters={filters} />
          </>
        )}
        <ErrorBoundary FallbackComponent={FilterModalError}>
          <Suspense fallback={<FilterModalSkeleton />}>
            <FilterModal searchParams={searchParams} />
          </Suspense>
        </ErrorBoundary>
      </FilterOpenProvider>
    </div>
  );
};

export default ListingsContent;
