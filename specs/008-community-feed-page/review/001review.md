# Spec Review: 008-community-feed-page

- Branch: `008-community-feed-page`
- Review file: 001review.md

## Summary

- Overall status: **PARTIAL**
- High-risk issues:
  - **BLOCKER**: Client-side filter changes skip page 1 of results (shared `useInfiniteScroll` hook resets `page.current = 1` but `initialItems = []`, so next fetch goes to page 2)
  - **HIGH**: Infinite scroll error state is never rendered (shared hook sets `hasMore = false` on error; sentinel bails out before checking error)
- Missing tests / regression risk: No automated tests; both blocker issues are in shared infrastructure (`hooks/use-infinite-scroll.ts`, `components/infinite-scroll-sentinel/`)
- Test suite results: N/A (no `pytest`; project uses `npm run check`)
- Lint results: Prettier found 1 formatting issue in `specs/008-community-feed-page/tasks.md` (spec file, not production code). Lint and type-check did not run due to Prettier exit code.

## Task-by-task Verification

### Task T001: Add CommunityFeed i18n to en.json + Navbar.community key

- Spec requirement: FR-017 — all UI text in English and Arabic via i18n
- Implementation found:
  - Files: `messages/en.json:758–785`
  - Key symbols: `CommunityFeed` namespace (meta, pageTitle, createPost, createPostFab, filters, emptyState, errorState); `Navbar.community` at line 616
- Status: **PASS**
- Evidence: All keys from the contract's i18n namespace are present, plus bonus `filters.categoryLabel` key for accessibility.

### Task T002: Add CommunityFeed i18n to ar.json + Navbar.community key

- Spec requirement: FR-017
- Implementation found:
  - Files: `messages/ar.json:758–785`
  - Key symbols: `CommunityFeed` (Arabic translations); `Navbar.community` = "المجتمع" at line 616
- Status: **PASS**
- Evidence: All keys mirror en.json with Arabic translations.

### Task T003: Create community-feed types file

- Spec requirement: data-model.md — FeedFilters, SsrFeedState
- Implementation found:
  - Files: `modules/community/community-feed/types/index.ts`
  - Key symbols: `FeedFilters`, `SsrFeedState`
- Status: **PASS**
- Evidence: Types match the data model. `FeedFilters = { category: PostCategory | ''; q: string }`. `SsrFeedState` holds items, hasMore, filters.

### Task T004: Create barrel export

- Spec requirement: Module barrel at `community-feed/index.ts`
- Implementation found:
  - Files: `modules/community/community-feed/index.ts`
  - Key symbols: `export { CommunityFeedPage }`
- Status: **PASS**
- Evidence: Single re-export of page component.

### Task T005: Add search field to feedQuerySchema

- Spec requirement: contract `GetCommunityFeedInput.search` — optional string for title ILIKE
- Implementation found:
  - Files: `modules/community/server-schema.ts:34`
  - Key symbols: `feedQuerySchema.search = z.string().trim().max(200).optional()`
- Status: **PASS**
- Evidence: Schema extended with optional trimmed string, max 200 chars.

### Task T006: Pass p_search to get_community_feed RPC

- Spec requirement: contract — `search = 'foo'` → `title ILIKE '%foo%'`
- Implementation found:
  - Files: `modules/community/queries.ts:345–349`
  - Key symbols: `p_search: search ?? null` in `getCommunityFeedQuery`
- Status: **PASS**
- Evidence: RPC call includes `p_search` parameter, null when absent.

### Task T007: Create nuqs search-params definition

- Spec requirement: FR-006 — filter state in URL search params
- Implementation found:
  - Files: `modules/community/community-feed/search/index.ts`
  - Key symbols: `communityFeedSearchParams`, `communityFeedSearchCache` (via `createSearchParamsCache`)
- Status: **PASS**
- Evidence: `category` and `q` parsed as strings with empty defaults; server-side cache for SSR parsing.

### Task T008: Create CommunityFeedPage (SSR + layout)

- Spec requirement: FR-001 (render feed at /community), FR-009 (desktop Create Post button), FR-013 (skeleton), FR-014 (error state)
- Implementation found:
  - Files: `modules/community/community-feed/CommunityFeedPage.tsx`
  - Key symbols: `CommunityFeedPage` (async server component), `communityFeedSearchCache.parse`, `getCommunityFeedAction`, `<FeedFilters>`, `<FeedList>`, `<CreatePostFab>`
