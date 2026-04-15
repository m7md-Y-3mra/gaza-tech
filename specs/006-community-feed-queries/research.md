# Phase 0 — Research: Community Feed Queries

Feature: 006-community-feed-queries | Date: 2026-04-05

All `NEEDS CLARIFICATION` items from the spec were resolved during `/speckit.clarify` (29 answers recorded in `spec.md` § Clarifications). This document captures the remaining **technical** decisions — patterns, library usage, schema shape — that inform Phase 1.

---

## 1. Single-round-trip per-caller flag hydration (`is_liked`, `is_bookmarked`)

**Decision**: Use correlated `EXISTS` subqueries inside a Postgres view-free `select(...)` with PostgREST embedded resources, scoped to `auth.uid()`.

For each feed / user-posts / post-detail row we attach three computed booleans:

```sql
-- Equivalent of the PostgREST select string used in the TS client:
SELECT
  cp.*,
  author:users(user_id, first_name, last_name, avatar_url),
  attachments:community_posts_attachments(*),
  like_count:community_posts_likes(count),
  comment_count:community_post_comments(count, is_deleted.eq.false),
  is_liked:community_posts_likes!inner(user_id.eq.auth.uid()),        -- EXISTS
  is_bookmarked:bookmarked_posts!inner(user_id.eq.auth.uid())         -- EXISTS
FROM community_posts cp
WHERE cp.content_status = 'published'
ORDER BY published_at DESC, post_id DESC
LIMIT 11 OFFSET (page - 1) * 10;
```

Because the Supabase JS client does not currently support `EXISTS` with `auth.uid()` expression in a single `.select()` string across embedded tables cleanly, the implementation uses one of two equivalent approaches:

- **Approach A (preferred)**: wrap the query in a Postgres SQL function `get_community_feed(p_page int, p_limit int, p_category text)` that returns a set of rows with the booleans already computed; the server action invokes it via `client.rpc('get_community_feed', …)`. Clean, single round-trip, authoritative.
- **Approach B (fallback)**: use `.select()` with aggregated count relations and then hydrate `is_liked` / `is_bookmarked` via a second `.select('post_id').in('post_id', pageIds)` query against the per-user relations (still one extra round-trip per page, not per row).

**Rationale**: Approach A keeps the commitment to one round-trip per page as stated in FR-030 and also lets `auth.uid()` be resolved from the session cookie by Postgres itself without the server action having to branch on authenticated/unauthenticated. It mirrors the existing `hybrid_search_listings` RPC pattern already present in the codebase (`types/supabase.ts:982`).

**Alternatives considered**:

- JOIN-with-CASE via PostgREST `select` string — rejected: the PostgREST embedded-resource filter syntax does not express `EXISTS ... WHERE user_id = auth.uid()` cleanly; attempting to route through an `!inner` join would silently filter out rows for unauthenticated callers and break FR-027.
- Client-side merging after two parallel selects — rejected: violates the spec's single-round-trip rule and doubles request latency.

**Choice**: Approach A — implement a `get_community_feed` SQL function and analogous `get_user_community_posts`, `get_community_post_detail`, `get_post_comments`, `get_comment_replies` functions. Each returns a set of rows that already contain the snake_case fields required by the envelope.

---

## 2. Atomic toggle RPCs

**Decision**: Three plpgsql functions, each `SECURITY INVOKER` (so RLS still applies) with `SET search_path = public` for safety:

```sql
-- toggle_post_like(p_post_id uuid) RETURNS TABLE(is_liked boolean, like_count bigint)
-- toggle_post_bookmark(p_post_id uuid) RETURNS TABLE(is_bookmarked boolean)
-- toggle_comment_like(p_comment_id uuid) RETURNS TABLE(is_liked boolean, like_count bigint)
```

Each function body:

1. `IF auth.uid() IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;`
2. Load the target post's `content_status` (for comment-like, join via `community_post_comments`). If not `'published'`, `RAISE EXCEPTION 'POST_NOT_FOUND'`.
3. Execute `DELETE ... RETURNING` against the pivot row. If a row was returned, the action was an unlike; otherwise `INSERT` a new row.
4. Return the new state plus the aggregate count in one `RETURN QUERY SELECT`.

**Rationale**: The `DELETE ... RETURNING` + conditional `INSERT` pattern is race-free at the isolation level Postgres uses for plpgsql functions and collapses check-and-swap into a single round-trip. Server actions translate the `POST_NOT_FOUND` / `UNAUTHENTICATED` SQL errors into `CustomError('POST_NOT_FOUND', …)` / `CustomError('UNAUTHENTICATED', …)`.

**Alternatives considered**:

- App-layer check-then-mutate (the current `toggleBookmarkQuery` pattern in `modules/listings/queries.ts:245`) — rejected: races under concurrent toggles and requires two round-trips.
- Postgres trigger-based counter column — rejected: adds a denormalized count that drifts on manual fixes; spec FR-021 mandates computing counts from relation data.

---

## 3. `add_comment` RPC modifications

