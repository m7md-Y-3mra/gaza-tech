# Feature Specification: Community Feed Queries

**Feature Branch**: `006-community-feed-queries`  
**Created**: 2026-04-04  
**Status**: Draft  
**Input**: User description: "All Supabase queries and server actions needed for the community feed — fetching posts, toggling like, toggling bookmark, comments CRUD, deleting posts."

## Clarifications

### Session 2026-04-04

- Q: Should post deletion hard-delete the row and storage files, or soft-delete by flipping `content_status` to `removed`? → A: Soft delete — set `content_status='removed'`, exclude from queries, keep storage files for audit/moderation.
- Q: What default and maximum page size apply to paginated post queries (feed + user posts)? → A: Default 10, maximum 50 items per page.
- Q: How should comment fetching be paginated to avoid unbounded payloads on heavily commented posts? → A: Paginate top-level comments (default 10, max 50); each top-level comment's direct replies are returned inline in the same response.
- Q: Does the feed query support filtering by category? → A: Yes — optional single `category` parameter; when unset, all categories are returned.
- Q: Which paths must mutating server actions revalidate? → A: Community feed root (`/[locale]/community`) and the affected author's profile page (`/[locale]/profile/[userId]`).
- Q: How deep does comment threading go in query results? → A: Two levels only — every non-root comment is flattened under its top-level ancestor regardless of its true `parent_comment_id` depth; the original `parent_comment_id` is preserved on each reply so the UI can show the "replying to" reference.
- Q: How are inline replies bounded per top-level comment to prevent unbounded payloads? → A: Cap at 20 most recent replies per top-level comment (ordered oldest→newest within the capped window), return a total `replies_count`, and expose a `has_more_replies` flag; a dedicated paginated query fetches the remainder on demand.
- Q: Should mutating actions (like/bookmark/comment add/comment edit) reject when the target post is not `published`? → A: Yes — server actions MUST verify the target post's `content_status = 'published'` and return a structured not-found error otherwise, preserving the "removed = invisible everywhere" invariant.
- Q: How is the optional feed `category` filter validated? → A: Validated against the existing category enum via a Zod schema at the server-action boundary; invalid values return a structured validation error rather than an empty result set.
- Q: How should queries handle posts or comments whose author profile is unresolvable (deleted account / missing profile row)? → A: Return the record with a placeholder author stub (`{ id: null, name: "Deleted user", avatar_url: null }`, display name localized) so the feed/comment list remains contiguous and pagination counts stay correct.
- Q: When creating a reply via `add_comment`, how deep is nesting allowed at write time? → A: Cap at 2 levels on write, but auto-rewrite deeper `parent_comment_id` values to their top-level ancestor instead of rejecting — so callers never see a validation error for passing a reply's id as a parent, and the stored graph always matches the 2-level read model.
- Q: What length bounds apply to comment content at the server-action boundary? → A: Min 1 character after trim, max 2000 characters; enforced via Zod at the add/edit server-action boundary with a structured validation error on violation.
- Q: Can a user like and/or bookmark their own post (and like their own comment)? → A: Yes — self-like and self-bookmark are allowed on both posts and comments; toggle actions apply no author check.
- Q: How should the feed query break ties when two posts share the same `published_at`? → A: Order by `published_at DESC, id DESC` — the post id acts as a stable secondary key to guarantee deterministic pagination and prevent duplicates or skips across pages.
- Q: What shape should the "post not found" structured error (FR-018a) use? → A: Throw `CustomError('POST_NOT_FOUND', …)` so the shared `errorHandler()` returns `{ success: false, code: 'POST_NOT_FOUND', message }` — a stable machine-readable code the UI can branch on, consistent with the existing CustomError + errorHandler pattern.
- Q: How should comment deletion work (hard vs soft) and what happens to replies? → A: Soft-delete — set `is_deleted=true` and null/blank the `content`; keep the row so descendant replies remain threaded with a "replying to deleted comment" placeholder. Soft-deleted comments are still returned by read queries but are excluded from edit/like mutations.
- Q: What does the exposed `comment_count` on feed/detail queries count? → A: Total non-deleted comments — top-level plus all replies — excluding soft-deleted (`is_deleted=true`) tombstones. Matches common social-feed semantics and keeps the count honest after deletions.
- Q: How are post attachment URLs exposed in query results? → A: Stable public URLs from the `community-attachments` bucket are returned directly in query results; bucket is public-read. No per-request signing is needed since the feed is publicly viewable anyway.
- Q: Can the author view their own `draft` or `removed` posts via the post-detail query in this phase? → A: No — strict exclusion. The detail query returns `POST_NOT_FOUND` for any non-`published` status, even for the author. Draft/edit authoring flows will use a separate query in a later phase.
- Q: How are `is_liked` / `is_bookmarked` represented for unauthenticated callers in query responses? → A: Always literal `false` (plain `boolean` type, never `null`, never omitted) — keeps a single stable response shape and matches Scenario 4 verbatim. Applies to post and comment read queries alike.
- Q: How do soft-deleted comment tombstones interact with `replies_count` and the 20-reply inline cap (FR-006)? → A: `replies_count` excludes tombstones (consistent with `comment_count` in FR-021); the "20 most recent" cap selects only from non-deleted replies, so tombstones never consume the 20-slot budget; a tombstone is included in the inline `replies` array only when it is an ancestor of a reply that was selected into the capped window, so the UI can still render a "replying to deleted comment" reference where it's actually needed.
- Q: For FR-024 revalidation, which profile page counts as the "affected author" for comment mutations (add/edit/delete/like-toggle)? → A: Always the **post author's** profile — for both post-level and comment-level mutations. The profile community tab surfaces the user's posts (FR-016), not their comment history, so the post author's profile is the only one that goes stale when a post's `comment_count` or engagement state changes. The commenting user's own profile is not revalidated by comment mutations in this phase.
- Q: For the add-comment mutation in FR-018a, does the `add_comment` RPC perform the `content_status = 'published'` check internally, or must the server action pre-check? → A: The `add_comment` RPC is modified to verify the target post's `content_status = 'published'` internally and raise a DB error when it is not; the server action catches that error and re-throws `CustomError('POST_NOT_FOUND', …)` so the `errorHandler()` emits the same `{ success: false, code: 'POST_NOT_FOUND', message }` shape as the other FR-018a mutations. Single round-trip, authoritative at the DB boundary.
- Q: Should `toggle_comment_like` and `delete_own_comment` also be gated by the parent post's `content_status = 'published'`? → A: Extend FR-018a to `toggle_comment_like` only (engagement accrual — same rationale as the other gated mutations). Leave `delete_own_comment` unrestricted so authors can always tidy up their own comments even under a non-published post; deletion is user agency, not engagement, and trapping a user's comment on a post they can't see would be user-hostile.
- Q: What casing convention should server actions expose in their returned data shapes? → A: snake_case end-to-end — matches Supabase DB output and the majority of FRs (FR-006, FR-006a, FR-027), avoids a hand-maintained transformer layer on every query, and keeps a single TS type shape from query → server action → UI. User Story 2's `isLiked`/`likeCount` camelCase references are updated to snake_case (`is_liked`, `like_count`) for consistency.
- Q: What response envelope should paginated queries (feed, user-posts, comments, more-replies) return? → A: `{ data, has_more, next_page }` — no total count. Implementations fetch `limit + 1` rows internally to derive `has_more` in a single query (no extra `COUNT(*)` round-trip), and `next_page` is `page + 1` when `has_more` is true else `null`. Matches the shared infinite-scroll hook's needs and keeps page cost O(limit).
- Q: How is FR-020's "atomic in effect" toggle guarantee implemented for like/bookmark? → A: Dedicated Postgres RPC functions (`toggle_post_like`, `toggle_post_bookmark`, `toggle_comment_like`) perform the check-and-swap inside a single SQL function and return the new state plus updated count in one round-trip. Matches the existing `add_comment` RPC pattern (FR-007/FR-023), avoids app-level races, and eliminates a follow-up `SELECT` for the count. The FR-018a `content_status = 'published'` gate for toggle-post-like, toggle-post-bookmark, and toggle-comment-like is performed inside each RPC and raised as a DB error that the server action translates to `CustomError('POST_NOT_FOUND', …)`.
- Q: Where are author-only mutation authorizations (FR-010 edit comment, FR-012 delete comment, FR-015 delete post) enforced? → A: Both layers — Postgres RLS policies are the authoritative gate (this phase includes a migration adding RLS policies scoped to `author_id = auth.uid()` on `UPDATE`/`DELETE` for `community_posts` and `community_post_comments`), and each server action performs an application-level preflight (`SELECT ... WHERE id = ? AND author_id = session.user.id`) so that non-author attempts return a clean structured error via `CustomError('UNAUTHORIZED', …)` rather than surfacing a raw Postgres permission error to the UI. RLS still enforces the invariant if the preflight is ever bypassed (defense in depth).
- Q: Is there a time window restricting how long after creation an author can edit their own comment? → A: No — editing is unbounded in this phase. Authors can edit their own non-deleted comments at any time. The `is_edited` flag and `edited_at` timestamp (FR-009) provide the transparency signal readers need. A time-window policy can be added later as a single `WHERE` clause if product requires it.
- Q: How are per-caller `is_liked` / `is_bookmarked` flags resolved in list queries (feed, user-posts, post-detail, comments)? → A: Inline in each query via a correlated `EXISTS` (or `LEFT JOIN ... IS NOT NULL`) against the per-user relations (`community_posts_likes`, `bookmarked_posts`, `community_comments_likes`) scoped to `auth.uid()`. Single round-trip per page, honest results, matches the existing listings-feed bookmark pattern. When `auth.uid()` is null (unauthenticated), the correlated subquery yields `false` naturally, satisfying FR-027's unauthenticated-callers-see-false rule without any branching in the server action.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Browse Community Feed (Priority: P1)

