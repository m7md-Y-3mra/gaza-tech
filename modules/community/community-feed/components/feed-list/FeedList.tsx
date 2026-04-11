'use client';

import { useMemo, useState } from 'react';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { getCommunityFeedAction } from '@/modules/community/actions';
import {
  PostCard,
  PostCardSkeleton,
} from '@/modules/community/components/post-card';
import { InfiniteScrollSentinel } from '@/components/infinite-scroll-sentinel';
import { useFeedFilters } from '../feed-filters/hooks/useFeedFilters';
import { FeedEmptyState } from '../feed-empty-state';
import type { FeedPost, PostCategory } from '@/modules/community/types';

interface FeedListProps {
  initialItems: FeedPost[];
  initialHasMore: boolean;
  ssrFilters: {
    category: PostCategory | '';
    q: string;
  };
}

export function FeedList({
  initialItems,
  initialHasMore,
  ssrFilters,
}: FeedListProps) {
  const { category, q } = useFeedFilters();
  const filters = useMemo(() => ({ category, q }), [category, q]);

  const filtersMatchSsr =
    filters.category === ssrFilters.category && filters.q === ssrFilters.q;

  const [hasFiltersEverChanged, setHasFiltersEverChanged] = useState(false);

  // Sync state during render if filters changed.
  // This is the recommended pattern for state that depends on props/other state.
  if (!filtersMatchSsr && !hasFiltersEverChanged) {
    setHasFiltersEverChanged(true);
  }

  const useSsrData = filtersMatchSsr && !hasFiltersEverChanged;

  const fetchFn = useMemo(
    () =>
      async ({
        page,
        limit,
        filters: f,
      }: {
        page: number;
        limit: number;
        filters: typeof ssrFilters;
      }) => {
        return getCommunityFeedAction({
          page,
          limit,
          category: f.category || undefined,
          search: f.q || undefined,
        });
      },
    []
  );

  const { items, isLoading, error, hasMore, retry, sentinelRef } =
    useInfiniteScroll<FeedPost, typeof ssrFilters>({
      fetchFn,
      filters,
      initialItems: useSsrData ? initialItems : [],
      initialHasMore: useSsrData ? initialHasMore : true,
      limit: 10,
    });

  if (items.length === 0 && !isLoading && !error && !hasMore) {
    const hasActiveFilters = filters.category !== '' || filters.q !== '';
    return <FeedEmptyState hasActiveFilters={hasActiveFilters} />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {items.map((post) => (
          <PostCard key={post.post_id} post={post} />
        ))}
      </div>

      <InfiniteScrollSentinel
        sentinelRef={sentinelRef}
        hasMore={hasMore}
        isLoading={isLoading}
        error={error}
        retry={retry}
        skeleton={<PostCardSkeleton />}
      />
    </div>
  );
}
