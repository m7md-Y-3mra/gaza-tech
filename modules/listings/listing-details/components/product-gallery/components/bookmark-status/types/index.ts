export type BookmarkStatusClientProps = {
  listingId: string;
  initialIsBookmarked: boolean;
};

export type useBookmarkStatusProps = {
  initialIsBookmarked: BookmarkStatusClientProps['initialIsBookmarked'];
  listingId: BookmarkStatusClientProps['listingId'];
};