A visitor or logged-in user opens the community feed and sees a paginated list of published community posts. Each post shows the author's name and avatar, category, title, content preview, like count, comment count, and (for logged-in users) whether they have liked or bookmarked it. As the user scrolls, more posts load automatically.

**Why this priority**: This is the foundation — without fetching and displaying posts, no other community feature works.

**Independent Test**: Call the posts query with various page/limit values and verify the returned data shape, pagination correctness, and count computations.

**Acceptance Scenarios**:

1. **Given** published community posts exist, **When** the query is called with page 1 and a limit, **Then** it returns posts up to the limit ordered by most recently published, each with author info, attachment list, like count, comment count, and current user's like/bookmark status.
2. **Given** more posts exist than a single page, **When** page 1 is fetched followed by page 2, **Then** page 2 returns the next page with no duplicates.
3. **Given** posts exist with statuses "draft", "published", and "removed", **When** the feed query runs, **Then** only "published" posts are returned.
4. **Given** the user is not logged in, **When** the feed is fetched, **Then** posts still load and `is_liked` and `is_bookmarked` are both false.

---

### User Story 2 - Like and Unlike a Post (Priority: P1)

A logged-in user can toggle a "like" on any community post. The system tracks which users liked which posts and returns accurate like counts.

**Why this priority**: Likes are a core engagement mechanic that appear on every post card in the feed.

