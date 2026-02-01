import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import BookmarkStatusClient from './BookmarkStatusClient';
import BookmarkStatusSkeleton from './BookmarkStatusSkeleton';
import BookmarkStatusError from './BookmarkStatusError';

interface BookmarkStatusProps {
  listingId: string;
}

// export async function checkIsBookmarked(listingId: string) {}

// async function BookmarkStatusData({ listingId }: BookmarkStatusProps) {
//   // const user = await authHandler();
//   // const client = await createClient();

//   // const { data, error } = await client
//   //   .from('bookmarks')
//   //   .select('listing_id')
//   //   .eq('user_id', user.id)
//   //   .eq('listing_id', listingId)
//   //   .maybeSingle();

//   // if (error) {
//   //   throw error;
//   // }

//   // const result = !!data;
//   const initialIsBookmarked = true;

//   return (
//     <BookmarkStatusClient
//       listingId={listingId}
//       initialIsBookmarked={initialIsBookmarked}
//     />
//   );
// }

const BookmarkStatus = ({ listingId }: BookmarkStatusProps) => {
  const initialIsBookmarked = true;
  return (
    // <ErrorBoundary FallbackComponent={BookmarkStatusError}>
    //   <Suspense fallback={<BookmarkStatusSkeleton />}>
    <BookmarkStatusClient
      listingId={listingId}
      initialIsBookmarked={initialIsBookmarked}
    />
    // <p>lkjsdl</p>
    // </Suspense>
    // </ErrorBoundary>
  );
};

export default BookmarkStatus;
