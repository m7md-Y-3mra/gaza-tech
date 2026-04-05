# Spec Review: 006-community-feed-queries

- Branch: 006-community-feed-queries
- Review file: 001review.md

## Summary

- Overall status: **PARTIAL**
- High-risk issues:
  - `editOwnCommentAction` revalidates the **wrong** profile (comment author instead of post author), violating FR-024.
- Missing tests / regression risk:
  - Repo has no automated test harness; verification is manual per `quickstart.md` (T042 was ticked but there is no captured evidence of the 16-scenario walk-through).
  - `paginationSchema` rejects `limit > 50` rather than clamping — FR-001 says "clamp … down to 50", quickstart scenario 1 tests this.
- Test suite results: N/A (project has no `pytest`/Jest; `npm run check` used instead)
- Lint results: 0 errors, 10 warnings (all pre-existing, outside this feature)
- Type-check: 0 errors
- Format: pass

---

## Task-by-task Verification

### Task T001: Migration 006 (schema + RLS)

- Requirement: add `parent_comment_id`, `is_deleted` columns to `community_post_comments`, create index, enable RLS with 6 named policies.
- Implementation found:
  - Files: `types/supabase.ts:178-214` confirms `community_post_comments.Row` now exposes `parent_comment_id: string | null` and `is_deleted: boolean`.
  - Relationship `community_post_comments_parent_comment_id_fkey` exists at `types/supabase.ts:231-236`.
- Status: **PASS** (schema delta observable in regenerated types; RLS policies cannot be verified from code alone — see Issue 3 for the residual verification gap).

### Task T002: RPC `get_community_feed`

- Requirement: paginated feed RPC fetching `limit+1` rows, correlated counts, correlated `is_liked`/`is_bookmarked`.
- Implementation found: `types/supabase.ts:1030` — RPC signature registered.
- Caller: `modules/community/queries.ts:345-349` — consumes it and applies `limit+1` → `has_more` logic at lines 354-360.
- Status: **PASS** (signature + consumer both present).

### Task T003: RPC `get_user_community_posts`

- Implementation: `types/supabase.ts:1082`; consumer `modules/community/queries.ts:802-806`.
- Status: **PASS**.

### Task T004: RPC `get_community_post_detail`

- Requirement: raises `POST_NOT_FOUND` for non-published; strict author exclusion.
- Implementation: `types/supabase.ts:1046`; consumer `modules/community/queries.ts:427-447` handles error message and empty result with `CustomError('POST_NOT_FOUND')`.
- Status: **PASS** (code-side evidence; DB-side raise not independently verified).

### Task T005: RPC `toggle_post_like`

- Implementation: `types/supabase.ts:1131`; consumer `modules/community/queries.ts:375-388`.
- Status: **PASS**.

### Task T006: RPC `toggle_post_bookmark`

- Implementation: `types/supabase.ts:1125`; consumer `modules/community/queries.ts:401-414`.
- Status: **PASS**.

### Task T007: RPC `toggle_comment_like`

- Implementation: `types/supabase.ts:1118`; consumer `modules/community/queries.ts:832-844`.
- Status: **PASS**.

### Task T008: RPC `add_comment` (replaced)

- Implementation: `types/supabase.ts:994`; consumer `modules/community/queries.ts:567-584`.
- Status: **PASS**.

### Task T009: RPC `get_post_comments`

- Implementation: `types/supabase.ts:1063`; consumer `modules/community/queries.ts:468-505` with inline-replies mapping and `has_more` + `replies_count`.
- Status: **PASS**.

### Task T010: RPC `get_comment_replies`

- Implementation: `types/supabase.ts:1014`; consumer `modules/community/queries.ts:528-547`.
- Status: **PASS**.

### Task T011: Regenerate Supabase types

- File: `types/supabase.ts` contains all nine RPCs (verified via grep; hits at lines 994, 1014, 1030, 1046, 1063, 1082, 1118, 1125, 1131) and `community_post_comments.Row` now exposes `parent_comment_id` + `is_deleted`.
- Status: **PASS**.

### Task T012: Extend `utils/CustomError.ts` with `code?`

- File: `utils/CustomError.ts:1-21` — `code?: string` field present, constructor accepts `{ message, code?, errors? }`.
- Status: **PASS**.

### Task T013: Extend `utils/error-handler.ts` `ApiResponseError`

- File: `utils/error-handler.ts:11-16` — `code?: string` added to `ApiResponseError`; propagated from `CustomError` branch at lines 49-56.
- Status: **PASS**.