- Status: **PASS**
- Evidence: SSR initial fetch with filter parsing. Error state rendered on action failure. Desktop button with `hidden md:inline-flex`. Layout: heading row, filters, feed list, FAB.

### Task T009: Create route file

- Spec requirement: Thin route wrapper per project convention
- Implementation found:
  - Files: `app/[locale]/(main)/community/page.tsx`
  - Key symbols: `CommunityFeedPage`, `generateMetadata`
- Status: **PASS**
- Evidence: Route delegates entirely to `CommunityFeedPage`, passing `searchParams`.

### Task T010: Create FeedList component

- Spec requirement: FR-001 (display posts), FR-002 (infinite scroll), FR-013 (skeleton)
- Implementation found:
  - Files: `modules/community/community-feed/components/feed-list/FeedList.tsx`
  - Key symbols: `FeedList`, `useInfiniteScroll`, `PostCard`, `InfiniteScrollSentinel`, `PostCardSkeleton`
- Status: **PARTIAL**
- Evidence: Component correctly integrates infinite scroll, renders PostCards, shows skeletons via InfiniteScrollSentinel.
- Problems:
  1. **Page skip on filter change** — when `filtersMatchSsr` is false, `initialItems = []` and `initialHasMore = true`. The shared `useInfiniteScroll` hook resets `page.current = 1`, so `fetchNextPage` fetches page 2, completely skipping page 1. (See Issue 1)
  2. **Error state suppressed** — shared hook sets `hasMore = false` on error; sentinel returns null before reaching error check. (See Issue 2)
- Proposed fix: See Issues List.
- Proposed tests: After fixing, manually test: change category tab → verify page 1 results appear. Simulate network error → verify error UI appears with retry.

### Task T011: FeedList handles filter changes (re-fetch on nuqs change)

- Spec requirement: FR-008 — filter change resets feed and refetches from page 1
- Implementation found:
  - Files: `modules/community/community-feed/components/feed-list/FeedList.tsx:53–63`
  - Key symbols: `filtersMatchSsr`, `useFeedFilters()`, `useInfiniteScroll` with `filters` prop
- Status: **FAIL**
- Evidence: The `filtersMatchSsr` logic correctly detects when filters diverge from SSR state and passes empty `initialItems`. However, the shared hook's reset sets `page.current = 1` regardless, causing the first client-side fetch to request page 2 instead of page 1.
- Root cause: `hooks/use-infinite-scroll.ts:143` — `page.current = DEFAULT_PAGE_NUMBER` (1) should be `0` when `initialItems` is empty.
- Proposed fix: See Issue 1.

### Task T012: FeedFilters constants (CATEGORY_TABS)

- Spec requirement: FR-003 — tabs: All, Questions, Tips, News, Troubleshooting
- Implementation found:
  - Files: `modules/community/community-feed/components/feed-filters/constants.ts`
  - Key symbols: `CATEGORY_TABS` (5 entries with i18n labelKeys)
- Status: **PASS**
- Evidence: Tabs match spec exactly. `''` for All, then `questions`, `tips`, `news`, `troubleshooting`.

### Task T013: useFeedFilters hook (nuqs + debounce)

- Spec requirement: FR-005 (300ms debounce), FR-006 (URL persistence)
- Implementation found:
  - Files: `modules/community/community-feed/components/feed-filters/hooks/useFeedFilters.ts`
  - Key symbols: `useFeedFilters`, `useQueryStates`, `parseAsString`, `setTimeout 300`
- Status: **PASS**
- Evidence: 300ms debounce on search input. Immediate clear (FR-005). `shallow: true` for client-side URL updates. Syncs local input on external URL changes (back/forward).

### Task T014: FeedFilters component (tabs + search input)

- Spec requirement: FR-003 (category tabs), FR-005 (search bar), FR-017 (i18n), FR-018 (RTL)
- Implementation found:
  - Files: `modules/community/community-feed/components/feed-filters/FeedFilters.tsx`
  - Key symbols: `FeedFilters`, `role="tablist"`, `role="tab"`, `aria-selected`, search `<input>`
- Status: **PARTIAL**
- Evidence: Tabs render correctly with ARIA attributes, horizontally scrollable. Search input with debounce. RTL-aware via `start-3`/`end-3` logical properties.
- Problems: `aria-label="Clear search"` at line 69 is hardcoded in English. Violates FR-017. (See Issue 3)
- Proposed fix: See Issue 3.

