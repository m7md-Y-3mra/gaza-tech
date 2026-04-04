# Tasks: Shared Infinite Scroll

**Input**: Design documents from `/specs/005-shared-infinite-scroll/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not included (manual testing only per plan.md — no test framework configured).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify prerequisites and create base file structure

- [ ] T001 Verify `react-intersection-observer` is installed (`^10.0.2`) and `constants/pagination.ts` exports `DEFAULT_PAGE_NUMBER` and `DEFAULT_LIMIT_NUMBER`
- [ ] T002 Create barrel export file at `components/infinite-scroll-sentinel/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared hook types and core hook implementation that BOTH user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Implement the `useInfiniteScroll` hook with types (`FetchFn`, `UseInfiniteScrollOptions`, `UseInfiniteScrollReturn`) in `hooks/use-infinite-scroll.ts` per contract `specs/005-shared-infinite-scroll/contracts/use-infinite-scroll.ts` — includes: generic `TItem`/`TFilters`, `useInView` from `react-intersection-observer`, internal `AbortController` for stale request detection (signal is NOT passed to fetchFn — check `signal.aborted` after promise resolves to discard stale results), `useRef` isFetching guard for concurrent fetch prevention, `JSON.stringify(filters)` change detection with state reset, retry function, and `DEFAULT_LIMIT_NUMBER` default for limit
- [ ] T004 Implement `InfiniteScrollSentinel` client component in `components/infinite-scroll-sentinel/InfiniteScrollSentinel.tsx` per contract `specs/005-shared-infinite-scroll/contracts/infinite-scroll-sentinel.ts` — renders: nothing when `hasMore=false`, error message + retry `<button>` when `error` is non-null, caller-provided `skeleton` when `isLoading=true`, invisible sentinel div otherwise; uses `useTranslations` for retry button and error text

**Checkpoint**: Shared hook and sentinel component are ready — user story implementation can begin

---

## Phase 3: User Story 1 — Developer Integrates Infinite Scroll in Community Feed (Priority: P1) MVP

**Goal**: A reusable `useInfiniteScroll` hook and `InfiniteScrollSentinel` component exist that any new paginated feed can integrate with fewer than 20 lines of code.

**Independent Test**: Create a minimal test page or use the community feed page with `useInfiniteScroll` and a mock/real fetch function. Scrolling to the bottom should trigger loading of the next page, display skeleton placeholders while loading, and stop when no more items are returned.

### Implementation for User Story 1

- [ ] T005 [US1] Add i18n keys for the sentinel component — add `InfiniteScrollSentinel.error` and `InfiniteScrollSentinel.retry` keys to `messages/en.json`
- [ ] T006 [P] [US1] Add i18n keys for the sentinel component — add `InfiniteScrollSentinel.error` and `InfiniteScrollSentinel.retry` keys to `messages/ar.json`
- [ ] T007 [US1] Manual verification: confirm the hook and sentinel work end-to-end by temporarily integrating on a test page or in browser devtools — verify: items load on scroll, skeleton shows during fetch, loading stops when fewer items than limit are returned, sentinel hides when `hasMore=false`

**Checkpoint**: User Story 1 complete — shared hook and sentinel are fully functional and reusable

---

## Phase 4: User Story 2 — Listings Feed Continues Working After Refactor (Priority: P1)

**Goal**: The existing `LoadMore` component is refactored to use `useInfiniteScroll` internally with zero regression — same loading states, error handling, and filter behavior.

**Independent Test**: Navigate to listings page, scroll down past initial results, verify additional listing cards load automatically with skeleton placeholders. Verify error state displays when fetch fails. Verify filter changes reset results.

### Implementation for User Story 2

