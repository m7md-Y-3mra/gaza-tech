import { getLocationsAction } from '@/modules/listings/actions';
import FilterModalClient from './FilterModalClient';

const FilterModal = async () => {
  const locationsRes = await getLocationsAction();
  if (!locationsRes.success) {
    throw new Error(locationsRes.message || 'Failed to fetch locations');
  }
  const locations = locationsRes.data.map((location) => ({
    id: location.location_id,
    name: location.name,
  }));

  return <FilterModalClient locations={locations} />;
};

export default FilterModal;