### Task T015: Wire FeedFilters into CommunityFeedPage

- Spec requirement: FR-003, FR-005 — filters visible and functional
- Implementation found:
  - Files: `modules/community/community-feed/CommunityFeedPage.tsx:49`
  - Key symbols: `<FeedFilters />`
- Status: **PASS**
- Evidence: FeedFilters rendered between heading and FeedList.

### Task T016: Create FeedEmptyState component

- Spec requirement: FR-012 — empty state with icon + message + CTA
- Implementation found:
  - Files: `modules/community/community-feed/components/feed-empty-state/FeedEmptyState.tsx`
  - Key symbols: `FeedEmptyState`, `hasActiveFilters`, `MessageCircle` icon, Link to `/community/create`
- Status: **PASS**
- Evidence: Shows different descriptions for filtered vs unfiltered empty state. CTA links to post creation.

### Task T017: Wire FeedEmptyState into FeedList

- Spec requirement: FR-012 — show when no posts match
- Implementation found:
  - Files: `modules/community/community-feed/components/feed-list/FeedList.tsx:65–68`
  - Key symbols: `items.length === 0 && !isLoading && !error`
- Status: **PASS**
- Evidence: Correctly shows empty state only when no items, not loading, and no error.

### Task T018: Create CreatePostFab component

- Spec requirement: FR-010 (mobile FAB with pen icon), FR-018 (RTL-aware position)
- Implementation found:
  - Files: `modules/community/community-feed/components/create-post-fab/CreatePostFab.tsx`
  - Key symbols: `CreatePostFab`, `Pen` icon, `md:hidden`, `end-4`, `bottom-6`
- Status: **PASS**
- Evidence: Fixed bottom-right (LTR) / bottom-left (RTL) via `end-4`. Hidden on desktop. Accessible label. Links to `/community/create`.

### Task T019: Wire CreatePostFab into CommunityFeedPage

- Spec requirement: FR-010
- Implementation found:
  - Files: `modules/community/community-feed/CommunityFeedPage.tsx:57`
  - Key symbols: `<CreatePostFab />`
- Status: **PASS**
- Evidence: Rendered inside the page section, after FeedList.

### Task T020: Add Community link to navbar

- Spec requirement: FR-015 — navbar link visible to registered users
- Implementation found:
  - Files: `components/layout/navbar/constants.ts:5`
  - Key symbols: `{ href: '/community', labelKey: 'community', allowedRoles: ['registered'] }`
- Status: **PASS**
- Evidence: Link added with correct href, i18n key, and role restriction.

### Task T021: Add generateMetadata for SEO

- Spec requirement: FR-016 — SEO metadata (title + description)
- Implementation found:
  - Files: `app/[locale]/(main)/community/page.tsx:5–13`
  - Key symbols: `generateMetadata`, `CommunityFeed.meta.title`, `CommunityFeed.meta.description`
- Status: **PASS**
- Evidence: Uses `getTranslations` for locale-aware metadata.

### Task T022: Run npm run check and fix errors

- Spec requirement: QA — clean lint/type/format
- Implementation found:
  - Run: `npm run check`
- Status: **PARTIAL**
- Evidence: Prettier reports formatting issue in `specs/008-community-feed-page/tasks.md`. This blocked lint and type-check from running. The file is a spec document, not production code, so production quality may be fine but the check suite does not pass clean.

## Issues List (Consolidated)

IMPORTANT: Issues ordered by fix dependency (fix A before B if B depends on A).

### Issue 1: Client-side filter change skips page 1 of results

- [x] FIXED
- Severity: **BLOCKER**
- Depends on: none
- Affected tasks: T010, T011
- Evidence:
  - `hooks/use-infinite-scroll.ts:143` — `page.current = DEFAULT_PAGE_NUMBER` (which is `1`, per `constants/pagination.ts:1`)
  - `hooks/use-infinite-scroll.ts:79` — `const nextPage = page.current + 1` (fetches page 2)
  - `modules/community/community-feed/components/feed-list/FeedList.tsx:60` — passes `initialItems: filtersMatchSsr ? initialItems : []`