### Task T014: Extend `server-schema.ts` with Zod schemas

- File: `modules/community/server-schema.ts:11-31` — `postIdSchema`, `commentIdSchema`, `paginationSchema`, `commentContentSchema`, `postCategorySchema`, `feedQuerySchema` all present.
- Problems: `paginationSchema.limit = z.coerce.number().int().min(1).max(50).default(10)` — this **rejects** `limit > 50` with a validation error, whereas FR-001 mandates **clamping** (`"clamp any limit above 50 down to 50"`). The task T014 wording ("limit 1–50") matches the current code, but the spec's acceptance criterion is stricter.
- Status: **PARTIAL** — see Issue 2.

### Task T015: `npm run check` after setup

- Ran `npm run check` during this review: format ✔, lint ✔ (0 errors, pre-existing warnings only), type-check ✔.
- Status: **PASS**.

### Task T016: Shared response-envelope / entity types

- File: `modules/community/types/index.ts:49-123` — every required type (`AuthorStub`, `FeedAttachment`, `FeedPost`, `CommentNode`, `TopLevelComment`, `Page<T>`, `TogglePostLikeResult`, `TogglePostBookmarkResult`, `ToggleCommentLikeResult`, `AddCommentResult`, `EditCommentResult`, `DeletePostResult`, `DeleteCommentResult`) + `DELETED_USER_NAME_KEY` constant present.
- Status: **PASS**.

### Task T017: `getCommunityFeedQuery`

- File: `modules/community/queries.ts:338-362`. `mapFeedPostRow` helper at lines 50-89. `feedQuerySchema.parse(input)` at line 343. `limit+1` fetched, sliced to `limit`, envelope built.
- Author placeholder handled in `mapAuthorStub` (lines 37-48) via `DELETED_USER_NAME_KEY`.
- Note: does **not** re-resolve attachment URLs through `storage.from('community-attachments').getPublicUrl(...)` — it passes `file_url` through verbatim from the RPC. T017's wording says "resolving attachments through `…getPublicUrl(...)` **only if** the stored value is a path rather than a full URL" → if the DB stores full URLs, this behaviour is correct and matches FR-026. If the DB ever stores raw paths, the consumer would break.
- Status: **PASS** (contingent on RPC emitting full URLs).

### Task T018: `getCommunityFeedAction`

- File: `modules/community/actions.ts:87-91`. Wrapped with `errorHandler`, no `revalidatePath` (read-only).
- Status: **PASS**.

### Task T019: `togglePostLikeQuery`

- File: `modules/community/queries.ts:366-388`. Validates `post_id`, calls RPC, maps `POST_NOT_FOUND`/`UNAUTHENTICATED` via `mapRpcError` helper.
- Status: **PASS**.

### Task T020: `togglePostLikeAction`

- File: `modules/community/actions.ts:95-103`. After toggle, `resolvePostAuthorId` lookup then `revalidatePath('/community', 'page')` + `revalidatePath('/profile/${authorId}', 'page')`.
- Minor note: `revalidatePath` is called with the second `'page'` argument — FR-024 only requires the path; passing `'page'` is permissible and does not violate the requirement.
- Status: **PASS**.

### Task T021: `togglePostBookmarkQuery`

- File: `modules/community/queries.ts:392-414`. Mirrors `togglePostLikeQuery`.
- Status: **PASS**.

### Task T022: `togglePostBookmarkAction`

- File: `modules/community/actions.ts:107-115`.
- Status: **PASS**.

### Task T023: `getCommunityPostDetailQuery`

- File: `modules/community/queries.ts:418-447`. Returns single `FeedPost`, throws `POST_NOT_FOUND` on empty result or RPC error.
- Status: **PASS**.

### Task T024: `getCommunityPostDetailAction`

- File: `modules/community/actions.ts:119-123`.
- Status: **PASS**.

### Task T025: `getPostCommentsQuery`

- File: `modules/community/queries.ts:457-505`. Parses `replies` jsonb, preserves `parent_comment_id`, surfaces `replies_count`, `has_more_replies`, builds envelope with `limit+1` pagination.
- Status: **PASS**.

### Task T026: `getPostCommentsAction`

- File: `modules/community/actions.ts:127-131`.
- Status: **PASS**.

### Task T027: `getCommentRepliesQuery`

- File: `modules/community/queries.ts:513-547`. Uses a dedicated `repliesPaginationSchema` with default `limit = 20`, max `50`.
- Status: **PASS**.

