/**
 * Contract: InfiniteScrollSentinel Component
 *
 * Location: components/infinite-scroll-sentinel/InfiniteScrollSentinel.tsx
 * Type: React Client Component
 *
 * Presentational component that renders loading skeletons, error state with
 * retry button, or nothing — based on the state returned by useInfiniteScroll.
 */

import type { ReactNode } from 'react';

// ── Component Props ─────────────────────────────────────────────────────

interface InfiniteScrollSentinelProps {
  /** Ref callback from useInfiniteScroll — attached to the sentinel element */
  sentinelRef: (node?: Element | null) => void;
  /** Whether a fetch is in progress — shows skeleton when true */
  isLoading: boolean;
  /** Error message — shows error UI with retry when non-null */
  error: string | null;
  /** Whether more items exist — hides sentinel when false */
  hasMore: boolean;
  /** Retry handler for error recovery */
  retry: () => void;
  /** Domain-specific skeleton to render during loading */
  skeleton: ReactNode;
  /** Optional className for the sentinel container */
  className?: string;
}

/**
 * Usage:
 *
 * ```tsx
 * <InfiniteScrollSentinel
 *   sentinelRef={sentinelRef}
 *   isLoading={isLoading}
 *   error={error}
 *   hasMore={hasMore}
 *   retry={retry}
 *   skeleton={<MyCardSkeleton count={4} />}
 *   className="mt-6"
 * />
 * ```
 *
 * Rendering logic:
 * - hasMore=false → renders nothing
 * - error is non-null → renders error message + retry button
 * - isLoading=true → renders skeleton
 * - Otherwise → renders invisible sentinel div (triggers next fetch on scroll)
 */
declare function InfiniteScrollSentinel(
  props: InfiniteScrollSentinelProps
): ReactNode;

export type { InfiniteScrollSentinelProps };
