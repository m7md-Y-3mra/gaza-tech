'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import {
  DEFAULT_LIMIT_NUMBER,
  DEFAULT_PAGE_NUMBER,
} from '@/constants/pagination';

// ── Types ────────────────────────────────────────────────────────────────────

// data is optional to accommodate errorHandler's discriminated union return type
// (ApiResponseError has no `data` property, ApiResponseSuccess<T> does).
type FetchFn<TItem, TFilters> = (params: {
  filters: TFilters;
  page: number;
  limit: number;
}) => Promise<{
  success: boolean;
  data?: { data: TItem[] };
  message?: string;
}>;

interface UseInfiniteScrollOptions<TItem, TFilters> {
  fetchFn: FetchFn<TItem, TFilters>;
  filters: TFilters;
  initialItems: TItem[];
  initialHasMore: boolean;
  limit?: number;
}

interface UseInfiniteScrollReturn<TItem> {
  items: TItem[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  retry: () => void;
  sentinelRef: (node?: Element | null) => void;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useInfiniteScroll<TItem, TFilters>({
  fetchFn,
  filters,
  initialItems,
  initialHasMore,
  limit = DEFAULT_LIMIT_NUMBER,
}: UseInfiniteScrollOptions<TItem, TFilters>): UseInfiniteScrollReturn<TItem> {
  const [items, setItems] = useState<TItem[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(initialHasMore);

  // retryTrigger increments on every retry click, ensuring a fetch is always
  // initiated regardless of whether the sentinel is in the viewport.
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Refs for stable values that don't trigger re-renders
  const page = useRef(DEFAULT_PAGE_NUMBER);
  const isFetching = useRef(false);
  const abortController = useRef<AbortController | null>(null);

  const { ref: sentinelRef, inView } = useInView();

  // ── Core fetch logic ──────────────────────────────────────────────────────
  const fetchNextPage = useCallback(async () => {
    if (isFetching.current || !hasMore) return;

    isFetching.current = true;
    setIsLoading(true);
    setError(null);

    // Abort any prior in-flight request
    abortController.current?.abort();
    const controller = new AbortController();
    abortController.current = controller;

    const nextPage = page.current + 1;

    try {
      const result = await fetchFn({ filters, page: nextPage, limit });

      // Discard stale result if a newer fetch was triggered
      if (controller.signal.aborted) return;

      // Guard: error response (ApiResponseError) has no `data` field
      if (!result.success || !result.data) {
        setError(result.message ?? 'Failed to load more items');
        setHasMore(false);
        return;
      }

      const newItems = result.data.data;

      if (newItems.length === 0) {
        setHasMore(false);
        return;
      }

      setItems((prev) => [...prev, ...newItems]);

      if (newItems.length < limit) {
        setHasMore(false);
      }

      page.current = nextPage;
    } catch {
      if (controller.signal.aborted) return;
      setError('Failed to load more items');
      setHasMore(false);
    } finally {
      if (!controller.signal.aborted) {
        isFetching.current = false;
        setIsLoading(false);
      }
    }
  }, [fetchFn, filters, hasMore, limit]);

  // ── Trigger fetch when sentinel enters viewport ───────────────────────────
  useEffect(() => {
    if (inView && !isFetching.current && hasMore) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasMore]);

  // ── Trigger fetch on retry (works regardless of scroll position) ──────────
  useEffect(() => {
    if (retryTrigger > 0 && hasMore && !isFetching.current) {
      fetchNextPage();
    }
  }, [retryTrigger, hasMore, fetchNextPage]);

  // ── Reset on filter change ────────────────────────────────────────────────
  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    // Abort any in-flight request from the previous filter set
    abortController.current?.abort();

    // Reset state
    setItems(initialItems);
    page.current =
      initialItems.length > 0 ? DEFAULT_PAGE_NUMBER : DEFAULT_PAGE_NUMBER - 1;
    setHasMore(initialHasMore);
    setError(null);
    isFetching.current = false;

    // If we reset to empty but expect more data, trigger an immediate fetch state
    if (initialItems.length === 0 && initialHasMore) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  // ── Auto-fetch when reset leaves us with empty items but hasMore ──────
  useEffect(() => {
    if (items.length === 0 && hasMore && isLoading && !isFetching.current) {
      fetchNextPage();
    }
  }, [items.length, hasMore, isLoading, fetchNextPage]);

  // ── Retry handler ─────────────────────────────────────────────────────────
  // Increments retryTrigger so the effect above fires, guaranteeing a fetch
  // even if the sentinel element is no longer in the viewport.
  const retry = useCallback(() => {
    isFetching.current = false;
    setError(null);
    setHasMore(true);
    setRetryTrigger((prev) => prev + 1);
  }, []);

  return { items, isLoading, error, hasMore, retry, sentinelRef };
}

export type { FetchFn, UseInfiniteScrollOptions, UseInfiniteScrollReturn };
