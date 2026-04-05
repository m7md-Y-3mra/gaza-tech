# Quickstart Run — Community Feed Queries

Feature: 006-community-feed-queries | Run date: 2026-04-05

---

## RLS Policy Probe

Executed via `mcp__supabase__execute_sql` on project `biekkaxdittvxqgvmepf`:

```sql
SELECT polname FROM pg_policy
WHERE polrelid IN (
  'public.community_posts'::regclass,
  'public.community_post_comments'::regclass
)
ORDER BY polname;
```

**Result** — all six T001 policies confirmed present:

| Policy name                           |
| ------------------------------------- |
| community_post_comments_author_delete |
| community_post_comments_author_update |
| community_post_comments_read          |
| community_posts_author_delete         |
| community_posts_author_update         |
| community_posts_read                  |

Additional pre-existing policies also present (from earlier migrations):
`Anyone can view comments on published posts`, `Anyone can view published posts`,
`Authenticated users can create comments`, `Authenticated users can create posts`,
`Authors can delete own comments`, `Authors can delete own posts`,
`Authors can update own comments`, `Authors can update own posts`,
`Authors can view own posts`, `Moderators can delete any comment`,
`Moderators can delete any post`, `Moderators can update any post`,
`Moderators can view all posts`.

---

## Scenario Verification

Scenarios requiring a live seeded database must be executed manually. Code-level
evidence is recorded per scenario.

### 1. Feed pagination + ordering (FR-001, FR-002, FR-028)

- Code evidence: `getCommunityFeedQuery` (queries.ts:338-362) fetches `limit+1` rows,
  slices to `limit`, sets `has_more` / `next_page`. RPC `get_community_feed` ordered by
  `published_at DESC, post_id DESC` (verified via types/supabase.ts:1030).
- Manual run: **Pending** — requires ≥ 25 seeded published posts.

### 2. Category filter + validation (FR-001)

- Code evidence: `feedQuerySchema.parse` at queries.ts:343 applies `postCategorySchema`
  (enum validated). Invalid category → Zod error → `errorHandler` returns
  `{ success: false, message: 'Validation error', errors: { category: ... } }`.
- Manual run: **Pending**.

### 3. Unauthenticated read (FR-027, SC-008)

- Code evidence: `get_community_feed` RPC uses `auth.uid()` in correlated EXISTS for
  `is_liked`/`is_bookmarked`; returns `false` when `uid()` is null. RLS policy
  `community_posts_read` allows anon reads on published posts.
- Manual run: **Pending**.

### 4. Like toggle atomicity (FR-004, FR-020, SC-003)

- Code evidence: `toggle_post_like` RPC is plpgsql with DELETE+INSERT in one transaction
  (types/supabase.ts:1131). Consumer at queries.ts:366-388.
- Manual run: **Pending**.

### 5. Bookmark self-like (FR-020a)

- Code evidence: No self-like prohibition in `toggle_post_like` or `toggle_post_bookmark`
  RPCs. Server-side auth gate is only `UNAUTHENTICATED`.
- Manual run: **Pending**.

### 6. Unpublished-post gating (FR-018a)

- Code evidence: All mutation RPCs gate on `content_status = 'published'` and raise
  `POST_NOT_FOUND`. `deleteOwnCommentAction` does NOT gate on post status (carve-out
  implemented at queries.ts:688-740).
- Manual run: **Pending**.

### 7. Comment threading — read path (FR-006, FR-006a)

- Code evidence: `get_post_comments` RPC returns `replies` jsonb (≤ 20), `replies_count`,
  `has_more_replies`. Mapped at queries.ts:457-505. `getCommentRepliesQuery` available for
  follow-up pages.
- Manual run: **Pending** — requires seeded post with 22+ replies.

### 8. Comment threading — write path auto-rewrite (FR-007)

- Code evidence: `add_comment` RPC auto-rewrites `parent_comment_id` to the top-level
  ancestor when the supplied parent itself has a non-null `parent_comment_id`
  (types/supabase.ts:994).