**Independent Test**: Toggle a like on a post and verify the returned like status and count change correctly.

**Acceptance Scenarios**:

1. **Given** a logged-in user who has not liked a post, **When** they toggle the like, **Then** the system creates a like record and returns `{ is_liked: true, like_count: previousCount + 1 }`.
2. **Given** a logged-in user who has already liked a post, **When** they toggle the like, **Then** the system removes the like record and returns `{ is_liked: false, like_count: previousCount - 1 }`.
3. **Given** a user who is not logged in, **When** they attempt to toggle a like, **Then** the system returns an authentication error.

---

### User Story 3 - Bookmark and Unbookmark a Post (Priority: P1)

A logged-in user can bookmark any community post for later reference. The bookmark status is reflected in the feed data.

**Why this priority**: Bookmarking is a core engagement feature displayed on every post card, and it follows a pattern already proven in the listings module.

**Independent Test**: Toggle a bookmark and verify the returned status.

**Acceptance Scenarios**:

1. **Given** a logged-in user who has not bookmarked a post, **When** they toggle the bookmark, **Then** the system creates a bookmark record and returns `{ is_bookmarked: true }`.
2. **Given** a logged-in user who has already bookmarked a post, **When** they toggle the bookmark, **Then** the system removes the bookmark record and returns `{ is_bookmarked: false }`.
3. **Given** a user who is not logged in, **When** they attempt to toggle a bookmark, **Then** the system returns an authentication error.

