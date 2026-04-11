# Feature Specification: Shared Infinite Scroll

**Feature Branch**: `005-shared-infinite-scroll`  
**Created**: 2026-04-04  
**Status**: Draft  
**Input**: User description: "Extract infinite scroll logic from listings into a shared reusable hook so both listings and community can use it"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Developer Integrates Infinite Scroll in Community Feed (Priority: P1)

A developer building the community feed page needs a reusable infinite scroll mechanism. Instead of duplicating the scroll logic from listings, they import a shared hook (`useInfiniteScroll`) and a sentinel component, pass in their fetch function and skeleton, and get paginated loading behavior out of the box.

**Why this priority**: This is the core deliverable. Without a generic, reusable hook, every new paginated feed requires copy-pasting and adapting scroll logic, leading to inconsistency and maintenance burden.

**Independent Test**: Create a minimal test page that uses `useInfiniteScroll` with a mock fetch function. Scrolling to the bottom should trigger loading of the next page, display skeleton placeholders while loading, and stop loading when no more items are returned.

**Acceptance Scenarios**:

1. **Given** a page uses `useInfiniteScroll` with a fetch function that returns items, **When** the user scrolls to the sentinel element, **Then** the next page of items is fetched and appended to the list.
2. **Given** a page uses `useInfiniteScroll` and the fetch function returns fewer items than the limit, **When** that response is received, **Then** the hook stops further loading and hides the sentinel.
3. **Given** a page uses `useInfiniteScroll` with custom skeleton via `InfiniteScrollSentinel`, **When** items are loading, **Then** the provided skeleton component is rendered as the loading indicator.

---

### User Story 2 - Listings Feed Continues Working After Refactor (Priority: P1)

The existing listings infinite scroll (`LoadMore` component) is refactored to use the new shared hook internally. From the user's perspective, nothing changes — scrolling down on the listings page still loads more listing cards with the same skeleton placeholders and error handling.

**Why this priority**: Equal to P1 because breaking the existing listings feed is unacceptable. The refactor must be a zero-regression change.

**Independent Test**: Navigate to the listings page, scroll down past the initial results, and verify that additional listings load automatically with skeleton placeholders. Verify error states display correctly when the fetch fails.

**Acceptance Scenarios**:

1. **Given** the listings page with more results than one page, **When** the user scrolls to the bottom, **Then** additional listing cards load identically to the pre-refactor behavior.
2. **Given** the listings page and a network error occurs during load-more, **When** the fetch fails, **Then** an error message is displayed and loading stops.
3. **Given** the listings page with active filters, **When** the user changes a filter, **Then** the infinite scroll state resets and loads fresh results for the new filter.

---

### User Story 3 - Filter Changes Reset Scroll State (Priority: P2)

When a user changes filters (e.g., category, search query) on any page using infinite scroll, the loaded items and pagination reset so results reflect the new filter criteria from page 1.

**Why this priority**: Important for correctness but secondary to the core hook and backward compatibility.

**Independent Test**: On a page using `useInfiniteScroll`, change filter values and verify that previously loaded items are cleared, pagination resets to page 1, and new items matching the filter are loaded.

**Acceptance Scenarios**:

1. **Given** a user has scrolled down and loaded 3 pages of items, **When** they change a filter value, **Then** all previously loaded items are cleared, the page counter resets, and items matching the new filter load from page 1.

---

### Edge Cases

- What happens when the fetch function returns an error on the first additional page? The hook sets an error state, stops the loading sentinel, and exposes a `retry` function that re-attempts the failed fetch.
- What happens when the initial data indicates no more items (`initialHasMore = false`)? The sentinel is never shown and no fetch is attempted.
- What happens when the user scrolls rapidly, triggering multiple intersection events? The hook prevents concurrent fetches — only one fetch runs at a time.
- What happens when the fetch returns an empty array? Loading stops and the sentinel is hidden.
- What happens when filters change while a fetch is in-flight? The hook marks the in-flight request as stale via an internal AbortController and discards its result when it resolves. State resets and page 1 is fetched with the new filters.

## Clarifications

### Session 2026-04-04

- Q: Where should the shared hook and sentinel component live in the project structure? → A: Hook in `hooks/use-infinite-scroll.ts`, sentinel in `components/infinite-scroll-sentinel/`.
- Q: How should the first page of data be loaded — server-rendered or entirely client-side? → A: Server renders first page; hook receives `initialItems` and fetches page 2+ on scroll.
- Q: When a fetch error occurs on load-more, should the user have a way to retry? → A: Hook exposes a `retry` function; sentinel shows a "retry" button on error.
- Q: When filters change while a fetch is in-flight, should the request be aborted or discarded? → A: Mark in-flight request as stale via internal AbortController; discard result when it resolves. Then reset state and fetch page 1 with new filters. (AbortSignal is not passed to the fetch function since server actions cannot receive non-serializable objects.)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a generic `useInfiniteScroll` hook located at `hooks/use-infinite-scroll.ts` that accepts a typed fetch function, filter object, initial items array, initial "has more" flag, and optional page size limit. The hook receives server-rendered first-page data as `initialItems` and begins fetching from page 2 on scroll.
- **FR-002**: The hook MUST return the accumulated list of items, a loading indicator, an error state, a `retry` function for error recovery, and a ref to attach to a sentinel element.
- **FR-003**: The hook MUST automatically fetch the next page when the sentinel element enters the viewport (using intersection observer).
- **FR-004**: The hook MUST stop fetching when the returned items count is less than the page size limit.
- **FR-005**: The hook MUST reset its internal state (items, page counter, error) when the filter object changes. If a fetch is in-flight when filters change, the hook MUST mark the in-flight request as stale via an internal AbortController, discard its result when it resolves, reset state, and fetch page 1 with the new filters. The AbortSignal is NOT passed to the fetch function (server actions cannot receive non-serializable objects).
- **FR-006**: The hook MUST prevent concurrent fetch requests — a new fetch cannot start while one is in progress.
- **FR-007**: System MUST provide an `InfiniteScrollSentinel` component located at `components/infinite-scroll-sentinel/` that renders a caller-provided skeleton while loading is active, shows a retry button on error, and attaches the sentinel ref.
- **FR-008**: The existing listings `LoadMore` component MUST be refactored to use `useInfiniteScroll` internally with no regression to its external behavior or props. The refactor may introduce enhanced error recovery (retry button) via the shared sentinel component — this is an acceptable improvement, not a regression.
- **FR-009**: The hook MUST be fully generic — it must not import or reference any domain-specific types (listings, community, etc.).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Any new paginated feed can be implemented using the shared hook with fewer than 20 lines of integration code (excluding UI rendering).
- **SC-002**: The listings infinite scroll behaves identically before and after the refactor — same loading states, same filter reset behavior — with the addition of a retry button on error states (an enhancement over the previous error-only display).
- **SC-003**: The hook supports any data type and any filter shape without modification to its source code.
- **SC-004**: Users experience no perceivable difference in listings scroll performance or behavior after the refactor.

## Assumptions

- The `react-intersection-observer` package is already installed and available in the project.
- The existing `LoadMore` component's external API (props and rendered output structure) does not need to change — only its internal implementation is refactored.
- The default page size from the existing pagination constants will be used as the default limit if none is specified.
- The fetch function contract follows the existing pattern: accepts `{ filters, page, limit }` and returns `{ success: boolean; data: { data: TItem[] }; message?: string }`. It does NOT receive an AbortSignal — the hook handles staleness internally.
- The sentinel component renders skeletons via a `skeleton` prop (`ReactNode`) and displays a retry button on error (receiving the `retry` function and error state from the hook).