**Decision**: Replace the existing `add_comment(p_post_id, p_parent_comment_id, p_content)` function with one that:

1. Verifies `auth.uid() IS NOT NULL`.
2. `SELECT content_status INTO v_status FROM community_posts WHERE post_id = p_post_id FOR SHARE;` — raise `POST_NOT_FOUND` if not `'published'`.
3. If `p_parent_comment_id IS NOT NULL`:
   - `SELECT parent_comment_id, post_id, is_deleted INTO v_parent_parent, v_parent_post, v_parent_deleted FROM community_post_comments WHERE comment_id = p_parent_comment_id;`
   - If not found or `v_parent_post <> p_post_id` or `v_parent_deleted = true`: raise `COMMENT_NOT_FOUND`.
   - If `v_parent_parent IS NOT NULL`: substitute `p_parent_comment_id := v_parent_parent` (auto-rewrite to top-level ancestor — FR-007).
4. `INSERT INTO community_post_comments (post_id, author_id, parent_comment_id, content) VALUES (p_post_id, auth.uid(), p_parent_comment_id, p_content) RETURNING *;`

**Rationale**: Keeps all invariants inside the database (single authoritative boundary), matches the same error-code contract as the other gated mutations, and eliminates a preflight round-trip.

---

## 4. Public attachment URLs

**Decision**: Emit `file_url` as stored in `community_posts_attachments.file_url`. During Phase 2 implementation, confirm that the create-post flow already persists the **public URL** (from `storage.from('community-attachments').getPublicUrl()`) rather than a raw path. A quick grep of `modules/community/create-post/` during implementation will confirm; if it currently stores a path, the existing create/update paths are left untouched and the query layer maps path → public URL via `storage.from('community-attachments').getPublicUrl(path).data.publicUrl` at read time. Spec FR-026 lets either form satisfy the contract as long as the caller receives a stable public URL.

**Rationale**: Avoids a migration pass over historical rows and keeps the query layer the single source of truth for the public URL format.

---

## 5. `revalidatePath` under next-intl locale routing

**Decision**: Call `revalidatePath('/community', 'page')` and `revalidatePath(\`/profile/${postAuthorId}\`, 'page')`**without** the`[locale]`segment. next-intl rewrites the locale prefix in middleware, and Next.js's revalidation key is the underlying route — so`/community`invalidates`/ar/community`, `/en/community`, etc. all at once.

**Rationale**: Matches the existing pattern in `modules/community/actions.ts:22` (current code calls `revalidatePath('/community')` after create/update) and the pattern documented in the Next.js + next-intl integration guide. Introducing a locale-prefixed revalidation would require enumerating every supported locale per mutation — unnecessary and error-prone.

**Gotcha to verify during implementation**: if the profile page is a dynamic segment `/profile/[userId]`, pass the **concrete** `postAuthorId` string (not the literal `[userId]` placeholder). This is how Next expects `revalidatePath` to target a specific dynamic instance.

---

## 6. Extending `CustomError` and `errorHandler` for stable codes

**Decision**:

```ts
// utils/CustomError.ts
class CustomError extends Error {
  code?: string;
  errors?: Record<string, string>;

  constructor({
    message,
    code,
    errors,
  }: {
    message: string;
    code?: string;
    errors?: Record<string, string>;
  }) {
    super(message);
    this.code = code;
    this.errors = errors;
  }
}

// utils/error-handler.ts — ApiResponseError
type ApiResponseError = {
  success: false;
  code?: string; // NEW
  message: string;
  errors?: Record<string, string>;
};

// inside the CustomError branch of errorHandler:
if (err instanceof CustomError) {
  return {
    success: false,
    code: err.code, // NEW — passes through
    message: err.message,
    errors: err.errors,
  };
}
```

**Rationale**: Fully backward-compatible. Existing call sites that only pass `{ message }` continue to work unchanged; new call sites opt in by passing `code`. The UI can narrow on `result.code === 'POST_NOT_FOUND'` without parsing strings.

**Alternatives considered**:

- A separate `CommunityError` subclass — rejected: adds a new type for every feature and forces `errorHandler` to grow a branch per subclass.
- Stashing codes inside `errors` map — rejected: `errors` is a per-field validation bag; conflating it with top-level discriminators confuses downstream form consumers.

---

## 7. Zod validation surface at the action boundary

**Decision**: Add to `modules/community/server-schema.ts`:

```ts
export const postIdSchema = z.string().uuid();
export const commentIdSchema = z.string().uuid();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const commentContentSchema = z
  .string()
  .trim()
  .min(1, 'Comment cannot be empty')
  .max(2000, 'Comment is too long');

export const postCategorySchema = z
  .enum(['questions', 'tips', 'news', 'troubleshooting'])
  .optional();

export const feedQuerySchema = paginationSchema.extend({
  category: postCategorySchema,
});
```

Invalid values throw `ZodError`, which `errorHandler` already maps to `{ success: false, message: 'Validation error', errors }`.

