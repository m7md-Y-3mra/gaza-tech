import SearchBar from './components/search-bar/SearchBar';
import CategoryFilters from './components/category-filters/CategoryFilters';
import ListingsToolbar from './components/listings-toolbar';
import ActiveFilters from './components/active-filters';
import ListingsGrid from './components/listings-grid';

const ListingsPage = () => {
  return (
    <div className="bg-background-alt">
      <div className="container mx-auto px-4 pb-24 lg:px-6 lg:pb-8">
        <SearchBar />
        <CategoryFilters />
        <ListingsToolbar />
        <ActiveFilters />
        <ListingsGrid />
      </div>
    </div>
  );
};

export default ListingsPage;