- [ ] T008 [US2] Refactor `modules/listings/home/components/load-more/LoadMore.tsx` to replace manual `useInView` + `useEffect` + state management with a single `useInfiniteScroll` call — create a wrapper function that adapts `getListingsAction` to the `FetchFn<ListingCardItem, ListingsFilters>` contract (accepting `{ filters, page, limit }` and forwarding to the action), pass existing `filters` prop, `initialItems: []`, `initialHasMore` prop, and `DEFAULT_LIMIT_NUMBER` as limit
- [ ] T009 [US2] Update `LoadMore.tsx` rendering to use `<InfiniteScrollSentinel>` for loading/error states — pass `ListingCardSkeleton` grid as `skeleton` prop, preserve the existing skeleton grid layout (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` with 4 skeletons)
- [ ] T010 [US2] Verify `getListingsAction` in `modules/listings/actions.ts` accepts `{ filters, page, limit }` parameters matching the hook's `FetchFn` contract — confirm `limit` is forwarded to `getListingsQuery`. NOTE: AbortSignal is managed internally by the hook and is NOT passed to server actions (non-serializable)
- [ ] T011 [US2] Manual verification: navigate to listings page → scroll to load more → verify identical behavior to pre-refactor (skeleton grid, new cards appear, loading stops at end, error state on network failure)

**Checkpoint**: User Story 2 complete — listings feed works identically after refactor

---

## Phase 5: User Story 3 — Filter Changes Reset Scroll State (Priority: P2)

**Goal**: When filters change on any page using infinite scroll, loaded items and pagination reset so results reflect the new filter criteria from page 1.

**Independent Test**: On listings page, load multiple pages by scrolling, then change a filter — verify previously loaded items are cleared, pagination resets, and new items matching the filter load from page 1.

### Implementation for User Story 3

- [ ] T012 [US3] Verify (code review) that the `useInfiniteScroll` hook's `JSON.stringify(filters)` effect in `hooks/use-infinite-scroll.ts` correctly: marks in-flight fetch as stale via AbortController (discards result on resolve), resets `items` to `[]`, resets page ref to `DEFAULT_PAGE_NUMBER`, clears error state, and fetches page 1 with new filters
- [ ] T013 [US3] Verify that `ListingsContent` (or parent component) passes updated filters to `LoadMore` when the user changes filter values — confirm the component re-renders with new filter props triggering the hook's reset behavior
- [ ] T014 [US3] Manual verification: on listings page → scroll down to load 2-3 pages → change a filter → verify all previously loaded items clear, skeleton shows, and new results matching the filter appear from page 1

**Checkpoint**: User Story 3 complete — filter reset works correctly across all infinite scroll consumers

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, accessibility, and final validation

- [ ] T015 [P] Ensure `InfiniteScrollSentinel` retry button uses semantic `<button>` element with descriptive accessible text per WCAG AA
- [ ] T016 [P] Verify no CLS regression — skeleton container reserves correct space (matching existing `LoadMore` skeleton grid dimensions)
- [ ] T017 [P] Evaluate whether `modules/listings/home/components/load-more/LoadMoreSkeleton.tsx` is still needed after refactor — remove if fully replaced by sentinel skeleton prop
- [ ] T018 Run `npm run check` (format, lint, type-check) and fix any issues
- [ ] T019 Run quickstart.md validation — verify the integration examples in `specs/005-shared-infinite-scroll/quickstart.md` match the final implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational (Phase 2) — i18n keys for sentinel
- **US2 (Phase 4)**: Depends on Foundational (Phase 2) and US1 (Phase 3, for i18n keys)
- **US3 (Phase 5)**: Depends on US2 (Phase 4) — verifies filter reset in refactored LoadMore
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — No dependencies on other stories
- **User Story 2 (P1)**: Can start after US1 (needs sentinel i18n keys)
- **User Story 3 (P2)**: Can start after US2 (verifies behavior in refactored LoadMore)

### Within Each User Story

- Types/contracts before implementation
- Hook before sentinel
- Sentinel before consumer refactor
- Implementation before manual verification

### Parallel Opportunities

- T005 and T006 (en.json and ar.json i18n keys) can run in parallel
- T015, T016, T017 (polish tasks) can run in parallel
- T003 and T004 could theoretically be parallel but T004 (sentinel) depends on hook return types from T003

---

## Parallel Example: User Story 1

```bash
# Launch i18n tasks together:
Task T005: "Add sentinel i18n keys to messages/en.json"
Task T006: "Add sentinel i18n keys to messages/ar.json"
```

## Parallel Example: Polish Phase

```bash
# Launch polish tasks together:
Task T015: "Accessibility check on retry button"
Task T016: "CLS regression check on skeleton"
Task T017: "Evaluate LoadMoreSkeleton.tsx removal"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (verify deps)
2. Complete Phase 2: Foundational (hook + sentinel)
3. Complete Phase 3: US1 (i18n + verify hook works)
4. Complete Phase 4: US2 (refactor LoadMore)
5. **STOP and VALIDATE**: Listings page works identically
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Shared infrastructure ready
2. US1 → Hook and sentinel reusable (MVP of the shared utility)
3. US2 → Listings refactored with zero regression
4. US3 → Filter reset verified
5. Polish → Accessibility, cleanup, final validation
