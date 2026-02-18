import ListingsContent from './components/ListingsContent';
import { FilterOpenProvider } from './providers/FilterOpenProvider';
import type { ListingsSearchParamsType } from './search-params';

const ListingsPage = ({
  searchParams,
}: {
  searchParams: ListingsSearchParamsType;
}) => {
  return (
    <FilterOpenProvider>
      <ListingsContent searchParams={searchParams} />
    </FilterOpenProvider>
  );
};

export default ListingsPage;