- Root cause analysis: When filters change client-side, `FeedList` passes `initialItems: []` and `initialHasMore: true` to `useInfiniteScroll`. The hook's reset effect (line 137-149) sets `page.current = DEFAULT_PAGE_NUMBER = 1`, signalling "page 1 is loaded". But page 1 is NOT loaded (items is `[]`). When the sentinel triggers `fetchNextPage`, it computes `nextPage = 1 + 1 = 2`, skipping page 1 entirely. Users see results starting from page 2 after any filter change.
- Proposed solution (detailed steps):
  1. Open `hooks/use-infinite-scroll.ts`
  2. In the reset effect (line ~143), change:
     ```ts
     page.current = DEFAULT_PAGE_NUMBER;
     ```
     to:
     ```ts
     page.current =
       initialItems.length > 0 ? DEFAULT_PAGE_NUMBER : DEFAULT_PAGE_NUMBER - 1;
     ```
     This sets `page.current = 0` when there are no initial items, so the first fetch correctly targets page 1.
- Fix notes: Updated `hooks/use-infinite-scroll.ts` to set `page.current = DEFAULT_PAGE_NUMBER - 1` when `initialItems` is empty in the reset effect.
- Test plan:
  1. Navigate to `/community` — verify page 1 posts render (SSR)
  2. Click a category tab (e.g., "Questions") — verify the feed resets and shows page 1 of filtered results, not page 2
  3. Type a search term, wait for debounce — verify page 1 of search results appears
  4. Clear the search — verify the full feed restarts from page 1
- Notes / tradeoffs: This fix is in the shared `useInfiniteScroll` hook. Verify that other consumers (if any) still work correctly — the change is backward-compatible since any caller providing non-empty `initialItems` will still get `page.current = 1`.

### Issue 2: Infinite scroll error state never rendered

- [x] FIXED
- Severity: **HIGH**
- Depends on: none (independent of Issue 1, but same file)
- Affected tasks: T010 (FR-014 — error state with descriptive message)
- Evidence:
  - `hooks/use-infinite-scroll.ts:89,111` — on fetch error, sets both `setError(...)` and `setHasMore(false)`
  - `components/infinite-scroll-sentinel/InfiniteScrollSentinel.tsx:28-29` — `if (!hasMore) return null;` executes BEFORE `if (error)` check
- Root cause analysis: When a fetch fails, the hook sets `hasMore = false` AND `error = "..."`. The sentinel checks `!hasMore` first and returns `null`, so the error UI (line 32-44) is never reached. Users see the feed stop loading with no explanation.
- Proposed solution (detailed steps):
  1. Open `hooks/use-infinite-scroll.ts`
  2. In `fetchNextPage`, for both the error response branch (line ~89) and the catch block (line ~111), remove `setHasMore(false)`:

     ```ts
     // Before (line ~89):
     setError(result.message ?? 'Failed to load more items');
     setHasMore(false); // REMOVE this line

     // After:
     setError(result.message ?? 'Failed to load more items');
     ```

     ```ts
     // Before (catch, line ~111):
     setError('Failed to load more items');
     setHasMore(false); // REMOVE this line

     // After:
     setError('Failed to load more items');
     ```

     The `retry` callback already sets `setHasMore(true)`, so after retry, fetching resumes. With this fix, when error is set, `hasMore` remains `true`, so the sentinel passes the `!hasMore` check and renders the error UI.

  3. Alternatively (if you want `hasMore = false` as a safety net), reorder the sentinel checks. In `InfiniteScrollSentinel.tsx`, move the error check above the hasMore check:
     ```tsx
     // Move this block ABOVE the `if (!hasMore) return null;`
     if (error) {
       return ( ... );
     }
     if (!hasMore) return null;
     ```
     This approach is safer since it preserves both signals independently.

- Fix notes: Reordered checks in `InfiniteScrollSentinel.tsx` to check `error` before `!hasMore`.
- Test plan:
  1. Simulate network error (e.g., disconnect network, scroll to trigger fetch)
  2. Verify error message and retry button appear
  3. Click retry — verify fetch resumes
- Notes / tradeoffs: Option A (remove `setHasMore(false)` on error) is simpler. Option B (reorder sentinel checks) is safer. Recommend Option B to avoid any side effects in other consumers of the hook.

### Issue 3: Hardcoded English aria-label on clear search button

