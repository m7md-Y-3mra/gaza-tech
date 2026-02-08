import { getGroupedCategoriesAction, getLocationsAction } from '../../actions';
import ListingFormClient from './ListingFormClient';

const ListingForm = async () => {
  // Fetch grouped categories and locations in parallel
  const [categoriesResult, locationsResult] = await Promise.all([
    getGroupedCategoriesAction(),
    getLocationsAction(),
  ]);

  // Handle categories
  if (!categoriesResult.success) {
    throw new Error(categoriesResult.message || 'Failed to fetch categories');
  }

  // Handle locations
  if (!locationsResult.success) {
    throw new Error(locationsResult.message || 'Failed to fetch locations');
  }

  const locations = locationsResult.data.map((loc) => ({
    value: loc.location_id,
    label: loc.name,
  }));

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-green-50">
      <div className="container mx-auto px-6 py-8">
        <ListingFormClient
          mode="create"
          groupedCategories={categoriesResult.data}
          locations={locations}
        />
      </div>
    </div>
  );
};

export default ListingForm;
