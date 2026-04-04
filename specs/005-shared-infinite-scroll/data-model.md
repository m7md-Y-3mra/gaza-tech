# Data Model: Shared Infinite Scroll

**Feature**: 005-shared-infinite-scroll  
**Date**: 2026-04-04

## Entities

This feature introduces no new database entities. It operates on the client side, consuming data from existing server actions.

### Hook State Model

The `useInfiniteScroll` hook manages the following internal state:

| Field | Type | Description |
|---|---|---|
| `items` | `TItem[]` | Accumulated items across all loaded pages |
| `page` | `number` (ref) | Current page number (starts at `DEFAULT_PAGE_NUMBER`) |
| `isLoading` | `boolean` | Whether a fetch is currently in progress |
| `error` | `string \| null` | Error message from the last failed fetch, or `null` |
| `hasMore` | `boolean` | Whether more pages are available |
| `isFetching` | `boolean` (ref) | Guard to prevent concurrent fetches |
| `abortController` | `AbortController` (ref) | Controller for aborting in-flight requests on filter change |

### Hook Input Parameters

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `fetchFn` | `FetchFn<TItem, TFilters>` | Yes | — | Generic fetch function matching the project's error-handler return shape |
| `filters` | `TFilters` | Yes | — | Filter object; changes trigger state reset |
| `initialItems` | `TItem[]` | Yes | — | Server-rendered first page of data |
| `initialHasMore` | `boolean` | Yes | — | Whether there are more items beyond the initial page |
| `limit` | `number` | No | `DEFAULT_LIMIT_NUMBER` | Page size |

### Hook Return Value

| Field | Type | Description |
|---|---|---|
| `items` | `TItem[]` | All items (initial + loaded) |
| `isLoading` | `boolean` | Loading state for the current fetch |
| `error` | `string \| null` | Error message or null |
| `hasMore` | `boolean` | Whether the sentinel should remain visible |
| `retry` | `() => void` | Retries the last failed fetch |
| `sentinelRef` | `(node?: Element \| null) => void` | Ref callback to attach to the sentinel element |

### Fetch Function Contract

```typescript
type FetchFn<TItem, TFilters> = (
  params: { filters: TFilters; page: number; limit: number },
  signal: AbortSignal
) => Promise<{
  success: boolean;
  data: { data: TItem[] };
  message?: string;
}>;
```

### Sentinel Component Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `sentinelRef` | `(node?: Element \| null) => void` | Yes | Ref from the hook |
| `isLoading` | `boolean` | Yes | Whether to show the skeleton |
| `error` | `string \| null` | Yes | Error message to display |
| `hasMore` | `boolean` | Yes | Whether sentinel should render |
| `retry` | `() => void` | Yes | Error retry handler |
| `skeleton` | `React.ReactNode` | Yes | Domain-specific loading skeleton |

### State Transitions

```
IDLE → (sentinel enters viewport) → LOADING → (fetch succeeds, has more) → IDLE
                                             → (fetch succeeds, no more)  → DONE
                                             → (fetch fails)              → ERROR

ERROR → (retry called) → LOADING

ANY → (filters change) → RESET → LOADING (page 1 fetch) → IDLE / DONE / ERROR
```

## Validation Rules

- `limit` must be a positive integer (defaults to `DEFAULT_LIMIT_NUMBER = 4`)
- `initialItems` can be an empty array (valid — means first page returned zero results)
- `filters` is compared by deep equality (`JSON.stringify`) for change detection
