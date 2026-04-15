# Quickstart: Shared Infinite Scroll

## Overview

This feature extracts infinite scroll logic from the listings module into a shared, generic `useInfiniteScroll` hook and `InfiniteScrollSentinel` component, enabling any paginated feed (listings, community, etc.) to add infinite scroll with minimal integration code.

## Architecture

```
hooks/
└── use-infinite-scroll.ts          # Generic hook (useInfiniteScroll)

components/
└── infinite-scroll-sentinel/
    ├── InfiniteScrollSentinel.tsx   # Presentational sentinel component
    └── index.ts                    # Public export

modules/listings/home/components/
└── load-more/
    └── LoadMore.tsx                # Refactored to use shared hook
```

## Integration Example

### 1. Server Component (fetches first page)

```tsx
// Server component — renders first page + passes to client
const listingsRes = await getListingsAction({ filters });
const listings = listingsRes.data.data;
const hasMore = listings.length < listingsRes.data.count;

return (
  <>
    <ListingsGrid listings={listings} />
    <LoadMore filters={filters} initialHasMore={hasMore} />
  </>
);
```

### 2. Client Component (infinite scroll)

```tsx
'use client';

import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { InfiniteScrollSentinel } from '@/components/infinite-scroll-sentinel';
import { getListingsAction } from '@/modules/listings/actions';
import { ListingCardItem, ListingsFilters } from '@/modules/listings/queries';
import { DEFAULT_LIMIT_NUMBER } from '@/constants/pagination';

// Adapter: wraps the server action to match the FetchFn<TItem, TFilters> contract.
// Required because errorHandler's return type (ApiResponseSuccess | ApiResponseError)
// is a discriminated union — `data` only exists on the success branch.
const fetchListings = (params: {
  filters: ListingsFilters;
  page: number;
  limit: number;
}) =>
  getListingsAction({
    filters: params.filters,
    page: params.page,
    limit: params.limit,
  });

const LoadMore = ({ filters, initialHasMore }) => {
  const { items, isLoading, error, hasMore, retry, sentinelRef } =
    useInfiniteScroll<ListingCardItem, ListingsFilters>({
      fetchFn: fetchListings, // Adapter, not the action directly
      filters,
      initialItems: [], // LoadMore only handles page 2+
      initialHasMore,
      limit: DEFAULT_LIMIT_NUMBER,
    });

  return (
    <>
      <ListingsGrid listings={items} />
      <InfiniteScrollSentinel
        sentinelRef={sentinelRef}
        isLoading={isLoading}
        error={error}
        hasMore={hasMore}
        retry={retry}
        skeleton={<ListingCardSkeletonGrid />}
      />
    </>
  );
};
```

### 3. New Module Integration (e.g., Community Feed)

```tsx
'use client';

const CommunityFeedLoadMore = ({ filters, initialHasMore }) => {
  const { items, isLoading, error, hasMore, retry, sentinelRef } =
    useInfiniteScroll({
      fetchFn: getCommunityPostsAction,
      filters,
      initialItems: [],
      initialHasMore,
    });

  return (
    <>
      <PostList posts={items} />
      <InfiniteScrollSentinel
        sentinelRef={sentinelRef}
        isLoading={isLoading}
        error={error}
        hasMore={hasMore}
        retry={retry}
        skeleton={<PostCardSkeleton count={3} />}
      />
    </>
  );
};
```

## Key Design Decisions

1. **Server-first**: First page is always server-rendered. The hook handles page 2+ only.
2. **Generic**: Hook uses TypeScript generics — zero domain imports.
3. **AbortController**: Filter changes abort in-flight requests before resetting state.
4. **Existing dependency**: Uses `react-intersection-observer` (already installed).
5. **Backward compatible**: `LoadMore` keeps its existing props; `ListingsContent` unchanged.

## File Change Summary

| File                                                              | Change                                                    |
| ----------------------------------------------------------------- | --------------------------------------------------------- |
| `hooks/use-infinite-scroll.ts`                                    | **New** — shared hook                                     |
| `components/infinite-scroll-sentinel/InfiniteScrollSentinel.tsx`  | **New** — sentinel component                              |
| `components/infinite-scroll-sentinel/index.ts`                    | **New** — barrel export                                   |
| `modules/listings/home/components/load-more/LoadMore.tsx`         | **Modified** — refactored internals                       |
| `modules/listings/home/components/load-more/LoadMoreSkeleton.tsx` | **Unchanged** or removed if sentinel replaces it          |
| `messages/en.json`                                                | **Modified** — add sentinel i18n keys (retry button text) |
| `messages/ar.json`                                                | **Modified** — add sentinel i18n keys (retry button text) |
