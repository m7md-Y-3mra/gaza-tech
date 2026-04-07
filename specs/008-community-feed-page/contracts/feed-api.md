# Contracts: Community Feed API

## Server Action: `getCommunityFeedAction`

**File**: `modules/community/actions.ts` (existing, extended)

### Signature

```ts
getCommunityFeedAction(input: GetCommunityFeedInput): Promise<ActionResult<Page<FeedPost>>>

type GetCommunityFeedInput = {
  page?:     number   // default 1
  limit?:    number   // default 10, max 50
  category?: PostCategory  // optional; absence = all categories
  search?:   string   // optional; absence = no filter; ILIKE on title
}
```

### Response (success)

```ts
{
  success: true,
  data: {
    data: FeedPost[],   // up to `limit` items
    has_more: boolean,
    next_page: number | null
  }
}
```

### Response (error)

```ts
{ success: false, message: string }
```

### Behaviour

- Delegates to `getCommunityFeedQuery` (server-only)
- `category = undefined` → no category WHERE clause
- `search = undefined | ''` → no title WHERE clause
- `search = 'foo'` → `title ILIKE '%foo%'`
- Results ordered by `published_at DESC`
- `has_more = true` when the DB returned more than `limit` rows (cursor pattern: fetch `limit + 1`, discard last)

---

## Component Interface: `FeedList`

**File**: `modules/community/community-feed/components/feed-list/FeedList.tsx`  
**Type**: Client Component

### Props

```ts
interface FeedListProps {
  initialItems: FeedPost[];
  initialHasMore: boolean;
  ssrFilters: FeedFilters; // filters active at SSR time, for hydration correctness
}
```

### Behaviour

- Uses `useQueryStates` (nuqs) to read current `{ category, q }` from URL
- Computes `filtersMatchSsr = (category === ssrFilters.category && q === ssrFilters.q)`
- Passes `effectiveInitial = filtersMatchSsr ? initialItems : []` to `useInfiniteScroll`
- Calls `getCommunityFeedAction` as the `fetchFn`; maps `{ category: '' → undefined, q: '' → undefined }`
- Renders list of `<PostCard>` + `<InfiniteScrollSentinel>`
- Shows `<FeedEmptyState>` when `items.length === 0 && !isLoading && !error`

---

## Component Interface: `FeedFilters`

**File**: `modules/community/community-feed/components/feed-filters/FeedFilters.tsx`  
**Type**: Client Component

### Props

```ts
interface FeedFiltersProps {
  className?: string;
}
```

### Behaviour

- Reads/writes `{ category, q }` via `useQueryStates` (nuqs, shallow routing)
- Category tabs: clicking a tab sets `category` (or `''` for All) and clears `q` debounce timer
- Search input: controlled on local `inputValue` state; 300ms debounce writes to `q`; clearing `inputValue` writes `q = ''` immediately

---

## Component Interface: `CommunityFeedPage`

**File**: `modules/community/community-feed/CommunityFeedPage.tsx`  
**Type**: Server Component

### Props

```ts
interface CommunityFeedPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  locale: string;
}
```

### Behaviour

- Parses `searchParams` using `createSearchParamsCache` (nuqs/server)
- Calls `getCommunityFeedQuery` directly (server-only, bypasses action wrapper for SSR)
- Passes `Page<FeedPost>` + filters to client components as props
- Renders: page heading, `<FeedFilters>`, `<FeedList>`, `<CreatePostFab>` (mobile FAB)
- Desktop "Create Post" button rendered inline in the heading row

---

## Navbar Contract Extension

**File**: `components/layout/navbar/constants.ts`

### Addition

```ts
{ href: '/community', labelKey: 'community', allowedRoles: ['registered'] }
```

### i18n Key Addition

```json
// messages/en.json — Navbar section
{ "community": "Community" }

// messages/ar.json — Navbar section
{ "community": "المجتمع" }
```

---

## i18n Namespace: `CommunityFeed`

New namespace added to `messages/en.json` and `messages/ar.json`.

```json
{
  "CommunityFeed": {
    "meta": {
      "title": "Community",
      "description": "Browse and share with the Gaza Tech community"
    },
    "pageTitle": "Community",
    "createPost": "Create Post",
    "createPostFab": "New Post",
    "filters": {
      "searchPlaceholder": "Search posts...",
      "all": "All",
      "questions": "Questions",
      "tips": "Tips",
      "news": "News",
      "troubleshooting": "Troubleshooting"
    },
    "emptyState": {
      "title": "No posts found",
      "description": "Be the first to share something with the community.",
      "descriptionFiltered": "No posts match your current filters.",
      "cta": "Create Post"
    },
    "errorState": {
      "title": "Failed to load posts",
      "retry": "Try Again"
    }
  }
}
```
