# Phase 1 — Data Model: Community Feed Queries

Feature: 006-community-feed-queries | Date: 2026-04-05

This document describes the **logical** shape of data exposed by the queries/server actions — including table fields touched, computed columns, response envelopes, and the migration delta. Database column names are snake_case end-to-end (matches spec clarification Q27).

---

## 1. Tables touched

### `community_posts` (existing — columns of interest)

| Column                     | Type                     | Notes                                                                   |
| -------------------------- | ------------------------ | ----------------------------------------------------------------------- |
| `post_id`                  | `uuid` PK                |                                                                         |
| `author_id`                | `uuid` → `users.user_id` | RLS: authors may UPDATE/DELETE their own row.                           |
| `title`                    | `text`                   |                                                                         |
| `content`                  | `text`                   |                                                                         |
| `post_category`            | `text`                   | Validated client-side against `POST_CATEGORIES` enum.                   |
| `content_status`           | `text`                   | `'draft' \| 'published' \| 'removed'`. Soft-delete sets to `'removed'`. |
| `published_at`             | `timestamptz`            | Feed ordering primary key.                                              |
| `post_id` (tiebreaker)     | `uuid`                   | Feed ordering secondary key (stable).                                   |
| `created_at`, `updated_at` | `timestamptz`            |                                                                         |

**Read filter**: all public query paths filter on `content_status = 'published'`.

### `community_post_comments` (existing — **migration adds two columns**)

| Column                     | Type                                                   | Notes                                                                                                |
| -------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `comment_id`               | `uuid` PK                                              |                                                                                                      |
| `post_id`                  | `uuid` → `community_posts.post_id`                     |                                                                                                      |
| `author_id`                | `uuid` → `users.user_id`                               | RLS: authors may UPDATE/DELETE.                                                                      |
| `content`                  | `text`                                                 | Blanked on soft-delete.                                                                              |
| `is_edited`                | `boolean` default `false`                              | Set by edit mutation.                                                                                |
| `edited_at`                | `timestamptz` nullable                                 | Set by edit mutation.                                                                                |
| `parent_comment_id`        | `uuid` nullable → `community_post_comments.comment_id` | **NEW (migration).** Always points to a **top-level** comment (write-time rewrite in `add_comment`). |
| `is_deleted`               | `boolean` default `false`                              | **NEW (migration).** Tombstone flag.                                                                 |
| `created_at`, `updated_at` | `timestamptz`                                          |                                                                                                      |

**Index added by migration**: `(post_id, parent_comment_id, created_at)` — supports the top-level list scan and the capped-replies lateral join in `get_post_comments`.

### `community_posts_likes` (existing)

| Column       | Type                                 |
| ------------ | ------------------------------------ |
| `post_id`    | `uuid` PK (composite with `user_id`) |
| `user_id`    | `uuid` PK (composite)                |
| `created_at` | `timestamptz`                        |

### `bookmarked_posts` (existing)

Same shape as `community_posts_likes` — `(post_id, user_id)` composite PK.

### `community_comments_likes` (existing)

| Column       | Type                                 |
| ------------ | ------------------------------------ |
| `comment_id` | `uuid` PK (composite with `user_id`) |
| `user_id`    | `uuid` PK (composite)                |
| `created_at` | `timestamptz`                        |

### `community_posts_attachments` (existing)

| Column          | Type                                                    |
| --------------- | ------------------------------------------------------- |
| `attachment_id` | `uuid` PK                                               |
| `post_id`       | `uuid` → `community_posts.post_id`                      |
| `file_url`      | `text` — public URL from `community-attachments` bucket |
| `created_at`    | `timestamptz`                                           |

### `users` (existing — subset exposed via author stub)

Exposed fields in query results: `user_id`, `first_name`, `last_name`, `avatar_url`.

Display name is `first_name + ' ' + last_name`. When the row cannot be resolved (deleted account / missing row), queries emit a **placeholder author stub**:

```ts
{ id: null, name: '<localized "Deleted user">', avatar_url: null }
```

---

## 2. Response envelopes

All paginated queries return:

```ts
type Page<T> = {
  data: T[]; // at most `limit` records
  has_more: boolean; // derived by fetching limit+1 rows internally
  next_page: number | null;
};
```

Single-row queries (post detail) return the row directly or throw `CustomError('POST_NOT_FOUND', …)`.

Mutation server actions return `{ success, data?, code?, message?, errors? }` via the shared `errorHandler()`.

---

## 3. Response entity shapes

### 3.1 `FeedPost` (feed, user-posts, post-detail)

```ts
type AuthorStub = {
  id: string | null; // null when the author row is unresolvable
  name: string; // "first_name last_name" or localized "Deleted user"
  avatar_url: string | null;
};

type FeedAttachment = {
  attachment_id: string;
  file_url: string; // stable public URL, FR-026
};

type FeedPost = {
  post_id: string;
  author: AuthorStub;
  title: string;
  content: string; // full body for detail; feed may pass preview via UI, not trimmed here
  post_category: string;
  published_at: string; // ISO timestamp
  attachments: FeedAttachment[];
  like_count: number;
  comment_count: number; // non-deleted comments only (FR-021)
  is_liked: boolean; // literal false for unauthenticated callers
  is_bookmarked: boolean; // literal false for unauthenticated callers
};
```

### 3.2 `CommentNode` and `TopLevelComment`

