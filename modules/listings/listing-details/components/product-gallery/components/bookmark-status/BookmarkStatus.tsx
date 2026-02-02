import BookmarkStatusClient from './BookmarkStatusClient';

interface BookmarkStatusProps {
  listingId: string;
}

const BookmarkStatus = ({ listingId }: BookmarkStatusProps) => {
  const initialIsBookmarked = true;
  return (
    <BookmarkStatusClient
      listingId={listingId}
      initialIsBookmarked={initialIsBookmarked}
    />
  );
};

export default BookmarkStatus;
