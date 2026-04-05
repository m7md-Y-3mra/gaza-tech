# Server-Action Contracts — Community Feed Queries

Feature: 006-community-feed-queries | Date: 2026-04-05

All server actions live in `modules/community/actions.ts`, are wrapped with `errorHandler()`, and return either `{ success: true, data }` or `{ success: false, code?, message, errors? }`. Query functions they invoke live in `modules/community/queries.ts`.

Type references (`FeedPost`, `TopLevelComment`, `CommentNode`, `Page<T>`, `AuthorStub`, result types) are defined in `data-model.md` §3 and exported from `modules/community/types/index.ts`.

---

## Read queries (all paginated except post-detail)

### `getCommunityFeedAction(input)`

```ts
type GetCommunityFeedInput = {
  page?: number; // default 1
  limit?: number; // default 10, max 50
  category?: 'questions' | 'tips' | 'news' | 'troubleshooting';
};

type GetCommunityFeedResult = Page<FeedPost>;
```

- Invokes RPC `get_community_feed(p_page, p_limit, p_category)`.
- Validates input via `feedQuerySchema`.
- Unauthenticated calls succeed; `is_liked` and `is_bookmarked` return `false`.
- Errors: Zod validation error for invalid `category`.

### `getUserCommunityPostsAction(input)`

```ts
type GetUserCommunityPostsInput = {
  user_id: string;
  page?: number; // default 1
  limit?: number; // default 10, max 50
};

type GetUserCommunityPostsResult = Page<FeedPost>;
```

- Invokes RPC `get_user_community_posts(p_user_id, p_page, p_limit)`.
- Same ordering contract as the feed: `published_at DESC, post_id DESC`.

### `getCommunityPostDetailAction(input)`

```ts
type GetCommunityPostDetailInput = { post_id: string };
type GetCommunityPostDetailResult = FeedPost;
```

- Invokes RPC `get_community_post_detail(p_post_id)`.
- Raises `CustomError({ code: 'POST_NOT_FOUND', message })` if the post is missing, `draft`, or `removed` — **even for the author** (FR-017).

### `getPostCommentsAction(input)`

```ts
type GetPostCommentsInput = {
  post_id: string;
  page?: number; // default 1
  limit?: number; // default 10, max 50
};

type GetPostCommentsResult = Page<TopLevelComment>;
```

- Invokes RPC `get_post_comments(p_post_id, p_page, p_limit)`.
- Each top-level comment includes up to 20 non-deleted flattened descendants in `replies`, plus `replies_count` and `has_more_replies`.
- Soft-deleted parents are returned as tombstones only when referenced by a surviving reply.

### `getCommentRepliesAction(input)`

```ts
type GetCommentRepliesInput = {
  comment_id: string; // top-level comment id
  page?: number; // default 1
  limit?: number; // default 20, max 50
};

type GetCommentRepliesResult = Page<CommentNode>;
```

- Invokes RPC `get_comment_replies(p_comment_id, p_page, p_limit)`.
- Used by the UI when `has_more_replies` is true.
- Ordering: `created_at ASC, comment_id ASC`.
- Returns non-deleted replies only (tombstones are omitted here because the caller already has the initial inline 20; "more replies" is exclusively the user-visible remainder).

---

## Mutations — post engagement

### `togglePostLikeAction(input)`

```ts
type TogglePostLikeInput = { post_id: string };
type TogglePostLikeResult = { is_liked: boolean; like_count: number };
```

