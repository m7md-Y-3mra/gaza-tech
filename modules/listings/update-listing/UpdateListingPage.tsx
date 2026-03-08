import { ErrorBoundary } from 'react-error-boundary';
import ListingForm, {
  ListingFormSkeleton,
  ListingFormError,
} from '../components/listing-form';
import { Suspense } from 'react';

interface UpdateListingPageProps {
  id: string;
}

const UpdateListingPage = async ({ id }: UpdateListingPageProps) => {
  return (
    <ErrorBoundary FallbackComponent={ListingFormError}>
      <Suspense fallback={<ListingFormSkeleton />}>
        <ListingForm mode="update" listingId={id} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default UpdateListingPage;
