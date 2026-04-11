# Spec Review: 008-community-feed-page — "All" Category Re-render Issue

- Branch: `008-community-feed-page`
- Review file: `003review.md`

## Summary

- Overall status: **PARTIAL**
- High-risk issues: 1 issue (HIGH) — "All" category uses stale SSR data causing cascading re-renders
- Missing tests / regression risk: No tests
- Type-check: 0 errors
- Lint results: 0 errors, 10 warnings (none in community-feed module)

## Why "All" Re-renders But Other Categories Don't

### The Two Code Paths

The root cause is that **"All" is the only category that takes a different code path** through `FeedList` and `useInfiniteScroll`. Here's why:

**Path A — Specific categories (Questions, Tips, News, Troubleshooting):**
These never match SSR because the page loads without URL params (`category = ''`).

```
filtersMatchSsr = false
→ initialItems = []
→ initialHasMore = true
→ Reset effect: items=[], isLoading=TRUE
→ Auto-fetch effect fires: fetches page 1 fresh
→ Fetch returns: items=freshData, isLoading=false
→ Done. Clean 2-render cycle.
```

**Path B — "All" category (going BACK to All after visiting a specific category):**
`category = ''` matches `ssrFilters.category = ''`, so `filtersMatchSsr = true`.

```
filtersMatchSsr = true
→ initialItems = STALE SSR DATA (from initial page load, could be minutes old)
→ initialHasMore = SSR value (likely true)
→ Reset effect: items=staleSSRData, isLoading=FALSE, page=1
→ Render 1: shows stale SSR data immediately
→ hasMore changed → fetchNextPage recreated → effects re-run
→ If sentinel visible → fetchNextPage fires → isLoading=true
→ Render 2: loading state
→ Fetch returns page 2 (FRESH) appended to page 1 (STALE)
→ Render 3: mixed stale+fresh data
→ If sentinel still visible → fetch page 3 → Render 4...
→ Cascading fetches until viewport is filled
```

### The Three Problems With Path B

1. **Stale data**: SSR data was fetched at page load time. Going Questions → All reuses that stale data for page 1 while fetching fresh data for page 2+. Posts may have been added/removed, causing duplicates or gaps.

2. **Cascading re-renders**: Unlike Path A (which has a single clean loading → data transition), Path B triggers a cascade: stale-render → hasMore-change → fetchNextPage-recreation → effect-refire → fetch → data-append → repeat. Each step causes a React re-render.

3. **`fetchNextPage` dependency chain**: `fetchNextPage` has `hasMore` in its `useCallback` dependency array (`use-infinite-scroll.ts:118`). When `hasMore` changes during reset, `fetchNextPage` is recreated, which triggers the `inView` effect (`line 121-125`) because `fetchNextPage` is in its dependency array. If the sentinel is visible, this immediately triggers a fetch — even though the user just wanted to see page 1.

---

## Task-by-task Verification

### Task T011: FeedList correctly handles filter changes

- Spec requirement: FR-008 — When filters change, the feed MUST reset (clear loaded items, reset to page 1) and refetch from the beginning.
- Status: **PARTIAL**
- Evidence:
  - `FeedList.tsx:54-55` — `filtersMatchSsr` check creates two code paths
  - `FeedList.tsx:61-62` — when `filtersMatchSsr = true`, passes stale SSR `initialItems` instead of `[]`
  - `use-infinite-scroll.ts:142` — `setItems(initialItems)` uses stale SSR data for "All"
- Problem: "All" does NOT "reset and refetch from the beginning" per FR-008. It reuses stale SSR data and appends fresh page 2+ data on top.

---

## Issues List (Consolidated)

### Issue 1: "All" category reuses stale SSR data instead of fetching fresh — causes cascading re-renders

- [x] FIXED
- Severity: **HIGH**
- Depends on: none
- Affected tasks: T011
- Fix notes: Implemented `hasFiltersEverChanged` ref in `FeedList.tsx` to ensure fresh data is fetched after any filter change. Removed debug `console.log` statements.

- Evidence (paths/symbols):
  - `modules/community/community-feed/components/feed-list/FeedList.tsx:54-62` — `filtersMatchSsr` ternary passes SSR data when category returns to `''`
  - `hooks/use-infinite-scroll.ts:137-156` — reset effect uses `initialItems` from closure (stale SSR data for "All")
  - `hooks/use-infinite-scroll.ts:118` — `fetchNextPage` depends on `hasMore`, causing recreation cascade
  - `hooks/use-infinite-scroll.ts:121-125` — inView effect depends on `fetchNextPage`, re-fires when it changes