- Requires session (`UNAUTHENTICATED` otherwise).
- Invokes RPC `toggle_post_like(p_post_id)`.
- The RPC gates on `content_status = 'published'`; on failure the server action re-throws `CustomError({ code: 'POST_NOT_FOUND', message })`.
- Self-like allowed (no author check).
- **Revalidates**: `/community`, `/profile/${postAuthorId}` (the post's author).

### `togglePostBookmarkAction(input)`

```ts
type TogglePostBookmarkInput = { post_id: string };
type TogglePostBookmarkResult = { is_bookmarked: boolean };
```

- Requires session.
- Invokes RPC `toggle_post_bookmark(p_post_id)`.
- Gated on `content_status = 'published'`.
- Self-bookmark allowed.
- **Revalidates**: `/community`, `/profile/${postAuthorId}`.

### `deleteCommunityPostAction(input)`

```ts
type DeleteCommunityPostInput = { post_id: string };
type DeleteCommunityPostResult = { post_id: string };
```

- Author-only — preflight `SELECT post_id, author_id FROM community_posts WHERE post_id = ?`.
  - Row missing or `content_status <> 'published'` → `CustomError({ code: 'POST_NOT_FOUND', … })`.
  - `author_id <> session.user.id` → `CustomError({ code: 'UNAUTHORIZED', … })`.
- Performs `UPDATE community_posts SET content_status = 'removed' WHERE post_id = ?`. RLS still enforces the invariant.
- Storage files are **not** deleted (FR-014).
- **Revalidates**: `/community`, `/profile/${session.user.id}` (the post's author == session user).

---

## Mutations — comments

### `addCommentAction(input)`

```ts
type AddCommentInput = {
  post_id: string;
  parent_comment_id?: string | null;
  content: string; // validated min 1 / max 2000 trimmed
};
type AddCommentResult = CommentNode;
```

- Requires session.
- Validates `content` via `commentContentSchema`.
- Invokes RPC `add_comment(p_post_id, p_parent_comment_id, p_content)`.
  - RPC enforces `content_status = 'published'` → `POST_NOT_FOUND` on failure.
  - RPC auto-rewrites `parent_comment_id` to the top-level ancestor if caller supplied a reply id.
  - RPC rejects missing / tombstoned parents with `COMMENT_NOT_FOUND`.
- Returns the newly created comment with its author stub hydrated in the same RPC call.
- **Revalidates**: `/community`, `/profile/${postAuthorId}`.

### `editOwnCommentAction(input)`

```ts
type EditOwnCommentInput = { comment_id: string; content: string };
type EditOwnCommentResult = CommentNode;
```

- Requires session.
- Validates `content` via `commentContentSchema`.
- Preflight: `SELECT comment_id, author_id, post_id, is_deleted FROM community_post_comments WHERE comment_id = ?`.
  - Missing or `is_deleted = true` → `COMMENT_NOT_FOUND`.
  - `author_id <> session.user.id` → `UNAUTHORIZED`.
  - Lookup parent post's `content_status`; if not `'published'` → `POST_NOT_FOUND` (FR-018a).
- `UPDATE community_post_comments SET content = ?, is_edited = true, edited_at = now() WHERE comment_id = ?`. RLS also enforces author scope.
- **Revalidates**: `/community`, `/profile/${postAuthorId}`.

### `deleteOwnCommentAction(input)`

```ts
type DeleteOwnCommentInput = { comment_id: string };
type DeleteOwnCommentResult = { comment_id: string };
```

- Requires session.
- Preflight: `SELECT comment_id, author_id, post_id, is_deleted FROM community_post_comments WHERE comment_id = ?`.
  - Missing or `is_deleted = true` → `COMMENT_NOT_FOUND`.
  - `author_id <> session.user.id` → `UNAUTHORIZED`.
- **Not gated** on post `content_status` — authors may delete their own comments even on unpublished posts (FR-018a clarification).
- `UPDATE community_post_comments SET is_deleted = true, content = '' WHERE comment_id = ?`.
- **Revalidates**: `/community`, `/profile/${postAuthorId}`.

### `toggleCommentLikeAction(input)`

```ts
type ToggleCommentLikeInput = { comment_id: string };
type ToggleCommentLikeResult = { is_liked: boolean; like_count: number };
```

- Requires session.
- Invokes RPC `toggle_comment_like(p_comment_id)`.
  - Resolves the parent post, gates on `content_status = 'published'` → `POST_NOT_FOUND`.
  - Gates on `is_deleted = false` → `COMMENT_NOT_FOUND`.
- Self-like allowed.
- **Revalidates**: `/community`, `/profile/${postAuthorId}`.

---

## Error envelope — all actions

| Failure mode                                 | `code`              | `message` (example)                                 |
| -------------------------------------------- | ------------------- | --------------------------------------------------- |
| Zod validation                               | (none)              | `"Validation error"` + `errors` map                 |
| No session                                   | `UNAUTHENTICATED`   | `"You must be signed in"`                           |
| Post unpublished / missing / removed         | `POST_NOT_FOUND`    | `"Post not found"`                                  |
| Comment missing / tombstoned (for mutations) | `COMMENT_NOT_FOUND` | `"Comment not found"`                               |
| Non-author mutation attempt                  | `UNAUTHORIZED`      | `"You are not authorised to perform this action"`   |
| Unexpected DB / network                      | (none)              | `"An unexpected error occurred. Please try again."` |

All messages are localized in the UI layer — server actions return **English source strings** and stable `code` values; the UI selects the localized string off the code. This matches the existing pattern in `utils/error-handler.ts` where messages are currently English.

---

## Invariants every caller can rely on

1. `{ data, has_more, next_page }` envelope for every paginated read.
2. `is_liked` / `is_bookmarked` are **always** booleans (never `null`, never omitted), even for anonymous callers.
3. `comment_count` on posts and `replies_count` on comments **exclude** tombstones.
4. `parent_comment_id` on every comment reply points to a **top-level** comment (enforced at write time).
5. Every mutation that could change a post's visible state triggers `revalidatePath('/community')` + `revalidatePath('/profile/${postAuthorId}')`.
6. Non-author mutation attempts surface `code: 'UNAUTHORIZED'`, never a raw Postgres `42501`.