```ts
type CommentNode = {
  comment_id: string;
  post_id: string;
  author: AuthorStub;
  content: string; // empty string when is_deleted = true
  parent_comment_id: string | null; // preserved for UI "replying to" reference
  is_edited: boolean;
  edited_at: string | null;
  is_deleted: boolean; // tombstone flag
  created_at: string;
  like_count: number;
  is_liked: boolean; // literal false for unauthenticated
};

type TopLevelComment = CommentNode & {
  replies: CommentNode[]; // at most 20, oldest→newest within capped window
  replies_count: number; // total non-deleted descendants (excludes tombstones)
  has_more_replies: boolean; // replies_count > 20
};
```

Note: the `replies` array may include a **tombstone** row only when it is the immediate parent of a reply selected into the 20-slot window — per FR-006 and the FR-011 placeholder rule. Tombstones never consume the 20-slot budget.

### 3.3 Mutation results

```ts
type TogglePostLikeResult = { is_liked: boolean; like_count: number };
type TogglePostBookmarkResult = { is_bookmarked: boolean };
type ToggleCommentLikeResult = { is_liked: boolean; like_count: number };

type AddCommentResult = CommentNode; // no inline replies at creation time
type EditCommentResult = CommentNode;

type DeletePostResult = { post_id: string }; // soft-deleted
type DeleteCommentResult = { comment_id: string }; // soft-deleted (is_deleted = true)
```

---

## 4. State transitions

### Post lifecycle

```
draft  ──(publish)──▶  published  ──(soft-delete)──▶  removed
                            ▲                              │
                            └──(no un-delete in this phase)┘
```

Only the `soft-delete` transition is exposed by this feature. `draft → published` is handled by the create/update flows (out of scope).

### Comment lifecycle

```
created (is_deleted=false)  ──(soft-delete)──▶  tombstone (is_deleted=true, content='')
                                                         │
                                                         └── reads still return the row;
                                                             edits/likes are rejected
                                                             with COMMENT_NOT_FOUND
```

---

## 5. Validation rules (at the server-action boundary)

| Input             | Rule                                                                                                                   | Source                  |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `page`            | integer ≥ 1, default `1`                                                                                               | FR-001, FR-028          |
| `limit`           | integer 1–50, default `10` (top-level comments / feed / user-posts). For `get_comment_replies`: default `20`, max `50` | FR-001, FR-006, FR-006a |
| `category` (feed) | enum `'questions' \| 'tips' \| 'news' \| 'troubleshooting'`, optional                                                  | FR-001                  |
| `post_id`         | valid UUID                                                                                                             | implicit                |
| `comment_id`      | valid UUID                                                                                                             | implicit                |
| `comment content` | trimmed length ≥ 1, ≤ 2000                                                                                             | FR-009a                 |

Violations return a structured validation error via `ZodError → errorHandler`. They never reach the database.

---

## 6. Error codes

All codes are emitted via `CustomError({ message, code })` and propagated by `errorHandler` as `{ success: false, code, message }`.

| Code                | Raised when                                                | Emitted by                                                 |
| ------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| `POST_NOT_FOUND`    | Post is missing, `draft`, or `removed`                     | feed detail read; all engagement mutations under FR-018a   |
| `COMMENT_NOT_FOUND` | Comment is missing or `is_deleted = true` (for mutations)  | edit-comment, toggle-comment-like, reply target resolution |
| `UNAUTHORIZED`      | Caller is not the row's author for an author-only mutation | delete post, edit/delete own comment                       |
| `UNAUTHENTICATED`   | No valid session for an authenticated-only action          | every mutation, bookmark/like toggles                      |

Validation errors (Zod) are emitted via the existing `message: 'Validation error', errors: {...}` shape — no `code` field.

---

## 7. Migration delta (summary)

```sql
-- 006_community_feed_queries.sql
BEGIN;

-- Schema additions
ALTER TABLE community_post_comments
  ADD COLUMN parent_comment_id uuid NULL REFERENCES community_post_comments(comment_id),
  ADD COLUMN is_deleted boolean NOT NULL DEFAULT false;

CREATE INDEX community_post_comments_post_parent_created_idx
  ON community_post_comments (post_id, parent_comment_id, created_at);

-- RLS policies (author-only UPDATE/DELETE + broad SELECT)
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY community_posts_read ON community_posts
  FOR SELECT TO anon, authenticated
  USING (content_status = 'published' OR author_id = auth.uid());

CREATE POLICY community_posts_author_update ON community_posts
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

CREATE POLICY community_posts_author_delete ON community_posts
  FOR DELETE TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY community_post_comments_read ON community_post_comments
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY community_post_comments_author_update ON community_post_comments
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

CREATE POLICY community_post_comments_author_delete ON community_post_comments
  FOR DELETE TO authenticated
  USING (author_id = auth.uid());

-- (RPC functions defined in contracts/rpc-functions.sql)

COMMIT;
```

The full RPC function bodies live in `contracts/rpc-functions.sql`.

---

## 8. Invariants enforced by this feature

1. **Published visibility**: no `draft` or `removed` post leaks through any read path (feed, detail, user-posts, comments — via the `post_id` join).
2. **Two-level threading at rest**: every non-root `community_post_comments` row has `parent_comment_id` pointing to a row whose own `parent_comment_id IS NULL`.
3. **Stable pagination**: `(published_at DESC, post_id DESC)` for posts; `(created_at ASC, comment_id ASC)` for top-level comments; lateral reply window is `ORDER BY created_at DESC LIMIT 20` (most recent 20).
4. **Counts exclude tombstones**: `comment_count` on post queries and `replies_count` on comment queries count `is_deleted = false` only.
5. **Per-caller flags are always present**: `is_liked` / `is_bookmarked` are returned as literal booleans on every row, for every caller, authenticated or not.
6. **Author stub continuity**: records whose author row is unresolvable are still returned with the placeholder stub — pagination counts never shift.
