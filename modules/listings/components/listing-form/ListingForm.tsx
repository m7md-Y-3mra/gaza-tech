import { getCategoriesAction, getLocationsAction } from '../../actions';
import ListingFormClient from './ListingFormClient';

const ListingForm = async () => {
  // Fetch categories and locations in parallel
  const [categoriesResult, locationsResult] = await Promise.all([
    getCategoriesAction(),
    getLocationsAction(),
  ]);

  // Handle categories
  if (!categoriesResult.success) {
    throw new Error(categoriesResult.message || 'Failed to fetch categories');
  }

  const categories = categoriesResult.data.map((cat) => ({
    value: cat.marketplace_category_id,
    label: cat.name,
  }));

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
          categories={categories}
          locations={locations}
        />
      </div>
    </div>
  );
};

export default ListingForm;
