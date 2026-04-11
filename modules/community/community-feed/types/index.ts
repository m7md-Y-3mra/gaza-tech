import type { FeedPost, PostCategory } from '@/modules/community/types';

export type FeedFilters = {
  category: PostCategory | '';
  q: string;
};

export type SsrFeedState = {
  items: FeedPost[];
  hasMore: boolean;
  filters: FeedFilters;
};
