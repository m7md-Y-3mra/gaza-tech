# Spec Review: 005-shared-infinite-scroll

- Branch: 005-shared-infinite-scroll
- Review file: 001review.md

## Summary

- Overall status: **PARTIAL**
- High-risk issues: 1 BLOCKER (TypeScript type error), 1 HIGH (retry sets hasMore incorrectly on error), 1 MED (dead file)
- Missing tests / regression risk: No automated tests (manual testing only per plan.md). Manual verification tasks T007, T011, T014 are not yet done.
- Test suite results: N/A (no test framework configured)
- Lint results: Prettier warnings on spec files only (non-production); **1 TypeScript error** in LoadMore.tsx
- Type-check results: 1 error — `FetchFn` type mismatch in LoadMore.tsx

## Task-by-task Verification

### Task T001: Verify react-intersection-observer and pagination constants

- Spec requirement: `react-intersection-observer` ^10.0.2 installed; `DEFAULT_PAGE_NUMBER` and `DEFAULT_LIMIT_NUMBER` exported from `constants/pagination.ts`
- Implementation found:
  - Files: `package.json`, `constants/pagination.ts`
  - Key symbols: `"react-intersection-observer": "^10.0.2"`, `DEFAULT_PAGE_NUMBER = 1`, `DEFAULT_LIMIT_NUMBER = 4`
- Status: **PASS**
- Evidence: Both dependency and constants exist and match spec.

### Task T002: Create barrel export at `components/infinite-scroll-sentinel/index.ts`

- Spec requirement: Barrel file re-exporting sentinel component
- Implementation found:
  - Files: `components/infinite-scroll-sentinel/index.ts`
  - Key symbols: `export { default as InfiniteScrollSentinel }`, `export type { InfiniteScrollSentinelProps }`
- Status: **PASS**
- Evidence: File exists, exports component and types correctly.

### Task T003: Implement `useInfiniteScroll` hook

- Spec requirement (FR-001 through FR-006, FR-009): Generic hook with typed fetch function, filter object, initial items/hasMore, optional limit. Returns items, isLoading, error, hasMore, retry, sentinelRef. Uses intersection observer, prevents concurrent fetches, resets on filter change with AbortController stale detection, stops when items < limit.
- Implementation found:
  - Files: `hooks/use-infinite-scroll.ts`
  - Key symbols: `useInfiniteScroll`, `FetchFn`, `UseInfiniteScrollOptions`, `UseInfiniteScrollReturn`
- Status: **PARTIAL**
- Evidence:
  - ✅ Generic types `TItem`/`TFilters` — no domain imports (FR-009)
  - ✅ `useInView` from `react-intersection-observer` for sentinel detection (FR-003)
  - ✅ `isFetching` ref guard prevents concurrent fetches (FR-006)
  - ✅ `AbortController` for stale request detection — signal NOT passed to fetchFn (FR-005)
  - ✅ `JSON.stringify(filters)` change detection with state reset (FR-005)
  - ✅ Stops when `newItems.length < limit` (FR-004)
  - ✅ Returns all required fields (FR-002)
  - ✅ Default limit from `DEFAULT_LIMIT_NUMBER`
  - ⚠️ On error (L83-84 and L101-103), hook sets `setHasMore(false)`. But `retry` (L138-143) sets `setHasMore(true)` and calls `fetchNextPage()`. However, `fetchNextPage` has `if (isFetching.current || !hasMore) return;` on L62 — the `hasMore` check reads the _current_ state value at the time of the closure, not the value just set by `setHasMore(true)`. Because React batches state updates, by the time `fetchNextPage` runs synchronously after `setHasMore(true)`, `hasMore` is still `false` in the current render closure. This means `retry` _might_ bail out. However, since `retry` sets `isFetching.current = false` and `setHasMore(true)`, the next render will trigger the `useEffect` with `inView` (if sentinel is still in view), which calls `fetchNextPage` with updated `hasMore`. So retry works _indirectly_ through re-render, not directly — this is fragile but functional.
- Problems:
  1. **Retry relies on indirect re-render path** — see HIGH issue below.

### Task T004: Implement `InfiniteScrollSentinel` component

- Spec requirement (FR-007): Client component rendering skeleton during loading, error+retry button on error, nothing when `hasMore=false`, invisible sentinel div otherwise. Uses `useTranslations`.
- Implementation found:
  - Files: `components/infinite-scroll-sentinel/InfiniteScrollSentinel.tsx`
  - Key symbols: `InfiniteScrollSentinel`, `InfiniteScrollSentinelProps`
