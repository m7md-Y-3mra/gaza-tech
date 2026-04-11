import type { FeedPost } from '@/modules/community/types';

export type ProfilePostsTabProps = {
  userId: string;
  page: number;
  isOwner: boolean;
};

export type ProfilePostsTabClientProps = {
  posts: FeedPost[];
  postsCount: number;
  pageSize: number;
  isOwner: boolean;
};