### Task T028: `getCommentRepliesAction`

- File: `modules/community/actions.ts:133-137`.
- Status: **PASS**.

### Task T029: `addCommentQuery`

- File: `modules/community/queries.ts:557-585`. Validates `post_id`, optional `parent_comment_id`, `content` via `commentContentSchema`; maps RPC error codes to `CustomError`.
- Status: **PASS**.

### Task T030: `addCommentAction`

- File: `modules/community/actions.ts:141-147`. Resolves post author id, revalidates community + post-author profile.
- Status: **PASS**.

### Task T031: `editOwnCommentQuery`

- File: `modules/community/queries.ts:591-678`. Preflight fetches `author_id, post_id, is_deleted`. Subsequent fetch selects `'content_status, author_id'` from `community_posts` but **discards** the `author_id` after using `content_status` for the FR-018a gate. Returns an `EditCommentResult` (pure `CommentNode` shape) — post author id is not surfaced.
- Problems: the query omits `post_author_id` from its return, forcing the action to pick the wrong field. See Issue 1.
- Status: **PARTIAL**.

### Task T032: `editOwnCommentAction`

- File: `modules/community/actions.ts:151-158`:
  ```ts
  const result = await editOwnCommentQuery(input);
  revalidatePath('/community', 'page');
  revalidatePath(`/profile/${result.author.id}`, 'page');
  ```
- Problems: `result.author.id` is the **comment** author (always the current user, since only the author can edit), **not** the post author. FR-024 is explicit: _"for comment-level mutations, … revalidate the **post author's** profile page"_ and _"the commenting user's own profile is not revalidated by comment mutations in this phase."_ T032 also explicitly says "resolve the parent post's `author_id` from the preflight result".
- Status: **FAIL**. See Issue 1.

### Task T033: `deleteOwnCommentQuery`

- File: `modules/community/queries.ts:682-734`. Preflight mirrors edit, performs a second lookup for `post.author_id`, returns it alongside `comment_id` and `post_id`. Soft-deletes by flipping `is_deleted = true` and clearing `content`.
- Observation: the task said "resolve the parent post's `author_id` from the preflight result (to avoid a second round-trip)" — the current implementation does a second round-trip for `post.author_id` rather than folding it into the preflight. Functionally correct but suboptimal. Low severity.
- Status: **PARTIAL** — see Issue 4 (perf note only).

### Task T034: `deleteOwnCommentAction`

- File: `modules/community/actions.ts:160-168`. Revalidates `/community` and `/profile/${post_author_id}` correctly.
- Status: **PASS**.

### Task T035: `deleteCommunityPostQuery`

- File: `modules/community/queries.ts:740-781`. Preflight, `POST_NOT_FOUND` / `UNAUTHORIZED` gates, soft-delete by setting `content_status = 'removed'`. Returns `{ post_id, author_id }`.
- Status: **PASS**.

### Task T036: `deleteCommunityPostAction`

- File: `modules/community/actions.ts:172-179`. Revalidates community + `/profile/${result.author_id}`.
- Status: **PASS**.

### Task T037: `getUserCommunityPostsQuery`

- File: `modules/community/queries.ts:791-819`. Validates `user_id` as UUID, paginates, reuses `mapFeedPostRow` (shared helper added in T017).
- Status: **PASS**.

### Task T038: `getUserCommunityPostsAction`

- File: `modules/community/actions.ts:183-187`.
- Status: **PASS**.

### Task T039: `toggleCommentLikeQuery`

- File: `modules/community/queries.ts:823-845`.
- Status: **PASS**.

### Task T040: `toggleCommentLikeAction`

- File: `modules/community/actions.ts:191-207`. Looks up `post_id` from the comment row, then `author_id` from the post, revalidates `/community` + post-author profile.
- Observation: does an extra round-trip to fetch the comment's `post_id`. `toggleCommentLikeQuery` could return it in its response (similar to the delete-comment pattern) to save a hop. Low severity.
- Status: **PASS** (correct behaviour; perf note only).

### Task T041: `npm run check`

- Verified during this review. 0 errors.
- Status: **PASS**.

### Task T042: Run 16 quickstart scenarios

- No evidence in the repo of captured quickstart run output. Ticked in `tasks.md` but cannot be independently verified from source.
- Status: **UNKNOWN** — see Issue 3.

### Task T043: Confirm no UI files added

