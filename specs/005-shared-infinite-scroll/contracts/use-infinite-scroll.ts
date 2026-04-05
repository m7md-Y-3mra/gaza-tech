/**
 * Contract: useInfiniteScroll Hook
 *
 * Location: hooks/use-infinite-scroll.ts
 * Type: React Client Hook
 *
 * Generic infinite scroll hook that works with any data type and filter shape.
 * Designed to receive server-rendered first-page data and fetch subsequent
 * pages on scroll using Intersection Observer.
 */

// ── Fetch Function Contract ─────────────────────────────────────────────

/**
 * The fetch function consumers must provide.
 * Must match the project's errorHandler() return shape.
 *
 * NOTE: The hook manages AbortController internally. When filters change,
 * in-flight requests are considered stale — the hook checks abort status
 * after the promise resolves and discards stale results. The signal is NOT
 * passed to fetchFn because server actions (wrapped with errorHandler) cannot
 * receive non-serializable objects like AbortSignal.
 *
 * @param params.filters - Domain-specific filter object
 * @param params.page - Page number to fetch (1-indexed)
 * @param params.limit - Number of items per page
 */
type FetchFn<TItem, TFilters> = (params: {
  filters: TFilters;
  page: number;
  limit: number;
}) => Promise<{
  success: boolean;
  data?: { data: TItem[] };
  message?: string;
}>;

// ── Hook Options ────────────────────────────────────────────────────────

interface UseInfiniteScrollOptions<TItem, TFilters> {
  /** Generic fetch function for loading pages */
  fetchFn: FetchFn<TItem, TFilters>;
  /** Current filter state — changes trigger reset + refetch from page 1 */
  filters: TFilters;
  /** Server-rendered first page of data */
  initialItems: TItem[];
  /** Whether more items exist beyond the initial page */
  initialHasMore: boolean;
  /** Items per page (defaults to DEFAULT_LIMIT_NUMBER) */
  limit?: number;
}

// ── Hook Return Value ───────────────────────────────────────────────────

interface UseInfiniteScrollReturn<TItem> {
  /** All accumulated items (initial + subsequently loaded) */
  items: TItem[];
  /** Whether a fetch is currently in progress */
  isLoading: boolean;
  /** Error message from the last failed fetch, or null */
  error: string | null;
  /** Whether more pages are available */
  hasMore: boolean;
  /** Retries the last failed fetch */
  retry: () => void;
  /** Ref callback — attach to the sentinel DOM element */
  sentinelRef: (node?: Element | null) => void;
}

// ── Hook Signature ──────────────────────────────────────────────────────

/**
 * Usage:
 *
 * ```tsx
 * const { items, isLoading, error, hasMore, retry, sentinelRef } =
 *   useInfiniteScroll({
 *     fetchFn: myServerAction,
 *     filters: { category: 'tech' },
 *     initialItems: serverRenderedItems,
 *     initialHasMore: true,
 *     limit: 10,
 *   });
 * ```
 */
declare function useInfiniteScroll<TItem, TFilters>(
  options: UseInfiniteScrollOptions<TItem, TFilters>
): UseInfiniteScrollReturn<TItem>;

export type { FetchFn, UseInfiniteScrollOptions, UseInfiniteScrollReturn };