- Root cause analysis:
  `FeedList` uses `filtersMatchSsr` to decide whether to pass SSR data or empty array to `useInfiniteScroll`. On initial page load, this optimization is correct — SSR data is fresh. But when the user navigates Categories → All, `filtersMatchSsr` becomes `true` again and the SAME stale SSR data from initial page load is reused. This creates an asymmetric code path where "All" renders stale data immediately (no loading state) and then cascades through page 2, 3, etc. fetches.

- Proposed solution (detailed steps):

  **The fix: Track whether filters have ever changed. After the first change, NEVER reuse SSR data.**

  **Step 1: Edit `modules/community/community-feed/components/feed-list/FeedList.tsx`**

  Add a `useRef` to track whether the user has changed filters since mount:

  ```tsx
  // BEFORE (current code, lines 24-64):
  export function FeedList({
    initialItems,
    initialHasMore,
    ssrFilters,
  }: FeedListProps) {
    const { category, q } = useFeedFilters();
    const filters = useMemo(() => ({ category, q }), [category, q]);

    // ... fetchFn ...

    const filtersMatchSsr =
      filters.category === ssrFilters.category && filters.q === ssrFilters.q;

    const { items, isLoading, error, hasMore, retry, sentinelRef } =
      useInfiniteScroll<FeedPost, typeof ssrFilters>({
        fetchFn,
        filters,
        initialItems: filtersMatchSsr ? initialItems : [],
        initialHasMore: filtersMatchSsr ? initialHasMore : true,
        limit: 10,
      });

  // AFTER:
  import { useMemo, useRef, useEffect } from 'react';  // add useRef, useEffect

  export function FeedList({
    initialItems,
    initialHasMore,
    ssrFilters,
  }: FeedListProps) {
    const { category, q } = useFeedFilters();
    const filters = useMemo(() => ({ category, q }), [category, q]);

    // Track whether the user has ever changed filters since initial page load.
    // Once true, we never reuse SSR data — always fetch fresh.
    const hasFiltersEverChanged = useRef(false);

    const filtersMatchSsr =
      filters.category === ssrFilters.category && filters.q === ssrFilters.q;

    // Mark as changed when user selects any non-SSR filter.
    // Once set, it stays true for the lifetime of this component.
    useEffect(() => {
      if (!filtersMatchSsr) {
        hasFiltersEverChanged.current = true;
      }
    }, [filtersMatchSsr]);

    // Only use SSR data on the very first render (before any filter change).
    // After any filter change, always fetch fresh data — even when returning to "All".
    const useSsrData = filtersMatchSsr && !hasFiltersEverChanged.current;

    // ... fetchFn unchanged ...

    const { items, isLoading, error, hasMore, retry, sentinelRef } =
      useInfiniteScroll<FeedPost, typeof ssrFilters>({
        fetchFn,
        filters,
        initialItems: useSsrData ? initialItems : [],
        initialHasMore: useSsrData ? initialHasMore : true,
        limit: 10,
      });
  ```

  **What this changes:**
  - Initial page load: `hasFiltersEverChanged = false`, `filtersMatchSsr = true` → `useSsrData = true` → SSR data used (fast initial load, no flash) ✓
  - User clicks "Questions": `filtersMatchSsr = false` → `hasFiltersEverChanged` set to `true` → `useSsrData = false` → fetches fresh ✓
  - User clicks "All": `filtersMatchSsr = true`, BUT `hasFiltersEverChanged = true` → `useSsrData = false` → fetches fresh (same clean path as other categories) ✓
  - User clicks "Tips": same as "Questions" — fetches fresh ✓

  **Result**: ALL filter changes (including "All") now follow the SAME code path:

  ```
  initialItems = []
  → isLoading = true (skeleton shown)
  → auto-fetch fires
  → fresh data arrives
  → done
  ```

  No more stale SSR data. No more cascading re-renders. Consistent behavior for all tabs.

  **Step 2: (Optional cleanup) Remove `console.log` statements**

  While editing `FeedList.tsx`, also remove the debug logs:
  - Line 31: `console.log({ category, q });` → delete
  - Line 66: `console.log(items);` → delete
  - Line 75: `console.log('Open comments for', postId);` → delete

- Test plan (exact steps to verify after fixing):
  1. Load `/community` — verify SSR data renders immediately (no flash, no extra fetch for page 1)
  2. Click "Questions" — verify skeleton shows, then questions posts load
  3. Click "All" — verify skeleton shows (NOT stale SSR data), then ALL fresh posts load
  4. Click "Tips" → "All" → "News" → "All" — verify each transition shows skeleton → fresh data
  5. Open browser DevTools → Performance tab → record while switching categories. Verify no cascading render spikes on "All"
  6. Open DevTools Console — verify no `console.log` output

