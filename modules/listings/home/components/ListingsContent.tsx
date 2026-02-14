'use client';

import { useState } from 'react';
import SearchBar from './search-bar/SearchBar';
import CategoryFilters from './category-filters/CategoryFilters';
import ListingsToolbar from './listings-toolbar';
import ActiveFilters from './active-filters';
import ListingsGrid from './listings-grid';
import FilterModal from './filter-modal';

const ListingsContent = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 pb-24 lg:px-6 lg:pb-8">
      <SearchBar />
      <CategoryFilters />
      <ListingsToolbar onFilterOpen={() => setIsFilterOpen(true)} />
      <ActiveFilters />
      <ListingsGrid />
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </div>
  );
};

export default ListingsContent;