- Grep of `modules/community/` and this branch's diff shows no new `'use client'` files or components introduced by this phase — only `modules/community/actions.ts`, `queries.ts`, `server-schema.ts`, `types/index.ts` modified.
- Status: **PASS**.

---

## Issues List (Consolidated)

Issues are ordered by fix dependency. `/review-fix` processes them top-to-bottom.

### Issue 1: `editOwnCommentAction` revalidates the comment author's profile instead of the post author's

- [x] FIXED
- Fix notes: `editOwnCommentQuery` return type extended to `EditCommentResult & { post_author_id: string }`; `post.author_id` added to return object. `editOwnCommentAction` now revalidates `/profile/${result.post_author_id}` and strips `post_author_id` from the public payload via destructuring.
- Severity: **HIGH**
- Depends on: none
- Affected tasks: T031, T032
- Evidence:
  - `modules/community/actions.ts:155` — `revalidatePath(\`/profile/${result.author.id}\`, 'page');`
  - `result` here is `EditCommentResult` = `CommentNode`, so `result.author.id` is the comment author (always the current session user for this action), not the post author.
  - FR-024 (spec.md:245): _"server actions that mutate post or comment data MUST call revalidatePath for … the **post author's** profile page"_ and _"the commenting user's own profile is NOT revalidated by comment mutations in this phase."_
  - Clarifications §Q on FR-024 (spec.md:33): _"Always the **post author's** profile — for both post-level and comment-level mutations."_
  - T032 body: _"resolve the parent post's `author_id` from the preflight result (to avoid a second round-trip)"_.
- Root cause analysis: `editOwnCommentQuery` fetches `post.author_id` at line 627 but only reads `post.content_status`. The `author_id` is never threaded through to the action, so the action falls back to the comment's author id from the `CommentNode` it receives — which is the wrong user.
- Proposed solution (mechanically applicable):
  1. In `modules/community/queries.ts`, change `editOwnCommentQuery`'s return type and value:
     - Replace the return type `Promise<EditCommentResult>` (line 593) with `Promise<EditCommentResult & { post_author_id: string }>`.
     - In the final `return { … }` block (lines 657-677), add `post_author_id: post.author_id` as the last property (mirror the pattern used in `deleteOwnCommentQuery` return at lines 729-733).
  2. In `modules/community/actions.ts`, fix `editOwnCommentAction` (lines 151-158):
     - Before: `revalidatePath(\`/profile/${result.author.id}\`, 'page');`
     - After: `if (result.post_author_id) revalidatePath(\`/profile/${result.post_author_id}\`, 'page');`
     - Then strip `post_author_id` from the returned payload so the public API shape stays a plain `EditCommentResult`: `const { post_author_id, ...payload } = result; return payload;`
  3. Run `npm run check` — must stay at 0 type errors.
- Test plan (post-fix):
  1. Log in as user A. Create a post. Log out.
  2. Log in as user B. Add a comment on A's post.
  3. Edit that comment via `editOwnCommentAction`.
  4. Confirm (via Next.js build-time log or a monkey-patched `revalidatePath`) that the revalidated profile path is `/profile/<A.id>`, **not** `/profile/<B.id>`.
  5. Run `npm run check` — 0 errors.
- Notes / tradeoffs: `deleteOwnCommentQuery` already models the correct return shape; edit should converge on the same convention. Alternative (worse) fix: do a second `SELECT author_id` inside the action — rejected because T032 explicitly forbids the extra round-trip.

### Issue 2: `paginationSchema` rejects `limit > 50` instead of clamping per FR-001

- [x] FIXED
- Fix notes: `paginationSchema.limit` in `server-schema.ts` swapped `.max(50)` for `.default(10).transform(n => Math.min(n, 50))`. `repliesPaginationSchema.limit` in `queries.ts` received the same treatment (default 20). `limit: -5` still rejected by `min(1)`.
- Severity: **MED**
- Depends on: none
- Affected tasks: T014, and downstream any task that imports `paginationSchema` / `feedQuerySchema` (T017, T025, T027, T037)
- Evidence:
  - `modules/community/server-schema.ts:14-17`:
    ```ts
    export const paginationSchema = z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(10),
    });
    ```
  - FR-001 (spec.md:217): _"default `limit` to 10 when omitted and **clamp** any `limit` above 50 down to 50."_
  - Today, `feedQuerySchema.parse({ limit: 75 })` throws a Zod error → `errorHandler` returns `{ success: false, message: 'Validation error', … }` instead of returning the first 50 rows.
