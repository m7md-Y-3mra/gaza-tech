# Research: Community Feed Page

## 1. nuqs v2 with Next.js 16 App Router

**Decision**: Use `nuqs` v2 `useQueryStates` on the client and `createSearchParamsCache` on the server for type-safe URL state.

**Rationale**: nuqs v2 is already installed (`^2.8.8`). It handles shallow URL updates without causing full re-renders, integrates with Next.js App Router search params, and supports debounce via external `useDebounce` or manual `setTimeout`.

**Pattern**:

```ts
// Server (page.tsx)
import { createSearchParamsCache, parseAsString } from 'nuqs/server';

const searchParamsCache = createSearchParamsCache({
  category: parseAsString.withDefault(''),
  q: parseAsString.withDefault(''),
});

// Page server component reads initial values for SSR
const { category, q } = searchParamsCache.parse(await searchParams);

// Client (FeedFilters.tsx)
import { useQueryStates, parseAsString } from 'nuqs';

const [filters, setFilters] = useQueryStates(
  {
    category: parseAsString.withDefault(''),
    q: parseAsString.withDefault(''),
  },
  { shallow: true }
);
```

**Alternatives considered**: `useSearchParams` + `router.push` (causes full navigation), `useState` only (not URL-persistent).

---

## 2. Search Debounce (300ms) with Immediate Clear

**Decision**: Use a local `inputValue` state with `useEffect` + `setTimeout` for the 300ms debounce. When the input value is empty string, push update immediately (no debounce).

**Rationale**: The spec requires 300ms debounce on non-empty search and immediate update on clear (FR-005). This is a simple pattern that avoids adding a `use-debounce` dependency.

```ts
const [inputValue, setInputValue] = useState(filters.q);

useEffect(() => {
  if (inputValue === '') {
    setFilters({ q: '' }); // immediate
    return;
  }
  const timer = setTimeout(() => setFilters({ q: inputValue }), 300);
  return () => clearTimeout(timer);
}, [inputValue]);
```

**Alternatives considered**: `use-debounce` library (adds dependency for trivial logic).

---

## 3. Filter Reset on Change + Infinite Scroll Integration

**Decision**: The `useInfiniteScroll` hook already handles filter resets via `JSON.stringify(filters)` comparison in a `useEffect`. When `filters` (category + search) change, it resets `items` to `initialItems` and `page` to 1.

**Rationale**: The hook is already implemented this way (see `hooks/use-infinite-scroll.ts:135-149`). We pass `filters` as the hook's `filters` prop; when the URL state changes, the hook gets new `filters` and resets automatically.

**Key nuance**: `initialItems` passed to the hook must be the SSR first page. When the user changes filters, the hook resets to `initialItems` (page 1 of the SSR render). But the SSR initialItems are for the initial URL state, not the new filter. This means after a filter change, the hook must discard the SSR items and re-fetch page 1.

**Resolution**: We derive `initialItems` from the **current** filters at SSR time. After hydration, when the client changes filters, the hook resets to `[]` (empty) and the client fetches page 1 fresh. We handle this by passing `initialItems: []` to the hook on client transitions, and only use the SSR items for the first hydration. Use a `useRef` to detect "is this the first render":

```ts
const isFirstRender = useRef(true);
const items = isFirstRender.current ? ssrItems : [];
// reset flag after first filter change
```

Actually the cleaner approach: the hook resets `items` to `initialItems` on filter change. If we always pass `initialItems` as the SSR items, the reset would incorrectly restore them. Instead, we track filter changes in the parent and re-key the FeedList component to force a full reset (unmount + remount). Or better, pass `initialItems` only when filters match the SSR filters; otherwise pass `[]`.

**Final approach**:

```tsx
// CommunityFeedPage (server) passes ssrFilters and ssrItems
// FeedList (client) computes:
const filtersMatchSsr = category === ssrFilters.category && q === ssrFilters.q;
const effectiveInitial = filtersMatchSsr ? ssrItems : [];
```

This ensures SSR hydration works correctly and client-side filter changes start fresh from page 1.

---

## 4. Supabase RPC: Adding Search Support

**Decision**: Modify the `get_community_feed` PostgreSQL function to accept an optional `p_search text DEFAULT NULL` parameter and filter by `title ILIKE '%' || p_search || '%'` when non-null/non-empty.

**Rationale**: Search must be server-side to work with pagination (FR-003, FR-007). Client-side filtering would break pagination since only the current page would be filtered.

**Migration required**: A new Supabase migration that replaces the existing `get_community_feed` function signature. This is the only DB change for this phase.

```sql
-- Add p_search parameter
CREATE OR REPLACE FUNCTION get_community_feed(
  p_page   int,
  p_limit  int,
  p_category text DEFAULT NULL,
  p_search   text DEFAULT NULL
)
...
WHERE cp.content_status = 'published'
  AND (p_category IS NULL OR cp.post_category = p_category)
  AND (p_search IS NULL OR p_search = '' OR cp.title ILIKE '%' || p_search || '%')
...
```

**Alternatives considered**: Full-text search with `tsvector` (over-engineered for V1 title-only search per spec assumptions).

---

## 5. Mobile FAB Positioning (RTL-aware)

**Decision**: Use Tailwind's logical property `end-4` instead of `right-4` for the FAB position. `end-4` maps to `right` in LTR and `left` in RTL automatically with Tailwind v4 + the `dir` attribute on `<html>`.

```tsx
<div className="fixed bottom-6 end-4 z-40 md:hidden">
```

**Rationale**: The spec (FR-018) requires RTL mirroring of directional elements. The locale layout already sets `dir` on the html element.

**Alternatives considered**: Explicit `ltr:right-4 rtl:left-4` (verbose and redundant with logical properties).

---

## 6. Category Tabs — Horizontal Scroll on Mobile

**Decision**: Use `overflow-x-auto` with `scrollbar-none` on the tabs container. Each tab is a `<button>` with `flex-shrink-0` to prevent wrapping.

**Rationale**: FR-003 requires horizontally scrollable category tabs. The shadcn `Tabs` component can be used for semantic tab behavior, but plain buttons in a scrollable flex container work equally well and are simpler for this pattern. Will use the shadcn `Tabs` component for accessibility (ARIA role="tablist" etc.).

**Pattern**:

```tsx
<div className="overflow-x-auto scrollbar-none -mx-4 px-4">
  <div className="flex gap-2 min-w-max">
    {CATEGORY_TABS.map(tab => <TabButton key={tab.value} ... />)}
  </div>
</div>
```

---

## 7. SEO Metadata (FR-016)

**Decision**: Add `generateMetadata` function to the community page route with locale-aware title/description, using `getTranslations`.

```ts
export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'CommunityFeed' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}
```

**Alternatives considered**: Static `export const metadata` — cannot be locale-aware.