- Status: **PASS**
- Evidence:
  - ✅ `'use client'` directive
  - ✅ `hasMore=false` → returns `null` (L28)
  - ✅ Error state → error message + retry button (L31-44)
  - ✅ Loading state → renders `skeleton` prop (L48-49)
  - ✅ Idle → invisible sentinel div with `sentinelRef` (L53-59)
  - ✅ `useTranslations('InfiniteScrollSentinel')` for i18n
  - ✅ Semantic `<button>` with `aria-label` (T015 / WCAG AA)
  - ✅ `className` prop supported

### Task T005: Add i18n keys to `messages/en.json`

- Spec requirement: `InfiniteScrollSentinel.error` and `InfiniteScrollSentinel.retry` keys
- Implementation found:
  - Files: `messages/en.json` (L729-732)
  - Key symbols: `"error": "Failed to load more items. Please try again."`, `"retry": "Try Again"`
- Status: **PASS**

### Task T006: Add i18n keys to `messages/ar.json`

- Spec requirement: Arabic translations for sentinel keys
- Implementation found:
  - Files: `messages/ar.json` (L729-732)
  - Key symbols: `"error": "فشل تحميل المزيد من العناصر. يرجى المحاولة مرة أخرى."`, `"retry": "حاول مرة أخرى"`
- Status: **PASS**

### Task T007: Manual verification (US1 — hook and sentinel end-to-end)

- Spec requirement: Confirm items load on scroll, skeleton shows during fetch, loading stops when fewer items than limit returned, sentinel hides when `hasMore=false`
- Status: **UNKNOWN** — Manual testing task, not yet performed (marked `[ ]` in tasks.md)

### Task T008: Refactor LoadMore.tsx to use `useInfiniteScroll`

- Spec requirement (FR-008): Replace manual `useInView` + `useEffect` + state management with `useInfiniteScroll`. Create adapter wrapper for `getListingsAction`.
- Implementation found:
  - Files: `modules/listings/home/components/load-more/LoadMore.tsx`
  - Key symbols: `useInfiniteScroll`, `InfiniteScrollSentinel`, `fetchListings` (adapter wrapper at L24-33)
- Status: **FAIL**
- Evidence:
  - ✅ Uses `useInfiniteScroll` hook with correct parameters
  - ✅ Adapter wrapper `fetchListings` correctly forwards `{ filters, page, limit }` to `getListingsAction`
  - ✅ Passes `initialItems: []`, `initialHasMore`, `filters`, `limit: DEFAULT_LIMIT_NUMBER`
  - ❌ **TypeScript error** on line 38: `FetchFn<ListingCardItem, ListingsFilters>` expects `{ success: boolean; data: { data: TItem[] }; message?: string }` but `getListingsAction` returns `ApiResponseSuccess<GetListingsResult> | ApiResponseError`. `ApiResponseError` has `{ success: false; message: string }` — no `data` property. And `ApiResponseSuccess<GetListingsResult>` has `{ success: true; data: GetListingsResult }` where `GetListingsResult = { data: ListingCardItem[]; count: number }` — the `count` field is extra but that's fine. The real issue is `ApiResponseError` lacks `data`.
- Problems: See BLOCKER Issue 1.

### Task T009: Update LoadMore.tsx rendering with `InfiniteScrollSentinel`

- Spec requirement: Use sentinel for loading/error states with skeleton grid matching existing layout
- Implementation found:
  - Files: `modules/listings/home/components/load-more/LoadMore.tsx` (L49-57)
  - Key symbols: `InfiniteScrollSentinel`, `ListingCardSkeletonGrid`
