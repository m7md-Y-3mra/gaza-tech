# Research: Shared Infinite Scroll

**Feature**: 005-shared-infinite-scroll  
**Date**: 2026-04-04

## Research Tasks

### 1. Best Hook Architecture for Generic Infinite Scroll

**Decision**: Build a custom `useInfiniteScroll<TItem, TFilters>` hook using `react-intersection-observer`'s `useInView` (already installed v10.0.2) plus `AbortController` for in-flight cancellation.

**Rationale**:

- `react-intersection-observer` is already a project dependency — no new packages needed.
- `useInView` provides a clean ref-based API that avoids manual `IntersectionObserver` setup and cleanup.
- TypeScript generics (`TItem`, `TFilters`) keep the hook domain-agnostic per FR-009.
- `AbortController` is natively supported and handles the "filter change while fetching" edge case (FR-005).

**Alternatives considered**:

- **`@tanstack/react-query` `useInfiniteQuery`**: Powerful but adds a heavy dependency and requires a `QueryClientProvider` setup not present in the project. Overkill for offset-based pagination with server actions.
- **Manual `IntersectionObserver`**: More boilerplate, manual cleanup, no benefit over the existing `react-intersection-observer` package.
- **`useSWRInfinite`**: Requires SWR setup not present; the project uses server actions, not REST endpoints.

### 2. Fetch Function Contract

**Decision**: The hook accepts a generic fetch function with signature:

```typescript
type FetchFn<TItem, TFilters> = (
  params: { filters: TFilters; page: number; limit: number },
  signal: AbortSignal
) => Promise<{ success: boolean; data: { data: TItem[] }; message?: string }>;
```

**Rationale**:

- Matches the existing `errorHandler()` return shape used across the project (`{ success, data, message, errors }`).
- The `signal` parameter allows the hook to abort in-flight requests on filter change.
- The listings `getListingsAction` already returns this shape; community actions will follow the same pattern.

**Alternatives considered**:

- Returning raw arrays: Would lose error metadata and break the project's established pattern.
- Passing AbortController instead of signal: Signal is the standard — the controller stays internal to the hook.

### 3. Filter Change & Reset Strategy

**Decision**: Use `JSON.stringify(filters)` in a `useEffect` dependency to detect changes. On change: abort in-flight request, reset items/page/error, fetch page 1 with new filters.

**Rationale**:

- The existing `ListingsContent` already uses `key={JSON.stringify(filters)}` to force remount of `LoadMore`. The shared hook internalizes this behavior so consumers don't need the `key` trick (though it remains compatible).
- Deep comparison via `JSON.stringify` is sufficient for the filter objects in this project (flat structures, no functions or dates).

**Alternatives considered**:

- `useEffect` with individual filter deps: Fragile — must update deps when filter shape changes.
- External deep-equal library: Unnecessary dependency for simple flat objects.
- Keep the `key={}` remount pattern: Works but is less efficient (destroys and recreates all state). The hook's internal reset is smoother.

### 4. Concurrent Fetch Prevention

**Decision**: Use a `useRef<boolean>` (`isFetching`) guard inside the `useEffect` callback. The `inView` trigger checks this ref before initiating a fetch.

**Rationale**:

- Simpler than an AbortController-based queue. The ref prevents the observer callback from firing duplicate fetches during rapid scrolling.
- Combined with the `AbortController` for filter changes, this covers both concurrent-fetch scenarios (rapid scroll + filter change).

**Alternatives considered**:

- Debouncing the observer: Adds latency to the scroll experience unnecessarily.
- State-based `isLoading` check: Works but refs are more reliable in async effects (no stale closure issues).

### 5. Sentinel Component Architecture

**Decision**: `InfiniteScrollSentinel` is a thin presentational component that:

- Receives `sentinelRef`, `isLoading`, `error`, `retry`, and a `skeleton` render prop.
- Renders the skeleton when loading, a retry button on error, or nothing when idle/done.

**Rationale**:

- Keeps the hook and component loosely coupled — the hook returns the state, the sentinel renders it.
- Render prop for skeleton allows each consumer to provide domain-specific loading UI (listing cards vs. post cards).

**Alternatives considered**:

- Built-in default skeleton: Would couple the component to a specific design. Render prop is more flexible.
- Compound component pattern: Over-engineered for what is essentially conditional rendering of 3 states.

### 6. Refactoring Existing LoadMore Component

**Decision**: `LoadMore` keeps its existing props (`filters`, `initialHasMore`) and external behavior. Internally, it replaces the manual `useInView` + `useEffect` + state management with a single `useInfiniteScroll` call and renders via `InfiniteScrollSentinel`.

**Rationale**:

- Zero-regression refactor per User Story 2 (SC-002, SC-004).
- The `LoadMore` component remains in `modules/listings/` as a thin wrapper — it's domain-specific (imports `getListingsAction`, `ListingCardSkeleton`).
- `ListingsContent` continues to use `<LoadMore>` unchanged.

**Alternatives considered**:

- Delete `LoadMore` entirely and inline the hook in `ListingsContent`: Would make `ListingsContent` a client component, breaking the server-first rendering principle.
- Move `LoadMore` to shared components: It's listings-specific (uses `ListingsGrid`, `ListingCardSkeleton`), so it stays in the module.