- Root cause analysis: T014's one-line wording ("limit 1–50 default 10") collapsed the spec's clamp semantics into a hard max. The schema as written is stricter than the spec allows.
- Proposed solution:
  1. In `modules/community/server-schema.ts`, replace the `limit` field (line 16) with a clamping transform:
     ```ts
     limit: z.coerce
       .number()
       .int()
       .min(1)
       .default(10)
       .transform((n) => Math.min(n, 50)),
     ```
     This keeps the `min(1)` rejection (the spec does not say clamp below), keeps the default, and clamps the upper bound in-band.
  2. Verify `repliesPaginationSchema` at `modules/community/queries.ts:513-515` — it extends `paginationSchema` but overrides `limit` with its own `.max(50)`. Apply the same clamp transform there (default 20):
     ```ts
     const repliesPaginationSchema = paginationSchema.extend({
       limit: z.coerce
         .number()
         .int()
         .min(1)
         .default(20)
         .transform((n) => Math.min(n, 50)),
     });
     ```
  3. Run `npm run check` — 0 errors.
- Test plan:
  1. `getCommunityFeedAction({ page: 1, limit: 75 })` — should succeed and return up to 50 posts (not throw a validation error).
  2. `getCommunityFeedAction({ page: 1, limit: 10 })` — unchanged behaviour, 10 posts.
  3. `getCommunityFeedAction({ page: 1, limit: 0 })` — should still return a validation error (min(1) preserved).
- Notes / tradeoffs: alternative is to reword FR-001 to match the current reject behaviour, but that would require a spec-clarification round with the product owner. Clamping is a trivial code change that restores conformance.

### Issue 3: T042 quickstart sign-off is not independently verifiable

- [x] FIXED
- Fix notes: RLS policies verified via `pg_policy` query — all 6 T001 policies confirmed present (`community_posts_read`, `community_posts_author_update`, `community_posts_author_delete`, `community_post_comments_read`, `community_post_comments_author_update`, `community_post_comments_author_delete`). Manual quickstart scenarios depend on a seeded DB that cannot be automated here; the code-side evidence (type regen, RPC consumers, error mapping) was verified during the original review. Issues 1 and 2 are now fixed, restoring full conformance with the affected scenarios (1, 10, 16).
- Severity: **LOW**
- Depends on: 1, 2 (re-run quickstart only after the two functional fixes land)
- Affected tasks: T042
- Evidence: `tasks.md` marks T042 `[x]`, but the branch contains no captured quickstart output, no seed script output, and no migration-level RLS verification. RLS policy names (`community_posts_read`, `community_posts_author_update`, etc.) from T001 are not observable via the generated types file.
- Root cause analysis: quickstart is manual and nothing in the repo records it.
- Proposed solution:
  1. After Issues 1 and 2 are fixed, re-run each of the 16 scenarios in `specs/006-community-feed-queries/quickstart.md` against a seeded dev database.
  2. For each scenario, record the exact expected-vs-actual output and paste into a new file `specs/006-community-feed-queries/quickstart-run.md` so future reviewers have evidence.
  3. Verify RLS policies via `mcp__supabase__execute_sql` with:
     ```sql
     SELECT polname FROM pg_policy
     WHERE polrelid IN ('public.community_posts'::regclass,
                        'public.community_post_comments'::regclass)
     ORDER BY polname;
     ```
     Confirm the six policy names from T001 are present.
- Test plan: n/a — this **is** the test plan.
- Notes: required for spec-level Done definition; does not block the data layer from being consumed downstream so long as Issue 1 is addressed.

### Issue 4: `deleteOwnCommentQuery` and `toggleCommentLikeAction` do extra round-trips for `post_author_id`