**Rationale**: Matches the existing `zodValidation(...)` usage in `modules/community/queries.ts:53`. All new server actions validate input at the boundary before touching the database — keeps the DB as the final enforcer but catches 95% of caller mistakes at the edge with a cleaner error shape.

---

## 8. Two-level threading read model

**Decision**: The `get_post_comments(p_post_id, p_page, p_limit)` RPC returns one row per top-level comment, with a JSON-aggregated `replies` column containing at most 20 non-deleted descendants ordered by `created_at ASC`:

```sql
WITH top_level AS (
  SELECT comment_id, ... FROM community_post_comments
  WHERE post_id = p_post_id AND parent_comment_id IS NULL
  ORDER BY created_at ASC
  OFFSET (p_page - 1) * p_limit LIMIT p_limit + 1
),
capped_replies AS (
  SELECT tl.comment_id AS top_id, r.*
  FROM top_level tl
  JOIN LATERAL (
    SELECT * FROM community_post_comments
    WHERE parent_comment_id = tl.comment_id AND is_deleted = false
    ORDER BY created_at DESC
    LIMIT 20
  ) r ON true
),
-- tombstones whose child survived the cap
tombstone_ancestors AS ( … ),
reply_counts AS (
  SELECT parent_comment_id, count(*) FILTER (WHERE is_deleted = false) AS cnt
  FROM community_post_comments
  WHERE parent_comment_id IN (SELECT comment_id FROM top_level)
  GROUP BY parent_comment_id
)
SELECT tl.*, rc.cnt AS replies_count, (rc.cnt > 20) AS has_more_replies,
       jsonb_agg(cr.* ORDER BY cr.created_at ASC) AS replies
FROM top_level tl
LEFT JOIN reply_counts rc USING (comment_id)
LEFT JOIN capped_replies cr ON cr.top_id = tl.comment_id
GROUP BY tl.comment_id, rc.cnt;
```

The `get_comment_replies(p_comment_id, p_page, p_limit)` RPC provides the paginated "more replies" path when `has_more_replies` is true, returning the remainder in `{ data, has_more, next_page }` form.

**Rationale**: Computes the capped window, count, and has-more flag in one query. Because all non-root comments are stored with their top-level ancestor as `parent_comment_id` (thanks to the write-time auto-rewrite in `add_comment`), "descendants of a top-level comment" is just "rows whose `parent_comment_id = top.comment_id`" — no recursive CTE needed at read time.

---

## 9. RLS policies (migration)

**Decision**:

```sql
-- community_posts: authors may update or delete their own rows.
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY community_posts_author_update
  ON community_posts FOR UPDATE TO authenticated
  USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
CREATE POLICY community_posts_author_delete
  ON community_posts FOR DELETE TO authenticated
  USING (author_id = auth.uid());
-- SELECT policy: anyone can read published rows; authors can also read their own drafts.
CREATE POLICY community_posts_read
  ON community_posts FOR SELECT TO anon, authenticated
  USING (content_status = 'published' OR author_id = auth.uid());

-- community_post_comments: same pattern scoped to author_id.
```

The SELECT policy for drafts/own-content is **permissive** — FR-017 still mandates that the _post-detail query_ returns `POST_NOT_FOUND` for any non-`published` post even for the author. That is enforced inside the `get_community_post_detail` RPC by an explicit `WHERE content_status = 'published'`, not by RLS. The RLS read policy is slightly more permissive than the query-level contract so that the create-post / edit-post flows (which must read their own drafts) still work.

**Rationale**: Defense in depth — the preflight in the server action still provides the clean `CustomError('UNAUTHORIZED', …)` shape, and RLS catches any future code path that forgets to preflight. Keeping the SELECT policy wider than the query contract lets other phases (draft editing) share the same table without carving out exceptions.

---

## 10. Regenerating Supabase TS types

**Decision**: After the migration is applied during implementation, run:

```bash
npx supabase gen types typescript --project-id <PROJECT_REF> > types/supabase.ts
```

This refreshes `Database['public']['Tables']['community_post_comments']['Row']` to include `parent_comment_id` and `is_deleted`, and adds the new RPC functions to `Database['public']['Functions']` so `client.rpc('toggle_post_like', …)` type-checks without casts.

**Rationale**: The repo's `modules/community/types/index.ts` already derives types from `Database['public']['Tables']['...']['Row']` — regeneration cascades automatically, no manual type edits needed.

---

## Summary — inputs to Phase 1

- Every query ships as a Postgres SQL function (RPC) to guarantee one-round-trip reads and atomic toggles.
- `CustomError` + `errorHandler` gain an optional `code` field (backward-compatible).
- Zod schemas at the server-action boundary cover: pagination, post-id, comment-id, category filter, comment content length.
- Two-level threading is enforced at write time by `add_comment`'s auto-rewrite; read queries assume the flat invariant.
- RLS policies + application preflight provide defense in depth for author-only mutations.
- `supabase gen types` cascades all new shapes automatically.

No unresolved research items remain. Proceed to Phase 1.