- [x] FIXED
- Severity: **MED**
- Depends on: none
- Affected tasks: T014 (FR-017 — all UI text in both languages)
- Evidence:
  - `modules/community/community-feed/components/feed-filters/FeedFilters.tsx:69` — `aria-label="Clear search"` (hardcoded English)
- Root cause analysis: The clear button's `aria-label` was not connected to the i18n system.
- Proposed solution (detailed steps):
  1. Add i18n key to `messages/en.json` inside `CommunityFeed.filters`:
     ```json
     "clearSearch": "Clear search"
     ```
  2. Add i18n key to `messages/ar.json` inside `CommunityFeed.filters`:
     ```json
     "clearSearch": "مسح البحث"
     ```
  3. In `FeedFilters.tsx:69`, change:
     ```tsx
     aria-label="Clear search"
     ```
     to:
     ```tsx
     aria-label={t('filters.clearSearch')}
     ```
- Fix notes: Added `clearSearch` i18n keys to `en.json` and `ar.json` and updated `FeedFilters.tsx` to use the localized key.
- Test plan: Switch locale to Arabic, inspect the clear button — verify `aria-label` is in Arabic.
- Notes / tradeoffs: None. Straightforward i18n fix.

### Issue 4: Prettier formatting failure blocks full check suite

- [x] FIXED
- Severity: **LOW**
- Depends on: none
- Affected tasks: T022
- Evidence:
  - `npm run check` output: `specs/008-community-feed-page/tasks.md` has formatting issues
  - Lint and type-check did not run because `check-format` exited non-zero
- Root cause analysis: The tasks.md spec file doesn't match Prettier formatting rules.
- Proposed solution (detailed steps):
  1. Run: `npx prettier --write specs/008-community-feed-page/tasks.md`
  2. Re-run `npm run check` to verify lint and type-check also pass
- Fix notes: Ran Prettier on `specs/008-community-feed-page/tasks.md`.
- Test plan: `npm run check` exits cleanly.
- Notes / tradeoffs: This is a spec doc, not production code. Consider adding `specs/` to `.prettierignore` if spec docs shouldn't be formatted.

## Fix Plan (Ordered)

1. **Issue 1**: Page skip on filter change — set `page.current = initialItems.length > 0 ? DEFAULT_PAGE_NUMBER : DEFAULT_PAGE_NUMBER - 1` in `hooks/use-infinite-scroll.ts` reset effect
2. **Issue 2**: Error state suppressed — reorder checks in `InfiniteScrollSentinel.tsx` to check `error` before `!hasMore`
3. **Issue 3**: Hardcoded aria-label — add `filters.clearSearch` i18n key and use `t('filters.clearSearch')` in `FeedFilters.tsx`
4. **Issue 4**: Prettier formatting — run `npx prettier --write` on tasks.md

## Handoff to Coding Model (Copy/Paste)

- **Files to edit**:
  - `hooks/use-infinite-scroll.ts` (line 143: fix page reset logic)
  - `components/infinite-scroll-sentinel/InfiniteScrollSentinel.tsx` (lines 28-44: reorder error/hasMore checks)
  - `modules/community/community-feed/components/feed-filters/FeedFilters.tsx` (line 69: use i18n for aria-label)
  - `messages/en.json` (add `CommunityFeed.filters.clearSearch`)
  - `messages/ar.json` (add `CommunityFeed.filters.clearSearch`)
  - `specs/008-community-feed-page/tasks.md` (run Prettier)

- **Exact behavior changes**:
  - After Issue 1 fix: client-side filter changes fetch page 1 first (currently skips to page 2)
  - After Issue 2 fix: network errors during infinite scroll show error message + retry button (currently shows nothing)
  - After Issue 3 fix: clear search button has localized aria-label (currently English-only)

- **Edge cases**:
  - Issue 1: Ensure SSR path (initialItems non-empty) still starts at page 2 correctly
  - Issue 2: Ensure retry after error correctly resumes fetching
  - Issue 2: Ensure "end of list" (no error, no more items) still returns null from sentinel

- **Tests to add/update**: None required (no test suite); manual verification per test plans above

- **Suggested commit breakdown**:
  1. `fix: correct page skip on client-side filter change in useInfiniteScroll`
  2. `fix: show error state in InfiniteScrollSentinel when fetch fails`
  3. `fix(i18n): localize clear search button aria-label in FeedFilters`
  4. `chore: format tasks.md with Prettier`