- Notes / tradeoffs:
  - **Trade-off**: Going back to "All" now shows a brief skeleton instead of instant SSR data. This is intentional — fresh data > stale data. The skeleton is typically <200ms so it's barely noticeable.
  - **No change to `useInfiniteScroll` hook**: This fix is entirely in `FeedList.tsx`. The shared hook is untouched, so no risk of regressions in other consumers (e.g., listings infinite scroll).

---

## Fix Plan (Ordered)

1. Issue 1: "All" category stale SSR reuse — Add `hasFiltersEverChanged` ref to `FeedList`, use it to gate `useSsrData` so all filter changes (including "All") follow the fresh-fetch path.

---

## Handoff to Coding Model (Copy/Paste)

### Files to edit

| Action | File                                                                 | What to change                                                                                                                                                |
| ------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EDIT   | `modules/community/community-feed/components/feed-list/FeedList.tsx` | Add `useRef` + `useEffect` for `hasFiltersEverChanged`, replace `filtersMatchSsr` with `useSsrData` in `useInfiniteScroll` call, remove 3 `console.log` lines |

### Exact changes

**File: `modules/community/community-feed/components/feed-list/FeedList.tsx`**

1. **Line 3** — Add `useRef` and `useEffect` to the import:

   ```tsx
   // OLD:
   import { useMemo } from 'react';
   // NEW:
   import { useMemo, useRef, useEffect } from 'react';
   ```

2. **After line 30** (after `const filters = useMemo(...)`) — Add the ref and effect:

   ```tsx
   const hasFiltersEverChanged = useRef(false);

   useEffect(() => {
     if (!filtersMatchSsr) {
       hasFiltersEverChanged.current = true;
     }
   }, [filtersMatchSsr]);

   const useSsrData = filtersMatchSsr && !hasFiltersEverChanged.current;
   ```

   Note: `filtersMatchSsr` is currently defined AFTER the `fetchFn` useMemo (line 54). You need to MOVE the `filtersMatchSsr` declaration to BEFORE the new code block. Specifically, move this line:

   ```tsx
   const filtersMatchSsr =
     filters.category === ssrFilters.category && filters.q === ssrFilters.q;
   ```

   to right after `const filters = useMemo(...)`, BEFORE the `hasFiltersEverChanged` ref.

3. **Lines 61-62** — Replace `filtersMatchSsr` with `useSsrData`:

   ```tsx
   // OLD:
   initialItems: filtersMatchSsr ? initialItems : [],
   initialHasMore: filtersMatchSsr ? initialHasMore : true,
   // NEW:
   initialItems: useSsrData ? initialItems : [],
   initialHasMore: useSsrData ? initialHasMore : true,
   ```

4. **Delete line 31**: `console.log({ category, q });`
5. **Delete line 66**: `console.log(items);`
6. **Delete line 75**: `console.log('Open comments for', postId);`

### Final state of FeedList.tsx (key parts)

```tsx
export function FeedList({
  initialItems,
  initialHasMore,
  ssrFilters,
}: FeedListProps) {
  const { category, q } = useFeedFilters();
  const filters = useMemo(() => ({ category, q }), [category, q]);

  const filtersMatchSsr =
    filters.category === ssrFilters.category && filters.q === ssrFilters.q;

  const hasFiltersEverChanged = useRef(false);

  useEffect(() => {
    if (!filtersMatchSsr) {
      hasFiltersEverChanged.current = true;
    }
  }, [filtersMatchSsr]);

  const useSsrData = filtersMatchSsr && !hasFiltersEverChanged.current;

  const fetchFn = useMemo(/* ... unchanged ... */);

  const { items, isLoading, error, hasMore, retry, sentinelRef } =
    useInfiniteScroll<FeedPost, typeof ssrFilters>({
      fetchFn,
      filters,
      initialItems: useSsrData ? initialItems : [],
      initialHasMore: useSsrData ? initialHasMore : true,
      limit: 10,
    });

  if (items.length === 0 && !isLoading && !error && !hasMore) {
    // ... empty state unchanged ...
  }

  // ... rest unchanged ...
}
```

### Edge cases to verify

- Browser refresh with `?category=questions` → SSR fetches with category, `filtersMatchSsr = true`, `hasFiltersEverChanged = false` → uses SSR data correctly
- Direct navigation to `/community` → SSR data used for first render, no unnecessary fetch
- Rapid tab switching (All → Questions → All → Tips) → each transition should abort previous fetch and show skeleton → fresh data

### Suggested commit message

```
fix: prevent stale SSR data reuse when switching back to "All" category

Track whether filters have ever changed since mount. After any filter
change, always fetch fresh data — even when returning to the default
"All" state. This ensures all category switches follow the same clean
code path (skeleton → fresh fetch → render) instead of reusing
potentially stale SSR data that caused cascading re-renders.

Also removes debug console.log statements from FeedList.
```