---

### User Story 4 - View Comments on a Post (Priority: P2)

A user views all comments on a specific community post. Comments include author info, like count, per-user like status, edit status, and a parent reference for threaded replies.

**Why this priority**: Comments are needed for the post detail view, but the data layer must exist first.

**Independent Test**: Fetch comments for a post and verify the data shape includes threading info, author details, and counts.

**Acceptance Scenarios**:

1. **Given** a post with several top-level comments and replies (including replies-to-replies), **When** comments are fetched with `page` and `limit`, **Then** up to `limit` top-level comments are returned (ordered by creation time ascending) and each top-level comment includes inline a flattened `replies` array containing every descendant comment whose ancestry chain terminates at that top-level comment — regardless of nesting depth — with author info, like count, `is_liked` status, `parent_comment_id` (preserving the true immediate parent), and `is_edited` flag on every node.
2. **Given** a post with no comments, **When** comments are fetched, **Then** an empty array is returned.
3. **Given** a post with more top-level comments than `limit`, **When** page 1 is fetched followed by page 2, **Then** page 2 returns the next top-level comments (each with their inline replies) with no duplicates.

---

### User Story 5 - Add a Comment (Priority: P2)

A logged-in user can add a comment to a community post, either as a top-level comment or as a reply to an existing comment.

**Why this priority**: Adding comments is the primary interaction in the post detail view.

**Independent Test**: Add a comment via the database function and verify it appears in subsequent comment fetches with correct parent reference.

**Acceptance Scenarios**:

1. **Given** a logged-in user viewing a post, **When** they submit a top-level comment with valid content, **Then** the system persists the comment and returns the new comment with author info.
2. **Given** a logged-in user viewing a post, **When** they submit a reply to an existing comment, **Then** the new comment is created with the correct parent reference.
3. **Given** a user who is not logged in, **When** they attempt to add a comment, **Then** the system returns an authentication error.

---

### User Story 6 - Edit and Delete Own Comments (Priority: P2)

A logged-in user can edit or delete their own comments. Edited comments are marked as edited with a timestamp.

**Why this priority**: Users need to correct mistakes and remove their own content.

**Independent Test**: Edit a comment and verify the content updates with edited flag set; delete a comment and verify it no longer appears in fetches.

**Acceptance Scenarios**:

1. **Given** a logged-in user who authored a comment, **When** they update the content, **Then** the content is updated, the edited flag is set, and the edited timestamp is set to the current time.
2. **Given** a logged-in user who authored a comment, **When** they delete the comment, **Then** the comment is removed.
3. **Given** a logged-in user who did NOT author a comment, **When** they attempt to edit or delete it, **Then** the system returns an authorization error.

---

### User Story 7 - Like and Unlike a Comment (Priority: P3)

A logged-in user can toggle a "like" on any comment within a post.

**Why this priority**: Comment likes are a secondary engagement feature; feed and post-level interactions take priority.

**Independent Test**: Toggle a comment like and verify the returned status and count.

**Acceptance Scenarios**:

1. **Given** a logged-in user who has not liked a comment, **When** they toggle the like, **Then** the system returns `{ is_liked: true, like_count: previousCount + 1 }`.
2. **Given** a logged-in user who has already liked a comment, **When** they toggle the like, **Then** the system returns `{ is_liked: false, like_count: previousCount - 1 }`.

---

### User Story 8 - Delete Own Post (Priority: P2)

A logged-in user can delete their own community post. The post is soft-deleted — its `content_status` is set to `removed` so it no longer appears anywhere in the feed, post detail, or profile queries, while storage attachments are preserved for audit/moderation purposes.

**Why this priority**: Authors must be able to remove their own content while preserving a moderation/audit trail.

**Independent Test**: Soft-delete a post and verify its `content_status` becomes `removed` and it is excluded from all feed, profile, and detail query results.

**Acceptance Scenarios**:

1. **Given** a logged-in user who authored a post, **When** they delete the post, **Then** the post's `content_status` is set to `removed` and the post no longer appears in any feed, profile, or detail query result.
2. **Given** a logged-in user who did NOT author a post, **When** they attempt to delete it, **Then** the system returns an authorization error.

---