- Status: **PASS**
- Evidence:
  - ✅ `<InfiniteScrollSentinel>` with all required props
  - ✅ `ListingCardSkeletonGrid` matches existing grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` with 4 skeletons (T016)
  - ✅ Skeleton layout matches pre-refactor `LoadMoreSkeleton.tsx` exactly

### Task T010: Verify `getListingsAction` accepts `{ filters, page, limit }`

- Spec requirement: Confirm action/query accepts the hook's parameter shape
- Implementation found:
  - Files: `modules/listings/queries.ts` (L525-529), `modules/listings/actions.ts` (L119)
  - Key symbols: `getListingsQuery({ filters, page, limit })`, `getListingsAction = errorHandler(getListingsQuery)`
- Status: **PASS**
- Evidence: `getListingsQuery` accepts `{ filters, page = DEFAULT_PAGE_NUMBER, limit = DEFAULT_LIMIT_NUMBER }`. `errorHandler` passes through all args via spread.

### Task T011: Manual verification (US2 — listings page regression)

- Status: **UNKNOWN** — Manual testing task, not yet performed

### Task T012: Verify filter reset logic in hook

- Spec requirement (FR-005): On filter change, abort in-flight, reset items/page/error, fetch page 1
- Implementation found:
  - Files: `hooks/use-infinite-scroll.ts` (L121-135)
- Status: **PASS**
- Evidence:
  - ✅ `filtersKey = JSON.stringify(filters)` as dependency
  - ✅ `abortController.current?.abort()` — marks in-flight as stale
  - ✅ Resets: `setItems(initialItems)`, `page.current = DEFAULT_PAGE_NUMBER`, `setHasMore(initialHasMore)`, `setError(null)`, `isFetching.current = false`, `setIsLoading(false)`
  - Note: Filter reset relies on `ListingsContent` passing `key={JSON.stringify(filters)}` (L115 of ListingsContent.tsx), which completely remounts `LoadMore` rather than using the hook's filter reset. This is functionally correct but means the hook's filter-change detection is bypassed via remount. Both paths lead to correct behavior.

### Task T013: Verify ListingsContent passes updated filters

- Spec requirement: Parent passes updated filters triggering reset
- Implementation found:
  - Files: `modules/listings/home/components/ListingsContent.tsx` (L114-118)
  - Key symbols: `<LoadMore key={JSON.stringify(filters)} filters={filters} initialHasMore={hasMore} />`
- Status: **PASS**
- Evidence: `key={JSON.stringify(filters)}` causes full remount on filter change, which resets all state. `filters` prop is also passed directly.

### Task T014: Manual verification (US3 — filter reset)

- Status: **UNKNOWN** — Manual testing task, not yet performed

### Task T015: Accessibility — retry button uses semantic `<button>` with accessible text

- Spec requirement: WCAG AA compliance
- Implementation found:
  - Files: `components/infinite-scroll-sentinel/InfiniteScrollSentinel.tsx` (L35-42)
- Status: **PASS**
- Evidence: Semantic `<button type="button">` with `aria-label={t('retry')}`, visible focus ring (`focus:ring-2 focus:ring-offset-2 focus:outline-none`), keyboard-accessible.

### Task T016: Verify no CLS regression — skeleton reserves correct space

- Spec requirement: Skeleton grid matches existing `LoadMore` skeleton dimensions
- Implementation found:
  - Files: `LoadMore.tsx` (L16-22) vs `LoadMoreSkeleton.tsx` (L3-11)
- Status: **PASS**
- Evidence: `ListingCardSkeletonGrid` in `LoadMore.tsx` uses identical grid classes (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`) and count (4) as `LoadMoreSkeleton.tsx`.

### Task T017: Evaluate LoadMoreSkeleton.tsx removal

- Spec requirement: Remove if fully replaced by sentinel skeleton prop
- Implementation found:
  - Files: `modules/listings/home/components/load-more/LoadMoreSkeleton.tsx` (still exists)
- Status: **FAIL**
- Evidence: `LoadMoreSkeleton.tsx` is **unused** — no imports found outside specs. Its functionality is duplicated by `ListingCardSkeletonGrid` in `LoadMore.tsx` (L16-22). The file should be deleted per the task.

### Task T018: Run `npm run check` and fix issues

- Spec requirement: Format, lint, type-check all pass
- Status: **FAIL**
- Evidence: `npm run check` fails with:
  - Prettier warnings on spec/config files (non-blocking for production)
  - **TypeScript error** in `LoadMore.tsx:38` — `FetchFn` type mismatch (see Issue 1)

### Task T019: Validate quickstart.md examples match final implementation

- Spec requirement: Integration examples in quickstart.md match actual code
- Status: **PARTIAL**
- Evidence:
  - ✅ Architecture diagram matches actual file structure
  - ✅ Integration example #2 (client component) closely matches actual `LoadMore.tsx`
  - ⚠️ Example #2 uses `fetchFn: getListingsAction` directly (L52) — but actual implementation uses an adapter wrapper `fetchListings` due to type mismatch. Quickstart should note this.
  - ✅ File change summary table is accurate