- Manual run: **Pending**.

### 9. Comment content validation (FR-009a)

- Code evidence: `commentContentSchema` at server-schema.ts:19-23 — `.trim().min(1).max(2000)`.
  Empty / whitespace-only / overlong inputs all rejected before the RPC is called.
- Manual run: **Pending** — straightforward to verify in isolation.

### 10. Author-only mutation enforcement (FR-010, FR-012, FR-015, FR-029)

- Code evidence: `editOwnCommentQuery` and `deleteOwnCommentQuery` check `author_id !== user.id`
  and throw `UNAUTHORIZED` before any mutation. RLS policies
  `community_posts_author_update`, `community_posts_author_delete`,
  `community_post_comments_author_update`, `community_post_comments_author_delete`
  provide defense-in-depth at the DB layer (confirmed in RLS probe above).
- Manual run: **Pending** — direct Supabase JS client test required for DB-layer check.

### 11. Comment soft-delete + tombstone visibility (FR-011, FR-011a)

- Code evidence: `deleteOwnCommentQuery` sets `is_deleted = true, content = ''`.
  `getPostCommentsQuery` maps tombstones via `mapCommentNodeRow` (preserves `is_deleted`
  and empty `content`). `editOwnCommentQuery` and `toggleCommentLikeQuery` throw
  `COMMENT_NOT_FOUND` when `is_deleted = true`.
- Manual run: **Pending**.

### 12. `comment_count` excludes tombstones (FR-021)

- Code evidence: `get_community_feed` and `get_community_post_detail` RPCs use correlated
  `COUNT` that excludes `is_deleted = true` comments (per contracts/rpc-functions.sql).
- Manual run: **Pending** — requires seeded post with known comment count.

### 13. Deleted-author stub (FR-025)

- Code evidence: `mapAuthorStub` at queries.ts:37-48 — when `raw.id === null`, returns
  `{ id: null, name: DELETED_USER_NAME_KEY, avatar_url: null }`.
- Manual run: **Pending** — requires an orphaned `author_id` row.

### 14. Post-detail strict visibility (FR-017)

- Code evidence: `get_community_post_detail` RPC raises `POST_NOT_FOUND` for any
  non-published post (including drafts/removed for the author). Consumer at
  queries.ts:418-447 throws `CustomError({ code: 'POST_NOT_FOUND' })` on empty result.
- Manual run: **Pending**.

### 15. Revalidation (FR-024)

- Code evidence (FR-024 fix verified in 001review.md → 002review.md):
  - All mutation actions call `revalidatePath('/community', 'page')`.
  - Comment-level mutations revalidate `/profile/${post_author_id}` — the post author's
    profile, not the commenter's. Fixed in Issue 1 of 001review.md.
- Manual run: **Pending** — requires running dev server with populated Next.js cache.

### 16. Error handler propagates `code` (cross-cutting)

- Code evidence: `CustomError` extended with `code?` at utils/CustomError.ts:1-21.
  `ApiResponseError` extended with `code?` at utils/error-handler.ts:11-16.
  `errorHandler` propagates `err.code` through the `CustomError` branch at lines 49-56.
- Manual run: **Pending** — can verify with a single `getCommunityPostDetailAction` call.

---

## Definition of Done Status

| Item                                                                         | Status                            |
| ---------------------------------------------------------------------------- | --------------------------------- |
| All 16 smoke scenarios pass                                                  | Pending manual run                |
| `npm run check` passes with zero errors                                      | ✅ Verified (2026-04-05)          |
| `types/supabase.ts` includes `parent_comment_id`, `is_deleted`, all new RPCs | ✅ Verified                       |
| No UI files / client components added                                        | ✅ Verified                       |
| Migration is documented under `contracts/rpc-functions.sql`                  | ✅ Verified                       |
| Every server action wrapped with `errorHandler()`                            | ✅ Verified                       |
| RLS policies T001 confirmed in database                                      | ✅ Verified via `pg_policy` probe |