### User Story 9 - View a Specific User's Community Posts (Priority: P3)

Any user can view the community posts written by a specific user, paginated, for use in the profile tab.

**Why this priority**: Needed for the profile community tab but secondary to the main feed.

**Independent Test**: Fetch posts for a specific user ID and verify only that user's posts are returned, paginated.

**Acceptance Scenarios**:

1. **Given** a user has multiple published posts, **When** their posts are fetched with pagination, **Then** only that user's posts are returned, ordered by most recently published.
2. **Given** a user has no published posts, **When** their posts are fetched, **Then** an empty array is returned.

---

### User Story 10 - View Post Detail (Priority: P2)

A user views the full detail of a single post including author info, all attachments, and engagement counts.

**Why this priority**: Required for the post detail modal to display the full post.

**Independent Test**: Fetch a post by ID and verify all fields are returned including attachments, counts, and current user status.

**Acceptance Scenarios**:

1. **Given** a published post with attachments, **When** the post detail is fetched, **Then** the full post data is returned including author, all attachments, like count, comment count, and current user's like/bookmark status.
2. **Given** a non-existent post ID, **When** the detail is fetched, **Then** the system returns a "not found" error.

---

### Edge Cases

- What happens when a post is deleted while another user is viewing the feed? The feed handles the missing post without crashing on subsequent pagination.
- What happens when a user tries to like or bookmark a post that was just deleted? The action fails gracefully with a structured error response.
- What happens when a comment's parent is soft-deleted? The parent row remains in place with `is_deleted = true` and blank content, so descendant replies stay threaded and the UI renders a "replying to deleted comment" placeholder for the parent reference.
- What happens when the database returns an unexpected error during a toggle operation? The action returns a structured error without leaving data in an inconsistent state.
- What happens when a post has zero likes, zero comments, and zero bookmarks? All counts are returned as zero without errors.
- What happens when an unauthenticated user calls a read-only query (feed, comments, post detail)? The query succeeds but per-user flags (`is_liked`, `is_bookmarked`) are false.
- What happens when a soft-deleted (`removed`) post is referenced by an existing comment or like record? The related records remain in the database but are never surfaced because the parent post is excluded from all queries.
- What happens when a post or comment's author account has been deleted? The record is still returned with a placeholder author stub so the feed/comment list stays contiguous and pagination counts remain correct.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a paginated query for published community posts returning author info, attachment list, like count, comment count, and current user's like/bookmark status. The query MUST accept `page`, `limit`, and an optional `category` parameter; default `limit` to 10 when omitted and clamp any `limit` above 50 down to 50. When `category` is provided, only posts matching that category are returned; when omitted, posts from all categories are returned. The `category` parameter MUST be validated against the existing community category enum via a Zod schema at the server-action boundary; invalid values return a structured validation error (not an empty result).
- **FR-002**: System MUST order the community feed by most recently published first, using `published_at DESC` as the primary key and post `id DESC` as a stable secondary tie-breaker so pagination is deterministic and never produces duplicates or skips across pages. The same ordering contract applies to the specific-user posts query (FR-016).
- **FR-003**: System MUST only return posts whose content status is "published" in the community feed query.
- **FR-004**: System MUST allow authenticated users to toggle a like on a post, returning the new like status and updated count.
- **FR-005**: System MUST allow authenticated users to toggle a bookmark on a post, returning the new bookmark status.
- **FR-006**: System MUST provide a paginated query that fetches top-level comments for a given post (default `limit` = 10, maximum `limit` = 50), ordered by creation time ascending. Each top-level comment MUST include inline up to 20 of its descendant replies flattened to a single level: every non-root, non-deleted comment whose ancestry chain terminates at that top-level comment is a candidate for the `replies` array regardless of how deeply it was nested, and the 20 most recent non-deleted replies are selected (ordered oldest→newest within that capped window). Soft-deleted (`is_deleted = true`) replies MUST NOT consume the 20-slot budget; a tombstone row is included in the inline `replies` array only when it is an ancestor of a reply that _was_ selected into the capped window, so the UI can still render a "replying to deleted comment" reference. Each top-level comment MUST also carry a `replies_count` (total non-deleted descendants, excluding tombstones — consistent with `comment_count` semantics in FR-021) and a `has_more_replies` boolean. The original `parent_comment_id` MUST be preserved on every reply so the UI can render the "replying to" reference. Every comment node (top-level and reply) MUST include author info, like count, current user like status, edit flag, and `parent_comment_id`.
- **FR-006a**: System MUST provide a separate paginated query to fetch additional flattened replies for a given top-level comment (default `limit` = 20, maximum `limit` = 50), used by the UI when `has_more_replies` is true.
- **FR-007**: System MUST allow authenticated users to add a comment to a post (top-level or reply) via the existing `add_comment` database function. When the caller supplies a `parent_comment_id` that itself has a non-null `parent_comment_id` (i.e., targets a reply rather than a top-level comment), the server action MUST resolve and substitute the top-level ancestor's id before invoking `add_comment`, so the stored `parent_comment_id` always points to a top-level comment. This preserves the 2-level read model without surfacing a validation error to the caller.
- **FR-008**: System MUST return the newly created comment (with author info) after a successful add-comment operation.
- **FR-009**: System MUST allow authenticated users to edit their own comments, setting the edited flag and edited timestamp.
- **FR-009a**: Add-comment and edit-comment server actions MUST validate `content` via Zod at the boundary: trimmed length MUST be ≥ 1 and ≤ 2000 characters. Violations MUST return a structured validation error (not a database-level failure).
- **FR-010**: System MUST reject comment edit attempts by any user who is not the comment's author.
- **FR-011**: System MUST allow authenticated users to soft-delete their own comments by setting `is_deleted = true` and clearing the `content` field. Soft-deleted comments MUST remain in the database so descendant replies stay threaded; read queries MUST still return the row with a tombstone marker (empty content + `is_deleted` flag) so the UI can render a "replying to deleted comment" placeholder.
- **FR-011a**: Soft-deleted comments MUST be excluded from edit, like-toggle, and reply-target resolution — any mutation targeting an `is_deleted = true` comment MUST return a structured not-found error.
- **FR-012**: System MUST reject comment delete attempts by any user who is not the comment's author.
- **FR-013**: System MUST allow authenticated users to toggle a like on a comment, returning the new like status and updated count.
- **FR-014**: System MUST allow authenticated users to soft-delete their own posts by setting `content_status` to `removed`; soft-deleted posts MUST be excluded from feed, profile, and detail queries. Storage attachment files MUST be preserved (no deletion from storage) to retain an audit/moderation trail.
- **FR-015**: System MUST reject post delete attempts by any user who is not the post's author.
- **FR-016**: System MUST provide a paginated query for a specific user's published community posts, using the same pagination contract as FR-001 (default `limit` = 10, maximum `limit` = 50).
- **FR-017**: System MUST provide a query for a single post's full detail including all attachments, engagement counts, and current user's like/bookmark status. The detail query MUST enforce strict visibility: any post whose `content_status` is not `published` (i.e., `draft` or `removed`) MUST return a `POST_NOT_FOUND` error for every caller, including the post's own author. Draft authoring and edit flows are out of scope for this phase and will be served by a separate query in a later phase.
- **FR-018**: All authenticated operations MUST verify the current user's identity before performing the action and return an authentication error if no valid session exists.
- **FR-018a**: Mutating actions that accrue engagement on a post (toggle post like, toggle post bookmark, add comment, edit comment, toggle comment like) MUST verify that the target post's `content_status` is `published` and return a structured not-found error when it is `draft` or `removed`, so that tombstoned or unpublished posts cannot accrue new engagement. For comment-level mutations, the "target post" is the post that owns the comment (resolved via `community_post_comments.post_id`). The not-found error MUST be raised by throwing `CustomError('POST_NOT_FOUND', …)` so the shared `errorHandler()` emits `{ success: false, code: 'POST_NOT_FOUND', message }`, giving the UI a stable machine-readable discriminator distinct from auth and validation errors. The single-post detail query (FR-017) MUST use the same `POST_NOT_FOUND` code when returning its not-found error. For the **add-comment** mutation specifically, the `add_comment` RPC MUST be updated to perform this `content_status = 'published'` check inside the database function and raise an error when the check fails; the server action MUST catch that DB error and re-throw `CustomError('POST_NOT_FOUND', …)` so the response shape remains uniform with the other gated mutations. For toggle-post-like, toggle-post-bookmark, and toggle-comment-like, the `content_status = 'published'` check is performed **inside** the dedicated RPC function (see FR-020) and raised as a DB error which the server action catches and re-throws as `CustomError('POST_NOT_FOUND', …)`. For edit-comment, which has no RPC in this phase, the server action performs the check directly via a lightweight `SELECT` on `community_posts` before the mutation. Delete-own-comment is intentionally NOT gated by this rule — authors retain agency to soft-delete their own comments regardless of the parent post's status, since deletion does not accrue engagement.
- **FR-019**: All server actions MUST return structured responses with success/failure status and meaningful error messages, wrapped consistently via the shared error handler.
- **FR-020**: Like and bookmark toggle operations MUST be atomic at the database boundary. This is achieved via dedicated Postgres RPC functions — `toggle_post_like`, `toggle_post_bookmark`, and `toggle_comment_like` — each of which performs the check-and-swap (insert-if-absent / delete-if-present) inside a single SQL function and returns the new state plus updated count in the same round-trip. Server actions MUST call these RPCs rather than performing check-then-act from the application layer. The FR-018a `content_status = 'published'` gate for these three RPCs MUST be performed inside the SQL function; when the gate fails the function raises a DB error that the server action catches and re-throws as `CustomError('POST_NOT_FOUND', …)` — uniform with the `add_comment` treatment in FR-018a.
- **FR-020a**: Toggle actions (post like, post bookmark, comment like) MUST NOT apply an author check — a user MAY like and/or bookmark their own posts and MAY like their own comments.
- **FR-021**: The feed query MUST compute like count and comment count from relation data so they remain consistent with the actual records. `comment_count` MUST include every non-deleted comment on the post — top-level plus all replies at any depth — while excluding rows with `is_deleted = true`. The same count definition applies to the post-detail query (FR-017) and the user-posts query (FR-016).
- **FR-022**: System MUST expose each query through a corresponding server action wrapped with the shared error handler.
- **FR-023**: The `add_comment` database function MUST be called without passing an author ID — the function derives the author from the current session.
- **FR-024**: Server actions that mutate post or comment data MUST call `revalidatePath` for the community feed root (`/[locale]/community`) and for the **post author's** profile page (`/[locale]/profile/[postAuthorId]`) so clients see fresh data on next fetch. This applies uniformly to both post-level mutations (delete post, toggle post like, toggle post bookmark) and comment-level mutations (add comment, edit comment, delete comment, toggle comment like) — since the profile community tab surfaces posts (FR-016), the post author's profile is the only one whose cached view goes stale when aggregate engagement on their post changes. The commenting user's own profile is NOT revalidated by comment mutations in this phase.
- **FR-025**: Queries MUST return a placeholder author stub (`{ id: null, name: "Deleted user" (localized), avatar_url: null }`) for any post or comment whose author profile cannot be resolved, instead of dropping or erroring on the record, so pagination counts and feed continuity remain correct.
- **FR-026**: Post attachment records returned by the feed, post-detail, and user-posts queries MUST expose stable public URLs resolved from the `community-attachments` storage bucket (public-read). Queries MUST NOT return raw storage paths or short-lived signed URLs.
- **FR-027**: Read queries (feed, post-detail, user-posts, comments) MUST return `is_liked` and `is_bookmarked` as plain `boolean` values for every record, in every response. When the caller is unauthenticated, both flags MUST be literal `false` — never `null`, never omitted — so the response shape remains a single stable type across authenticated and unauthenticated calls.
- **FR-028**: All paginated queries (feed, user-posts, top-level comments, more-replies) MUST return a uniform response envelope `{ data, has_more, next_page }`. `data` is the array of records for the current page (capped at `limit`). `has_more` MUST be derived by fetching `limit + 1` rows in a single query and checking whether the extra row exists — no separate `COUNT(*)` round-trip is permitted. `next_page` MUST be `page + 1` when `has_more` is `true`, otherwise `null`. The post-detail query (FR-017) is not paginated and is exempt from this envelope.
- **FR-029**: Author-only mutations (edit comment — FR-010; delete comment — FR-012; delete post — FR-015) MUST be enforced in two layers: (1) **Postgres RLS policies** scoped to `author_id = auth.uid()` on `UPDATE`/`DELETE` for `community_posts` and `community_post_comments` — this phase includes a migration adding these policies, and they serve as the authoritative, unbypassable gate; (2) an **application-level preflight** in each server action that selects the target row filtered by `author_id = session.user.id` and, on miss, throws `CustomError('UNAUTHORIZED', …)` so the shared `errorHandler()` emits a clean `{ success: false, code: 'UNAUTHORIZED', message }` response instead of surfacing a raw Postgres permission error to the UI. The two layers are complementary: the preflight shapes the error for the UI; RLS guarantees correctness even if the preflight is ever bypassed by a future code path.
- **FR-030**: List queries (feed, user-posts, post-detail, top-level comments, more-replies) MUST resolve per-caller `is_liked` and `is_bookmarked` inline using correlated `EXISTS` (or `LEFT JOIN ... IS NOT NULL`) subqueries against the per-user relations (`community_posts_likes`, `bookmarked_posts`, `community_comments_likes`), scoped to `auth.uid()` derived from the Supabase session. A single round-trip per page is required — no separate "hydrate flags" round-trip is permitted. When `auth.uid()` is null (unauthenticated caller), the correlated subquery naturally evaluates to `false` for every row, satisfying FR-027 without any server-action branching.

