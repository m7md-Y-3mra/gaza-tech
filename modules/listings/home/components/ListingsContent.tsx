import { FilterOpenProvider } from '../providers/FilterOpenProvider';
import SearchBar from './search-bar/SearchBar';
import CategoryFilters from './category-filters/CategoryFilters';
import ListingsToolbar from './listings-toolbar';
import ActiveFilters from './active-filters';
import ListingsGrid from './listings-grid';
import FilterModal from './filter-modal';

const ListingsContent = () => {
  return (
    <div className="container mx-auto px-4 pb-24 lg:px-6 lg:pb-8">
      <FilterOpenProvider>
        <SearchBar />
        <CategoryFilters />
        <ListingsToolbar />
        <ActiveFilters />
        <ListingsGrid />
        <FilterModal />
      </FilterOpenProvider>
    </div>
  );
};

export default ListingsContent;
