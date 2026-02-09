import {
  getGroupedCategoriesAction,
  getLocationsAction,
  getListingDetailsAction,
} from '../../actions';
import ListingFormClient from './ListingFormClient';
import type { ListingFormInitialData } from './types';

interface ListingFormProps {
  mode?: 'create' | 'update';
  listingId?: string;
}

const ListingForm = async ({
  mode = 'create',
  listingId,
}: ListingFormProps) => {
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

  // For update mode, fetch the listing data
  let initialData: ListingFormInitialData | undefined;
  if (mode === 'update' && listingId) {
    const listingResult = await getListingDetailsAction(listingId);

    if (!listingResult.success || !listingResult.data) {
      throw new Error(
        'Listing not found or you do not have permission to edit it'
      );
    }

    const listing = listingResult.data;
    initialData = {
      title: listing.title,
      description: listing.description,
      price: listing.price,
      currency: listing.currency || 'ILS',
      category_id: listing.category_id,
      product_condition: listing.product_condition,
      location_id: listing.location_id,
      specifications:
        (listing.specifications as ListingFormInitialData['specifications']) ||
        [],
      images: listing.listing_images.map((img) => ({
        id: img.listing_image_id,
        preview: img.image_url,
        isThumbnail: img.is_thumbnail ?? false,
        isExisting: true as const,
      })),
    };
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-green-50">
      <div className="container mx-auto px-6 py-8">
        {mode === 'create' ? (
          <ListingFormClient
            mode="create"
            groupedCategories={categoriesResult.data}
            locations={locations}
          />
        ) : (
          <ListingFormClient
            mode="update"
            listingId={listingId!}
            groupedCategories={categoriesResult.data}
            locations={locations}
            initialData={initialData!}
          />
        )}
      </div>
    </div>
  );
};

export default ListingForm;