### Key Entities

- **Community Post**: A piece of content with title, body, category, author, content status, and timestamps. The central entity that all other entities in this feature reference.
- **Post Like**: A relationship between a user and a post indicating the user has liked it. Used to compute like counts and per-user like status.
- **Post Bookmark**: A relationship between a user and a post indicating the user has saved it for later. Used to determine per-user bookmark status.
- **Comment**: Text content attached to a post, authored by a user, optionally replying to another comment. Supports editing and liking, tracks edited state.
- **Comment Like**: A relationship between a user and a comment indicating the user has liked it.
- **Post Attachment**: A file (image or document) associated with a post, stored in external storage with a URL reference. Lifecycle is tied to the parent post.
- **Post Author (User)**: The user who created a post or comment. Exposed as a subset (id, name, avatar) in query results for display purposes.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Every query function returns data matching its declared shape, with zero runtime type mismatches across the full set of functions.
- **SC-002**: Paginated feed queries return the correct number of items per page with zero duplicates across consecutive pages.
- **SC-003**: Like and bookmark toggle responses always reflect the persisted state — a caller reading the returned status immediately after the toggle never observes a mismatch with the database.
- **SC-004**: Comment edit, comment delete, and post delete operations reject every attempt by a non-author — unauthorized attempts succeed 0% of the time.
- **SC-005**: Soft-deleted posts (`content_status = 'removed'`) are excluded from 100% of feed, profile, and detail query results — zero leakage across all read paths.
- **SC-006**: All server actions return a structured error response (never an unhandled exception) for every failure case including auth errors, not-found, and validation errors.
- **SC-007**: Every query function in the phase has a corresponding server action wrapper, and all wrappers pass through the shared error handler.
- **SC-008**: Unauthenticated callers of read-only queries receive valid post/comment data with per-user flags set to false — no errors, no partial responses.

## Assumptions

- The Supabase TypeScript types will be regenerated (`npx supabase gen types`) to include the `add_comment` RPC function and any recent schema changes before implementation begins.
- The existing shared error handler utility is used to wrap every server action consistently.
- The existing server-side authentication pattern (Supabase client with cookie handling) is used for all authenticated operations.
- The database tables `community_posts`, `community_posts_likes`, `bookmarked_posts`, `community_post_comments`, `community_comments_likes`, and `community_posts_attachments` already exist with the schema described in the project plan document.
- The storage bucket for community attachments is already configured and accessible.
- The existing listings bookmark toggle pattern serves as the reference implementation for the community post bookmark toggle.
- The `add_comment` database function exists and derives the author from the current session — no author ID parameter is needed. A migration in this phase updates `add_comment` to additionally verify the target post's `content_status = 'published'` and raise an error otherwise, per FR-018a.
- This phase produces only the data access layer (queries + server actions). No UI components, pages, hooks, or client components are created — those belong to subsequent phases.
- This phase depends on Phase 1 (`shared-infinite-scroll`) being available for consumers, but the queries themselves have no runtime dependency on that phase and can be implemented in parallel.
