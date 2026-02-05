import { ErrorBoundary } from 'react-error-boundary';
import ListingForm, {
  ListingFormSkeleton,
  ListingFormError,
} from '../components/listing-form';
import { Suspense } from 'react';

const CreateListingPage = async () => {
  return (
    <ErrorBoundary FallbackComponent={ListingFormError}>
      <Suspense fallback={<ListingFormSkeleton />}>
        <ListingForm />
      </Suspense>
    </ErrorBoundary>
  );
};

export default CreateListingPage;
