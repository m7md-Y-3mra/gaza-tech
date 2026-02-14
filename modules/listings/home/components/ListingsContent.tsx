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
import ListingsGrid from './listings-grid';
import {
  FilterModal,
  FilterModalError,
  FilterModalSkeleton,
} from './filter-modal';

const ListingsContent = () => {
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
        <ListingsGrid />
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
