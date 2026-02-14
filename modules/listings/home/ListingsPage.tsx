import ListingsContent from './components/ListingsContent';
import { FilterOpenProvider } from './providers/FilterOpenProvider';

const ListingsPage = () => {
  return (
    <FilterOpenProvider>
      <ListingsContent />
    </FilterOpenProvider>
  );
};

export default ListingsPage;
