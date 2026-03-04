import { getUserListingsAction } from '@/modules/user/actions';
import { DEFAULT_LIMIT_NUMBER } from '@/constants/pagination';
import ProfileListingsTabClient from './ProfileListingsTabClient';
import type { ProfileListingsTabProps } from './types';

const ProfileListingsTab = async ({
  userId,
  page,
  isOwner,
}: ProfileListingsTabProps) => {
  const result = await getUserListingsAction({
    userId,
    page,
    limit: DEFAULT_LIMIT_NUMBER,
  });

  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch listings');
  }

  return (
    <ProfileListingsTabClient
      listings={result.data.data}
      listingsCount={result.data.count}
      isOwner={isOwner}
      pageSize={DEFAULT_LIMIT_NUMBER}
    />
  );
};

export default ProfileListingsTab;