## Issues List (Consolidated)

### Issue 1: TypeScript type error — `FetchFn` incompatible with `errorHandler` return type

- [x] FIXED
- Severity: **BLOCKER**
- Depends on: none
- Affected tasks: T008, T018
- Evidence: `npm run type-check` fails. `LoadMore.tsx:38` — `FetchFn<ListingCardItem, ListingsFilters>` requires `{ success: boolean; data: { data: TItem[] }; message?: string }` but `errorHandler` returns `ApiResponseSuccess<T> | ApiResponseError`. `ApiResponseError = { success: false; message: string; errors?: ... }` — it has no `data` property.
- Root cause analysis: The `FetchFn` type in `use-infinite-scroll.ts` assumes the fetch function always returns an object with `data`, but `errorHandler` returns a discriminated union where the error case lacks `data`. The hook already handles `!result.success` (L81) and never accesses `result.data` in that branch, so runtime behavior is correct — but TypeScript's type system sees the union and flags `data` as possibly missing.
- Proposed solution (detailed steps):
  1. Edit `hooks/use-infinite-scroll.ts`, change the `FetchFn` return type to make `data` optional:
     ```typescript
     type FetchFn<TItem, TFilters> = (params: {
       filters: TFilters;
       page: number;
       limit: number;
     }) => Promise<{
       success: boolean;
       data?: { data: TItem[] };
       message?: string;
     }>;
     ```
  2. In `fetchNextPage` (L87), add a guard after the success check:
     ```typescript
     if (!result.success || !result.data) {
       setError(result.message ?? 'Failed to load more items');
       setHasMore(false);
       return;
     }
     ```
  3. Update the contract file `specs/005-shared-infinite-scroll/contracts/use-infinite-scroll.ts` to match.
- Test plan: Run `npm run type-check` — should pass with zero errors.
- Fix notes: Made `data` optional in `FetchFn` return type in `hooks/use-infinite-scroll.ts` L19. Added `!result.data` guard in `fetchNextPage` L88. Updated `specs/005-shared-infinite-scroll/contracts/use-infinite-scroll.ts` to match. `npm run type-check` exits 0.

### Issue 2: Retry function has fragile control flow

- [x] FIXED
- Severity: **HIGH**
- Depends on: Issue 1 (if both are fixed, ensure retry still works with updated guard)
- Affected tasks: T003
- Evidence: `hooks/use-infinite-scroll.ts` L138-143. `retry` calls `setHasMore(true)` then immediately calls `fetchNextPage()`. But `fetchNextPage` checks `if (isFetching.current || !hasMore) return;` (L62). Due to React's batching, `hasMore` is still `false` in the current closure when `fetchNextPage` runs synchronously. Retry only works because the state update triggers a re-render → `useEffect` with `inView` fires → calls `fetchNextPage` with updated `hasMore`. This is fragile: if the sentinel is no longer in view when retry is clicked, the fetch won't trigger.
- Root cause analysis: `retry` synchronously calls `fetchNextPage` which reads stale closure state.
- Proposed solution (detailed steps):
  1. In `hooks/use-infinite-scroll.ts`, modify `fetchNextPage` to accept an optional override parameter, or modify `retry` to not call `fetchNextPage` directly but instead trigger a re-render that the `useEffect` picks up. The simplest fix:
     ```typescript
     const retry = useCallback(() => {
       isFetching.current = false;
       setError(null);
       setHasMore(true);
       // Don't call fetchNextPage directly — the useEffect will pick it up
       // on re-render when hasMore becomes true and inView is still true.
       // If sentinel is not in view, user scrolls down again to trigger.
     }, []);
     ```
     But this means retry only works if sentinel is in view. A more robust approach:
  2. Add a `retryTrigger` state counter:
     ```typescript
     const [retryTrigger, setRetryTrigger] = useState(0);
     ```
  3. Update `retry`:
     ```typescript
     const retry = useCallback(() => {
       isFetching.current = false;
       setError(null);
       setHasMore(true);
       setRetryTrigger((prev) => prev + 1);
     }, []);
     ```
  4. Add effect to trigger fetch on retry:
     ```typescript
     useEffect(() => {
       if (retryTrigger > 0 && hasMore && !isFetching.current) {
         fetchNextPage();
       }
     }, [retryTrigger, hasMore, fetchNextPage]);
     ```
     This ensures retry always triggers a fetch regardless of scroll position.
