# Phase 1 Data Model: Profile Community Posts Tab

**Feature**: 010-profile-community-tab
**Date**: 2026-04-11
**Status**: Frontend-only feature — no database changes

This feature does not introduce new persistence. It consumes existing Supabase tables through existing server actions/queries. The data model below documents the in-memory shapes that flow across the component boundary, plus the one backwards-compatible extension to `getUserCommunityPostsQuery`'s return type (driven by Research R3).

---

## Existing Entities (read-only for this feature)

### `community_posts` (Supabase table)

Read-only. Filtered to `content_status = 'published'` and `author_id = userId`, ordered by `published_at DESC`. Used as the source of truth for the tab's list.

Relevant columns (already defined in prior phases):

| Column           | Type        | Notes                                                 |
| ---------------- | ----------- | ----------------------------------------------------- |
| `post_id`        | uuid        | Primary key; used for Edit links and Delete calls     |
| `author_id`      | uuid        | Owner match; filter predicate                         |
| `title`          | text        | Displayed on the card                                 |
| `content`        | text        | Truncated for the preview                             |
| `category`       | enum        | questions / tips / news / troubleshooting             |
| `content_status` | enum        | Filtered server-side — only `published` surfaces here |
| `published_at`   | timestamptz | Sort key and display date                             |
| `like_count`     | integer     | Displayed on the card                                 |
| `comment_count`  | integer     | Displayed on the card                                 |

No new columns. No schema migration. No RLS changes.

### `community_posts_attachments`, `community_posts_likes`, `users`

Read indirectly through the existing `get_user_community_posts` RPC — the returned rows already embed the author info and first attachment (so `PostCard` can render avatar, name, thumbnail). This feature does not touch these tables directly.

---

## In-memory types (TypeScript)

These are the shapes that cross the server→client boundary in this feature.

### `FeedPost` (existing)

Already defined in `modules/community/types/index.ts`. Emitted by `mapFeedPostRow` in `modules/community/queries.ts`. Used as-is by `PostCard`. **No changes required.**

### `GetUserCommunityPostsInput` (existing)

Already defined in `modules/community/queries.ts`:

```ts
type GetUserCommunityPostsInput = {
  user_id: string;
  page?: number;
  limit?: number;
};
```

**No changes required.**

### Extension: return shape of `getUserCommunityPostsQuery`

**Change**: the existing return type is `Page<FeedPost>` (a generic shape that currently carries `data`, `has_more`, `next_page`). For this feature the query MUST additionally return the exact total row count so the existing `ProfilePagination` component can compute `totalPages`.

**Decision (from R3)**: add a `total_count: number` field to `Page<FeedPost>` as an **optional** field, or introduce a new `PageWithCount<T> = Page<T> & { total_count: number }` alias and have `getUserCommunityPostsQuery` return `PageWithCount<FeedPost>` specifically. The latter is preferred because:

1. It keeps the generic `Page<T>` shape unchanged for all other feed callers that rely on `has_more` for infinite scroll (Phase 4).
2. It makes the profile-tab contract explicit at the type level — consumers of `getUserCommunityPostsAction` know `total_count` is always present.
3. It avoids the `total_count?: number` optional footgun where a caller forgets to check and silently computes wrong page totals.

Resulting TypeScript sketch (for documentation — actual code lives in the module):

```ts
// modules/community/types/index.ts
export type PageWithCount<T> = Page<T> & {
  total_count: number;
};

// modules/community/queries.ts
export async function getUserCommunityPostsQuery(
  input: GetUserCommunityPostsInput
): Promise<PageWithCount<FeedPost>> {
  /* ... */
}
```

The implementation either (a) reads a `total_count` column that the RPC already projects through a window function, or (b) issues a parallel `count: 'exact', head: true` request on `community_posts` with the same `author_id` and `content_status = 'published'` predicate and bundles the result. Implementation choice is deferred to the task that touches `queries.ts`.

---

## Component prop contracts

These are the in-memory shapes at each seam of the new module folder.

### `ProfilePostsTabProps` (server component)

```ts
export type ProfilePostsTabProps = {
  userId: string;
  page: number;
  isOwner: boolean;
};
```

Matches `ProfileListingsTabProps` verbatim so `ProfileTabs.tsx` can pass the same three props into either tab.

### `ProfilePostsTabClientProps` (client component)

```ts
export type ProfilePostsTabClientProps = {
  posts: FeedPost[];
  postsCount: number; // from total_count
  pageSize: number; // DEFAULT_LIMIT_NUMBER
  isOwner: boolean;
};
```

Matches the shape of `ProfileListingsTabClientProps` one-for-one, with `posts`/`postsCount` in place of `listings`/`listingsCount`.

### `ProfileTabsClientProps` (existing, extended)

```ts
export type ProfileTabsClientProps = {
  isOwner: boolean;
  listingsContent: ReactNode;
  bookmarkedContent: ReactNode; // owner-only
  postsContent: ReactNode; // NEW — visible to all
};
```

Single additive field. `postsContent` is always a `ReactNode` (never conditional on ownership), because the tab is visible to everyone per FR-002.

---

## State transitions

No server-side state transitions. Client-side only:

1. **Idle → Deleting** (on Delete confirm): `useTransition` flips `isPending = true`; the targeted post is removed from `optimisticPosts` via `useOptimistic`; the Delete button for that row is disabled.
2. **Deleting → Idle (success)**: `deleteCommunityPostAction` resolves `success: true`; `sonner` success toast; server `revalidatePath('/profile/${authorId}')` re-runs `ProfilePostsTab` and the fresh server render confirms the absence of the item. If the current page becomes empty and `page > 1`, the client updates the URL `page` param to `page - 1` (FR-020).
3. **Deleting → Idle (failure)**: `deleteCommunityPostAction` resolves `success: false`; `useOptimistic` automatically reverts to the pre-optimistic state on the next render; `sonner` error toast surfaces `result.message`.
