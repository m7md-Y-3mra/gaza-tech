/**
 * Post Card Component — Public API Contract
 *
 * This file documents the external prop contract of the PostCard component.
 * It is a reference artifact — the actual types live in the module.
 *
 * @module modules/community/components/post-card
 */

import type { FeedPost } from '@/modules/community/types';

// ── PostCard Props ───────────────────────────────────────────────────

/**
 * The PostCard component accepts a single flattened `post` prop containing
 * all display data (author, counts, viewer state) and a required callback.
 *
 * The host is responsible for:
 * - Providing the `post` object with viewer-specific `is_liked`/`is_bookmarked`
 * - Supplying `onOpenComments` to handle comment view opening
 *
 * The card is responsible for:
 * - Rendering all visual elements
 * - Managing optimistic like/bookmark state internally
 * - Detecting auth state via `useCurrentUser` (no viewer prop needed)
 * - Redirecting guests to sign-in for like/bookmark actions
 * - Copying share URL to clipboard
 */
export type PostCardProps = {
  /** The flattened post object from the community feed query */
  post: FeedPost;

  /**
   * Required callback invoked when the user wants to open the comments view.
   * Triggered by: comment icon button, title button, content preview button.
   * Called with the post's `post_id`.
   * The card does NOT render a comment UI — the host is responsible.
   */
  onOpenComments: (postId: string) => void;
};

// ── PostCardSkeleton ─────────────────────────────────────────────────

/**
 * The skeleton component takes NO props.
 * It renders exactly one card-shaped placeholder.
 * It is server-renderable (no 'use client' directive).
 *
 * Usage:
 *   <PostCardSkeleton />
 *
 * For multiple skeletons:
 *   {Array.from({ length: 5 }).map((_, i) => <PostCardSkeleton key={i} />)}
 */
export type PostCardSkeletonProps = Record<string, never>;

// ── useCurrentUser (shared hook) ─────────────────────────────────────

/**
 * Shared hook at hooks/use-current-user.ts
 *
 * Returns:
 *   { user: User | null, isLoading: boolean }
 *
 * - `user` is null for guests and during initial loading
 * - `isLoading` is true until the first getUser() call resolves
 * - The card uses this to gate like/bookmark actions
 * - While isLoading: clicks are ignored (no redirect, no optimistic update)
 * - When user is null and not loading: clicks redirect to sign-in
 */
