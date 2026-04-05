# Quickstart — Community Feed Queries

Feature: 006-community-feed-queries | Date: 2026-04-05

This document describes **manual verification scenarios** an implementer or reviewer runs after the feature is landed. Every scenario corresponds to a user story / FR in `spec.md` and exercises the end-to-end path (server action → query → RPC → DB).

## Prerequisites

1. Migration `006_community_feed_queries.sql` is applied (schema delta, RPCs, RLS).
2. `npx supabase gen types typescript --project-id <REF> > types/supabase.ts` has been run.
3. At least 25 published posts and 3 users exist in `community_posts` (for pagination checks).
4. At least one post has 12+ comments across 2 top-level threads, with one thread containing 22 replies (for capping checks), and one tombstoned comment.

## Smoke sequence (in order)

### 1. Feed pagination + ordering (FR-001, FR-002, FR-028)

```ts
const a = await getCommunityFeedAction({ page: 1, limit: 10 });
const b = await getCommunityFeedAction({ page: 2, limit: 10 });
```

- Expect `a.data.success === true`, `a.data.data.length === 10`, `a.data.data.has_more === true`, `a.data.data.next_page === 2`.
- Expect **zero overlap** in `post_id`s between `a` and `b`.
- Expect `a.data.data[0].published_at >= a.data.data[1].published_at`.
- Insert two posts with identical `published_at`; verify they appear in `post_id DESC` order and survive page boundary without drift.

### 2. Category filter + validation (FR-001)

```ts
await getCommunityFeedAction({ category: 'tips' }); // OK
await getCommunityFeedAction({ category: 'bogus' as any }); // Validation error
```

- First call returns only `post_category === 'tips'`.
- Second call returns `{ success: false, message: 'Validation error', errors: { category: ... } }`.

### 3. Unauthenticated read (FR-027, SC-008)

Clear cookies, then:

```ts
const res = await getCommunityFeedAction({});
```

- `res.success === true`.
- Every row has `is_liked === false` and `is_bookmarked === false` (literal booleans, never `null`).

### 4. Like toggle atomicity (FR-004, FR-020, SC-003)

```ts
const before = await getCommunityPostDetailAction({ post_id });
const first = await togglePostLikeAction({ post_id });
const after = await getCommunityPostDetailAction({ post_id });
```

- `first.data === { is_liked: true, like_count: before.data.like_count + 1 }`.
- `after.data.like_count === first.data.like_count`.
- Toggle again: `like_count` decrements by 1 and `is_liked === false`.

### 5. Bookmark self-like (FR-020a)

- As the post's author, call `togglePostBookmarkAction` and `togglePostLikeAction` on their own post. Both succeed.

### 6. Unpublished-post gating (FR-018a)

- Soft-delete a post via `deleteCommunityPostAction`.
- Attempt `togglePostLikeAction`, `togglePostBookmarkAction`, `addCommentAction`, `toggleCommentLikeAction` on the deleted post.
- Each returns `{ success: false, code: 'POST_NOT_FOUND', message }`.
- `deleteOwnCommentAction` on an existing comment under that post still **succeeds** (FR-018a carve-out).

### 7. Comment threading — read path (FR-006, FR-006a)

- Fetch `getPostCommentsAction({ post_id, page: 1, limit: 10 })` for the seeded post.
- Verify each top-level comment has `replies.length ≤ 20`, a `replies_count` ≥ 0, and `has_more_replies === (replies_count > 20)`.
- For the thread seeded with 22 replies, verify `has_more_replies === true`, then call `getCommentRepliesAction({ comment_id, page: 1, limit: 20 })` and receive the remaining replies in `created_at ASC` order.
- Verify `parent_comment_id` is preserved on every reply.

### 8. Comment threading — write path auto-rewrite (FR-007)

