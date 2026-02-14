import SearchBar from './components/search-bar';
import CategoryFilters from './components/category-filters';

const ListingsPage = () => {
  return (
    <div className="bg-background-alt">
      <div className="container mx-auto px-4 pb-20 lg:px-6 lg:pb-24">
        <SearchBar />
        <CategoryFilters />
        {/* Toolbar will be added in Phase 2 */}
        {/* ActiveFilters will be added in Phase 2 */}
        {/* Grid will be added in Phase 3 */}
      </div>
    </div>
  );
};

export default ListingsPage;
