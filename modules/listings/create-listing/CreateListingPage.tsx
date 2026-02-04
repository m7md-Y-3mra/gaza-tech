'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import ListingForm from '../components/listing-form';
import { getCategoriesAction, getLocationsAction } from '../actions';
import { Loader2 } from 'lucide-react';

/**
 * Create Listing Page Component
 * Fetches categories and locations, then renders the ListingForm
 */
const CreateListingPage = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [locations, setLocations] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch categories and locations in parallel
        const [categoriesResult, locationsResult] = await Promise.all([
          getCategoriesAction(),
          getLocationsAction(),
        ]);

        // Handle categories
        if (!categoriesResult.success) {
          throw new Error(
            categoriesResult.message || 'Failed to fetch categories'
          );
        }
        const categoriesData = await categoriesResult.data;
        setCategories(
          categoriesData.map((cat) => ({
            value: cat.marketplace_category_id,
            label: cat.name,
          }))
        );

        // Handle locations
        if (!locationsResult.success) {
          throw new Error(
            locationsResult.message || 'Failed to fetch locations'
          );
        }
        const locationsData = await locationsResult.data;
        setLocations(
          locationsData.map((loc) => ({
            value: loc.location_id,
            label: loc.name,
          }))
        );
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load form data'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSuccess = (listingId: string) => {
    router.push(`/listings/${listingId}`);
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-destructive bg-destructive/10 rounded-lg border-2 p-6 text-center">
          <h2 className="text-destructive mb-2 text-xl font-bold">
            Error Loading Form
          </h2>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-primary hover:bg-primary/90 mt-4 rounded px-4 py-2 text-white"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Listing</h1>
        <p className="text-muted-foreground mt-2">
          Fill in the details below to create your listing
        </p>
      </div>

      <ListingForm
        mode="create"
        categories={categories}
        locations={locations}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default CreateListingPage;
