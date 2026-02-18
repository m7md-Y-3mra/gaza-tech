import { getLocationsAction } from '@/modules/listings/actions';
import FilterModalClient from './FilterModalClient';
import { getLocale } from 'next-intl/server';

const FilterModal = async () => {
  const locationsRes = await getLocationsAction();
  if (!locationsRes.success) {
    throw new Error(locationsRes.message || 'Failed to fetch locations');
  }

  const locale = await getLocale();
  const isAr = locale === 'ar';

  const locations = locationsRes.data.map((location) => ({
    id: location.location_id,
    name: isAr ? location.name_ar : location.name,
  }));

  return <FilterModalClient locations={locations} />;
};

export default FilterModal;
