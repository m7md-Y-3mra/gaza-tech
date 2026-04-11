# Quickstart: Community Feed Page

## Prerequisites

All prior phases must be complete and merged:

- Phase 1 (`005`): `useInfiniteScroll` hook + `InfiniteScrollSentinel` ✅
- Phase 2 (`006`): `getCommunityFeedQuery` / `getCommunityFeedAction` ✅
- Phase 3 (`007`): `PostCard` + `PostCardSkeleton` ✅

`nuqs` ^2.8.8 is already in `package.json`. ✅

## Development Flow

```bash
# 1. Start dev server
npm run dev

# 2. Navigate to
http://localhost:3000/en/community

# 3. Run checks before every commit
npm run check
```

## Implementation Stages (in order)

Each stage = stop + explicit approval + one commit.

### Stage 1 — Supabase Migration: add search to `get_community_feed`

**Goal**: The `get_community_feed` RPC accepts `p_search text DEFAULT NULL` and applies `ILIKE` filter on `title`.

**Files**:

- `supabase/migrations/<timestamp>_add_search_to_get_community_feed.sql`

**Commit**: `feat(db): add p_search param to get_community_feed RPC`

---

### Stage 2 — Backend: extend `feedQuerySchema` + query + action

**Goal**: `getCommunityFeedAction` accepts and passes through `search`.

**Files**:

- `modules/community/server-schema.ts` — add `search: z.string().trim().max(200).optional()`
- `modules/community/queries.ts` — pass `p_search: search ?? null` to `.rpc()`
- `modules/community/actions.ts` — already delegates; no type change needed if `GetCommunityFeedInput` is re-exported from query

**Commit**: `feat(community): add search param support to feed query and action`

---

### Stage 3 — Module Skeleton: types + empty page shell

**Goal**: Create the `community-feed` module directory with types, an empty `CommunityFeedPage.tsx`, and the route file.

**Files**:

- `modules/community/community-feed/types/index.ts`
- `modules/community/community-feed/CommunityFeedPage.tsx` (returns placeholder `<div>`)
- `modules/community/community-feed/index.ts`
- `app/[locale]/(main)/community/page.tsx` (delegates to `CommunityFeedPage`)

**Commit**: `feat(community-feed): scaffold module skeleton and route`

---

### Stage 4 — Server Page: SSR layout + initial data fetch

**Goal**: `CommunityFeedPage` reads `searchParams`, fetches first page via `getCommunityFeedQuery`, renders the page heading, desktop "Create Post" button, and passes data to placeholder client components.

**Files**:

- `modules/community/community-feed/CommunityFeedPage.tsx`

**Commit**: `feat(community-feed): implement SSR page with initial data fetch`

---

### Stage 5 — FeedFilters: category tabs + search input

**Goal**: Client component with nuqs state, horizontally scrollable tabs, debounced search input.

**Files**:

- `modules/community/community-feed/components/feed-filters/constants.ts`
- `modules/community/community-feed/components/feed-filters/types/index.ts`
- `modules/community/community-feed/components/feed-filters/hooks/useFeedFilters.ts`
- `modules/community/community-feed/components/feed-filters/FeedFilters.tsx`
- `modules/community/community-feed/components/feed-filters/index.ts`

**Commit**: `feat(community-feed): add FeedFilters component with category tabs and search`

---

### Stage 6 — FeedList: infinite scroll client list

**Goal**: Client component that uses `useInfiniteScroll`, renders `PostCard` list, handles SSR hydration correctly.

**Files**:

- `modules/community/community-feed/components/feed-list/FeedList.tsx`
- `modules/community/community-feed/components/feed-list/index.ts`

**Commit**: `feat(community-feed): add FeedList with infinite scroll`

---

### Stage 7 — FeedEmptyState

**Goal**: Empty state shown when no posts match current filters.

**Files**:

- `modules/community/community-feed/components/feed-empty-state/FeedEmptyState.tsx`
- `modules/community/community-feed/components/feed-empty-state/index.ts`

**Commit**: `feat(community-feed): add FeedEmptyState component`

---

### Stage 8 — Mobile FAB (CreatePostFab)

**Goal**: Fixed bottom-end FAB on mobile (`md:hidden`), navigates to `/community/create`.

**Files**:

- `modules/community/community-feed/components/create-post-fab/CreatePostFab.tsx`
- `modules/community/community-feed/components/create-post-fab/index.ts`

**Commit**: `feat(community-feed): add mobile CreatePostFab`

---

### Stage 9 — Navbar: add Community link

**Goal**: Registered users see "Community" in desktop nav and mobile menu.

**Files**:

- `components/layout/navbar/constants.ts` — add `{ href: '/community', labelKey: 'community', allowedRoles: ['registered'] }`

**Commit**: `feat(navbar): add Community navigation link`

---

### Stage 10 — i18n: all translation keys (EN + AR)

**Goal**: Add `CommunityFeed` namespace + `Navbar.community` key to both locale files.

**Files**:

- `messages/en.json`
- `messages/ar.json`

**Commit**: `feat(i18n): add CommunityFeed translations (EN + AR)`

---

### Stage 11 — SEO metadata

**Goal**: `generateMetadata` in the route file with locale-aware title/description.

**Files**:

- `app/[locale]/(main)/community/page.tsx`

**Commit**: `feat(community-feed): add SEO metadata`

---

### Stage 12 — Accessibility + RTL audit

**Goal**: Verify keyboard nav, focus rings, tab ARIA roles, RTL layout in AR locale. Fix any issues found.

**Acceptance**: Run `npm run check`; manually test in AR locale; confirm FAB is on the correct side.

**Commit**: `fix(community-feed): accessibility and RTL fixes`

---

## Key Integration Points

### nuqs — Server cache

```ts
// app/[locale]/(main)/community/page.tsx
import { createSearchParamsCache, parseAsString } from 'nuqs/server';

const paramsCache = createSearchParamsCache({
  category: parseAsString.withDefault(''),
  q: parseAsString.withDefault(''),
});
```

### getCommunityFeedQuery — called directly in server page

```ts
// CommunityFeedPage.tsx (server component)
// Call query directly (not action) to avoid errorHandler wrapping overhead for SSR
import { getCommunityFeedQuery } from '@/modules/community/queries';

const firstPage = await getCommunityFeedQuery({
  page: 1,
  limit: 10,
  category: category || undefined,
  search: q || undefined,
});
```

### getCommunityFeedAction — called by FeedList (client)

```ts
// FeedList.tsx — the fetchFn for useInfiniteScroll
const fetchFn = useCallback(async ({ filters, page, limit }) => {
  return getCommunityFeedAction({
    page,
    limit,
    category: filters.category || undefined,
    search: filters.q || undefined,
  });
}, []);
```

### useInfiniteScroll — filter change handling

The hook already detects filter changes via `JSON.stringify(filters)`. Pass `FeedFilters` as the `filters` prop. The hook resets to `initialItems` on filter change, so pass `effectiveInitial` (empty array when filters differ from SSR) to avoid stale SSR data.
