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

const ListingsContent = async () => {
  const listingsRes = await getListingsAction({
    filters: {},
  });
  if (!listingsRes.success) {
    throw Error('Failed to fetch listings');
  }

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
        <ActiveFilters />
        <ListingsGridWithTitle listings={listingsRes.data.data} />
        <LoadMore />
        <ErrorBoundary FallbackComponent={FilterModalError}>
          <Suspense fallback={<FilterModalSkeleton />}>
            <FilterModal />
          </Suspense>
        </ErrorBoundary>
      </FilterOpenProvider>
    </div>
  );
};

export default ListingsContent;