- Pick a reply (call it `R1`, which has `parent_comment_id = T` pointing to a top-level comment `T`).
- Call `addCommentAction({ post_id, parent_comment_id: R1.comment_id, content: 'reply to reply' })`.
- Refetch comments. The new comment must exist with `parent_comment_id === T.comment_id` (the top-level ancestor), **not** `R1.comment_id`.
- Verify no validation error surfaced to the caller.

### 9. Comment content validation (FR-009a)

- `addCommentAction({ post_id, content: '' })` → validation error.
- `addCommentAction({ post_id, content: '   ' })` → validation error (trim).
- `addCommentAction({ post_id, content: 'x'.repeat(2001) })` → validation error.
- `addCommentAction({ post_id, content: 'x' })` → success.

### 10. Author-only mutation enforcement (FR-010, FR-012, FR-015, FR-029)

- As user B, attempt to edit / delete user A's comment and A's post.
- Each action returns `{ success: false, code: 'UNAUTHORIZED', message }` — **not** a raw Postgres error.
- Directly attempt the same mutation via the Supabase JS client bypassing the server action (e.g., in the browser devtools console): RLS should still reject it with a `42501` at the DB layer, confirming defense-in-depth.

### 11. Comment soft-delete + tombstone visibility (FR-011, FR-011a)

- Delete a comment that has surviving replies via `deleteOwnCommentAction`.
- Refetch `getPostCommentsAction`; the row appears as a tombstone: `is_deleted === true`, `content === ''`, replies still threaded under it.
- Attempt `editOwnCommentAction` / `toggleCommentLikeAction` on the tombstone → `{ success: false, code: 'COMMENT_NOT_FOUND' }`.

### 12. `comment_count` excludes tombstones (FR-021)

- Record the `comment_count` on the seeded post.
- Soft-delete one top-level comment and one reply via `deleteOwnCommentAction`.
- Refetch feed / post-detail. `comment_count` must have dropped by exactly 2.

### 13. Deleted-author stub (FR-025)

- In the DB, `UPDATE users SET user_id = ... ` — simulate an unresolvable author (or seed an orphaned `community_posts.author_id`).
- Refetch feed. The affected post still appears with `author === { id: null, name: 'Deleted user', avatar_url: null }`.
- Pagination counts are unchanged from the baseline.

### 14. Post-detail strict visibility (FR-017)

- As the post's author, soft-delete your own post.
- `getCommunityPostDetailAction({ post_id })` returns `{ success: false, code: 'POST_NOT_FOUND' }` — even for the author.

### 15. Revalidation (FR-024)

- In a running dev server, load `/community` and `/profile/<authorId>` to populate Next.js cache.
- Call `togglePostLikeAction` as another user.
- Reload both pages and observe the updated `like_count` / engagement — the cached render should be invalidated.
- Repeat for `addCommentAction`, `editOwnCommentAction`, `deleteOwnCommentAction`, `deleteCommunityPostAction`, `toggleCommentLikeAction`, `togglePostBookmarkAction`. Only the **post author's** profile page should revalidate for comment-level mutations — the commenting user's profile must **not** refresh.

### 16. Error handler propagates `code` (cross-cutting)

```ts
const res = await getCommunityPostDetailAction({
  post_id: '00000000-0000-0000-0000-000000000000',
});
// res === { success: false, code: 'POST_NOT_FOUND', message: '...' }
```

Confirm the `code` field is present on the returned object (TypeScript should flag it as `string | undefined` after the `CustomError` extension).

---

## Definition of Done for this phase

- [ ] All 16 smoke scenarios above pass.
- [ ] `npm run check` (format + lint + type-check) passes with zero errors.
- [ ] `types/supabase.ts` has been regenerated and includes `parent_comment_id`, `is_deleted`, and all new RPC functions.
- [ ] No UI files, hooks, or client components were added in this phase.
- [ ] The migration is idempotent (safe to re-run) and documented under `specs/006-community-feed-queries/contracts/rpc-functions.sql`.
- [ ] Every server action in `modules/community/actions.ts` is wrapped with `errorHandler()`.