- Test plan: Trigger an error state, click retry while sentinel is both in-view and out-of-view. Both should initiate a new fetch.
- Notes: The current implementation works in the common case (user sees error → clicks retry → sentinel is in view), but fails in edge cases. Consider whether the extra complexity is justified for MVP.

### Issue 3: Dead file — LoadMoreSkeleton.tsx still exists

- [x] FIXED
- Severity: **MED**
- Depends on: none
- Affected tasks: T017
- Evidence: `modules/listings/home/components/load-more/LoadMoreSkeleton.tsx` exists but is not imported anywhere in production code. Its functionality is duplicated by `ListingCardSkeletonGrid` in `LoadMore.tsx` (L16-22).
- Root cause analysis: Task T017 was marked `[x]` (completed) in tasks.md but the file was not removed.
- Proposed solution:
  1. Delete `modules/listings/home/components/load-more/LoadMoreSkeleton.tsx`
  2. Verify no imports reference it: `grep -r "LoadMoreSkeleton" --include="*.ts" --include="*.tsx"` (excluding specs)
- Test plan: Run `npm run type-check` — should pass. Run `npm run build` — should succeed.
- Fix notes: Deleted `modules/listings/home/components/load-more/LoadMoreSkeleton.tsx`. Confirmed no production imports via grep. `npm run check` exits 0.

### Issue 4: Quickstart.md shows direct `getListingsAction` usage without adapter

- [x] FIXED
- Severity: **LOW**
- Depends on: Issue 1
- Affected tasks: T019
- Evidence: `specs/005-shared-infinite-scroll/quickstart.md` L52 shows `fetchFn: getListingsAction` directly, but the actual implementation uses a `fetchListings` adapter wrapper (LoadMore.tsx L24-33). After Issue 1 is fixed (making `data` optional in `FetchFn`), the adapter may or may not still be needed, but the quickstart should reflect the actual pattern.
- Proposed solution:
  1. After Issue 1 is resolved, update quickstart.md example #2 to match actual LoadMore.tsx pattern (with or without adapter, depending on final approach).
- Test plan: Visual review — compare quickstart example with actual LoadMore.tsx code.
- Fix notes: Updated `specs/005-shared-infinite-scroll/quickstart.md` example #2 to show the `fetchListings` adapter wrapper with explicit generic types, matching actual `LoadMore.tsx` implementation. Added comment explaining why adapter is needed (errorHandler discriminated union).

## Fix Plan (Ordered)

1. Issue 1: TypeScript type error — Make `data` optional in `FetchFn` return type to accommodate `errorHandler`'s union type
2. Issue 2: Retry fragility — Add `retryTrigger` state to ensure retry works regardless of scroll position
3. Issue 3: Dead file — Delete unused `LoadMoreSkeleton.tsx`
4. Issue 4: Quickstart mismatch — Update quickstart.md to reflect actual adapter pattern

## Handoff to Coding Model (Copy/Paste)

- **Files to edit:**
  - `hooks/use-infinite-scroll.ts` — Fix `FetchFn` return type (`data` optional), add null guard after success check, add `retryTrigger` mechanism
  - `specs/005-shared-infinite-scroll/contracts/use-infinite-scroll.ts` — Update `FetchFn` type to match
- **Files to delete:**
  - `modules/listings/home/components/load-more/LoadMoreSkeleton.tsx`
- **Files to update (docs):**
  - `specs/005-shared-infinite-scroll/quickstart.md` — Update example #2 to show adapter pattern
- **Exact behavior changes:**
  - `FetchFn` return type: `data` becomes `data?: { data: TItem[] }` (optional)
  - `fetchNextPage`: guard changes from `if (!result.success)` to `if (!result.success || !result.data)`
  - `retry`: triggers fetch via state counter instead of direct call
- **Edge cases:**
  - Retry when sentinel is out of viewport
  - Error response with no `data` field (now handled by optional type)
- **Tests to add/update:** None (no test framework). Manual verification: T007, T011, T014.
- **Suggested commit breakdown:**
  1. `fix(hooks): make FetchFn data optional to support errorHandler union type` — fixes Issue 1
  2. `fix(hooks): add retryTrigger for robust retry behavior` — fixes Issue 2
  3. `chore: remove unused LoadMoreSkeleton.tsx` — fixes Issue 3
  4. `docs: update quickstart.md to reflect adapter pattern` — fixes Issue 4
