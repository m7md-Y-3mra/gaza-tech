import { getUserCommunityPostsAction } from '@/modules/community/actions';
import { DEFAULT_LIMIT_NUMBER } from '@/constants/pagination';
import { ProfilePostsTabClient } from './ProfilePostsTabClient';
import type { ProfilePostsTabProps } from './types';

export const ProfilePostsTab = async ({
  userId,
  page,
  isOwner,
}: ProfilePostsTabProps) => {
  const result = await getUserCommunityPostsAction({
    user_id: userId,
    page,
    limit: DEFAULT_LIMIT_NUMBER,
  });

  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch community posts');
  }

  return (
    <ProfilePostsTabClient
      posts={result.data.data}
      postsCount={result.data.total_count}
      pageSize={DEFAULT_LIMIT_NUMBER}
      isOwner={isOwner}
    />
  );
};
