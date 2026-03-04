import { getBookmarkedListingsAction } from '@/modules/user/actions';
import { DEFAULT_LIMIT_NUMBER } from '@/constants/pagination';
import ProfileBookmarkTabClient from './ProfileBookmarkTabClient';
import type { ProfileBookmarkTabProps } from './types';

const ProfileBookmarkTab = async ({ page }: ProfileBookmarkTabProps) => {
  const result = await getBookmarkedListingsAction({
    page,
    limit: DEFAULT_LIMIT_NUMBER,
  });

  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch bookmarked listings');
  }

  return (
    <ProfileBookmarkTabClient
      bookmarkedListings={result.data.data}
      bookmarkedCount={result.data.count}
      pageSize={DEFAULT_LIMIT_NUMBER}
    />
  );
};

export default ProfileBookmarkTab;