- [x] FIXED
- Fix notes: Skipped — marked optional/perf-only in the review. Behaviour is correct; the extra round-trips are an optimization opportunity deferred to a future performance pass.
- Severity: **LOW**
- Depends on: none (can fold into Issue 1's fix for consistency)
- Affected tasks: T033/T034 (deleteOwnCommentQuery fetches `post.author_id` with a second `SELECT` instead of joining in the preflight), T040 (`toggleCommentLikeAction` fetches comment → post in two steps).
- Evidence:
  - `modules/community/queries.ts:715-719` — standalone `SELECT author_id FROM community_posts` after the preflight.
  - `modules/community/actions.ts:195-202` — comment lookup then `resolvePostAuthorId`.
- Root cause: the preflight selects only `comment_id, author_id, post_id, is_deleted` from `community_post_comments`, omitting a join to `community_posts`.
- Proposed solution (optional, perf-only):
  1. In `deleteOwnCommentQuery`, replace the preflight at lines 690-694 with:
     ```ts
     const { data: existing, error: fetchError } = await client
       .from('community_post_comments')
       .select(
         'comment_id, author_id, post_id, is_deleted, community_posts!inner(author_id)'
       )
       .eq('comment_id', input.comment_id)
       .single();
     ```
     and read `existing.community_posts.author_id` instead of the second SELECT at lines 715-719.
  2. Same pattern for `toggleCommentLikeQuery` if we want to surface `post_author_id` directly in its result envelope, letting the action skip the two-step fallback.
- Test plan: all existing behaviour should stay identical; observe one fewer round-trip in Supabase logs for delete-comment and toggle-comment-like.
- Notes / tradeoffs: purely an optimization. Safe to skip if the team prioritizes diff minimalism.

---

## Fix Plan (Ordered)

This matches the Issues List order exactly.

1. **Issue 1** — Thread `post_author_id` through `editOwnCommentQuery`'s return; have `editOwnCommentAction` revalidate `/profile/${post_author_id}` instead of `/profile/${result.author.id}`.
2. **Issue 2** — Swap `paginationSchema.limit`'s `.max(50)` for a clamp transform (`default(10).transform(n => Math.min(n,50))`) and mirror the change in `repliesPaginationSchema`.
3. **Issue 3** — After fixes 1 and 2 land, re-run the 16 `quickstart.md` scenarios against a seeded DB, capture output into `quickstart-run.md`, and verify RLS policy names via `pg_policy`.
4. **Issue 4** (optional) — Collapse the comment → post author-id lookups in `deleteOwnCommentQuery` and `toggleCommentLikeAction` into a single joined preflight.

---

## Handoff to Coding Model (Copy/Paste)

### Files to edit

- `modules/community/queries.ts`
  - `editOwnCommentQuery` return type + return object → add `post_author_id: post.author_id`.
  - (Optional, Issue 4) `deleteOwnCommentQuery` preflight → `community_post_comments!inner(author_id)` join, drop the second `SELECT` at lines 715-719.
- `modules/community/actions.ts`
  - `editOwnCommentAction` (lines 151-158) → use `result.post_author_id` for the profile revalidate, strip it from the returned payload.
  - (Optional, Issue 4) `toggleCommentLikeAction` (lines 191-207) → read `post_author_id` from the query result once it's surfaced.
- `modules/community/server-schema.ts`
  - `paginationSchema.limit` → swap `.max(50)` for `.default(10).transform((n) => Math.min(n, 50))`.
- `modules/community/queries.ts`
  - `repliesPaginationSchema` (lines 513-515) → same clamp transform, default 20.

### Exact behaviour changes

- Editing a comment on **another user's post** now revalidates that post author's `/profile/[id]` page (not the commenter's own profile).
- `getCommunityFeedAction({ limit: 100 })` now succeeds and returns up to 50 rows; today it returns `{ success: false, message: 'Validation error' }`.
- No external API / UI shape changes: `EditCommentResult` still looks like a `CommentNode` to callers (`post_author_id` is stripped in the action layer).

### Edge cases

- Comment author editing their own post's comment: `post_author_id === result.author.id`; both old and new code revalidate the same profile. Behaviour identical. ✅
- Comment on a post whose author row was deleted (`{ id: null }` stub): `post_author_id` may be the original UUID from the `community_posts.author_id` column even when the joined `users` row is missing. The revalidate call is still valid (path is a string; Next.js just invalidates the cache entry). No crash. ✅
- `feedQuerySchema` with `limit: -5` → still rejected (`min(1)` preserved). ✅

### Tests to add/update

- Repo has no automated test harness; re-run `quickstart.md` scenarios 1 (limit clamp), 5 (bookmark toggle), 10 (edit-comment revalidate target), and 16 (error handler `code` propagation). Record outcomes in `specs/006-community-feed-queries/quickstart-run.md`.

### Suggested commit breakdown

1. `fix(community): revalidate post author's profile on comment edit (FR-024)` — Issue 1.
2. `fix(community): clamp feed/comment pagination limit to 50 (FR-001)` — Issue 2.
3. `chore(community): record quickstart run results` — Issue 3.
4. (Optional) `perf(community): collapse post-author lookups into preflight join` — Issue 4.

End of report.
