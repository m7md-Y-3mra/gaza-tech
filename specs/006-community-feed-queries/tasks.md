---
description: 'Task list for feature 006-community-feed-queries'
---

# Tasks: Community Feed Queries

**Input**: Design documents from `/specs/006-community-feed-queries/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rpc-functions.sql, contracts/server-actions.md, quickstart.md

**Tests**: This feature uses manual verification per `quickstart.md` (16 smoke scenarios). No automated test tasks are generated — the repo has no test harness for server actions, and the spec explicitly routes verification through quickstart.

**Organization**: Tasks are grouped by user story so each story can be implemented and verified independently against its quickstart scenario.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Maps to a user story from spec.md (US1–US10)
- All paths are absolute from the repo root `/home/m7md/a/gaza-tech/front-end-agy/`

## Path Conventions

All feature code extends the existing `modules/community/` module in place. Cross-module touches are limited to `utils/CustomError.ts`, `utils/error-handler.ts`, and `types/supabase.ts`. No new top-level directories are created.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Apply the database migration, regenerate Supabase types, extend the shared error utilities, and add all new Zod schemas. These are blocking prerequisites for every user story.

- [x] T001 Apply migration `006_community_feed_queries` via `mcp__supabase__apply_migration` — adds `parent_comment_id uuid NULL` and `is_deleted boolean NOT NULL DEFAULT false` columns to `community_post_comments`, creates index `community_post_comments_post_parent_created_idx` on `(post_id, parent_comment_id, created_at)`, and enables RLS on `community_posts` and `community_post_comments` with policies `community_posts_read`, `community_posts_author_update`, `community_posts_author_delete`, `community_post_comments_read`, `community_post_comments_author_update`, `community_post_comments_author_delete` exactly as specified in `specs/006-community-feed-queries/data-model.md` §7
- [x] T002 Create RPC function `get_community_feed(p_page int, p_limit int, p_category text)` via `mcp__supabase__apply_migration` per `specs/006-community-feed-queries/contracts/rpc-functions.sql` §1 — SECURITY INVOKER, SET search_path = public, fetches `limit + 1` rows, returns author jsonb stub, attachments jsonb, like_count/comment_count via correlated aggregates, and `is_liked`/`is_bookmarked` via correlated EXISTS scoped to `auth.uid()`
- [x] T003 Create RPC function `get_user_community_posts(p_user_id uuid, p_page int, p_limit int)` via `mcp__supabase__apply_migration` per `specs/006-community-feed-queries/contracts/rpc-functions.sql` §2 — same projection as `get_community_feed`, filtered by `author_id = p_user_id` and `content_status = 'published'`, ordered by `published_at DESC, post_id DESC`
- [x] T004 Create RPC function `get_community_post_detail(p_post_id uuid)` via `mcp__supabase__apply_migration` per `specs/006-community-feed-queries/contracts/rpc-functions.sql` §3 — plpgsql, raises `'POST_NOT_FOUND'` with SQLSTATE `P0001` for any non-`published` post (including drafts owned by the caller), returns the same single-row projection as the feed
- [x] T005 Create RPC function `toggle_post_like(p_post_id uuid)` via `mcp__supabase__apply_migration` per `specs/006-community-feed-queries/contracts/rpc-functions.sql` §4 — plpgsql, raises `'UNAUTHENTICATED'` when `auth.uid() IS NULL`, raises `'POST_NOT_FOUND'` when post is not `published`, performs `DELETE ... RETURNING` then conditional `INSERT`, returns `(is_liked boolean, like_count bigint)` in one round-trip
- [x] T006 Create RPC function `toggle_post_bookmark(p_post_id uuid)` via `mcp__supabase__apply_migration` per `specs/006-community-feed-queries/contracts/rpc-functions.sql` §5 — same structure as `toggle_post_like`, returns `(is_bookmarked boolean)`, operates on `bookmarked_posts`
- [x] T007 Create RPC function `toggle_comment_like(p_comment_id uuid)` via `mcp__supabase__apply_migration` per `specs/006-community-feed-queries/contracts/rpc-functions.sql` §6 — plpgsql, resolves parent post via `community_post_comments.post_id`, raises `'COMMENT_NOT_FOUND'` when row is missing or `is_deleted = true`, raises `'POST_NOT_FOUND'` when parent post is not `published`, then toggles `community_comments_likes` returning `(is_liked, like_count)`
- [x] T008 Replace RPC function `add_comment(p_post_id uuid, p_parent_comment_id uuid, p_content text)` via `mcp__supabase__apply_migration` per `specs/006-community-feed-queries/contracts/rpc-functions.sql` §7 — plpgsql, raises `'UNAUTHENTICATED'`, gates on `content_status = 'published'` (`POST_NOT_FOUND` otherwise), when `p_parent_comment_id IS NOT NULL` validates it belongs to the same post and is not tombstoned (`COMMENT_NOT_FOUND` otherwise) and auto-rewrites to the top-level ancestor when the parent itself has a non-null `parent_comment_id`, inserts the row and returns the full `CommentNode` projection with hydrated author stub
- [x] T009 Create RPC function `get_post_comments(p_post_id uuid, p_page int, p_limit int)` via `mcp__supabase__apply_migration` per `specs/006-community-feed-queries/contracts/rpc-functions.sql` §8 and `research.md` §8 — returns one row per top-level comment with `replies` jsonb (≤ 20 most recent non-deleted descendants ordered oldest→newest within the capped window), `replies_count` (excluding tombstones), `has_more_replies` boolean, and tombstone ancestors included in `replies` only when referenced by a surviving reply; fetches `limit + 1` top-level rows for pagination
- [x] T010 Create RPC function `get_comment_replies(p_comment_id uuid, p_page int, p_limit int)` via `mcp__supabase__apply_migration` per `specs/006-community-feed-queries/contracts/rpc-functions.sql` §9 — returns flattened non-deleted replies for a top-level comment ordered by `(created_at ASC, comment_id ASC)`, fetches `limit + 1` rows, with like_count and `is_liked` (correlated EXISTS against `auth.uid()`)
- [x] T011 Regenerate Supabase TypeScript types at `types/supabase.ts` using `mcp__supabase__generate_typescript_types` so `Database['public']['Tables']['community_post_comments']['Row']` includes `parent_comment_id` + `is_deleted` and `Database['public']['Functions']` includes all nine new RPCs — overwrite the existing file in place
- [x] T012 [P] Extend `utils/CustomError.ts` to accept `{ message, code?, errors? }` constructor arg — add optional `code?: string` field, keep backward compatibility with callers that pass `{ message }` or `{ message, errors }`, per `research.md` §6
- [x] T013 [P] Extend `utils/error-handler.ts` `ApiResponseError` type with optional `code?: string` field and propagate `err.code` through the `CustomError` branch of `errorHandler`, per `research.md` §6
- [x] T014 [P] Extend `modules/community/server-schema.ts` with `postIdSchema`, `commentIdSchema`, `paginationSchema` (page ≥ 1 default 1, limit 1–50 default 10, `z.coerce.number().int()`), `commentContentSchema` (trim, min 1, max 2000), `postCategorySchema` (enum `'questions' | 'tips' | 'news' | 'troubleshooting'`, optional), and `feedQuerySchema = paginationSchema.extend({ category: postCategorySchema })`, per `research.md` §7
- [x] T015 Run `npm run check` (format + lint + type-check) to confirm T001–T014 compile together — fix any regressions before moving on

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Publish the shared response-envelope and entity types that every query and server action in Phase 3+ imports. Nothing else is blocking after this phase.

**⚠️ CRITICAL**: No user story implementation can begin until T016 lands.

- [x] T016 Extend `modules/community/types/index.ts` with all response types from `specs/006-community-feed-queries/data-model.md` §3 — `AuthorStub`, `FeedAttachment`, `FeedPost`, `CommentNode`, `TopLevelComment`, `Page<T>`, `TogglePostLikeResult`, `TogglePostBookmarkResult`, `ToggleCommentLikeResult`, `AddCommentResult`, `EditCommentResult`, `DeletePostResult`, `DeleteCommentResult`, plus a shared `DELETED_USER_NAME_KEY` constant for the localized placeholder (UI resolves via next-intl in downstream phases; server emits the English source string `'Deleted user'`)

**Checkpoint**: Shared types are available — all user stories can now proceed independently.

---

## Phase 3: User Story 1 — Browse Community Feed (Priority: P1) 🎯 MVP

**Goal**: Fetch a paginated list of published community posts with author, attachments, counts, and per-caller like/bookmark flags.

**Independent Test**: Run quickstart.md scenarios 1 (pagination + ordering), 2 (category filter + validation), and 3 (unauthenticated read) against `getCommunityFeedAction`.

- [x] T017 [US1] Add `getCommunityFeedQuery({ page, limit, category })` to `modules/community/queries.ts` — validates input via `feedQuerySchema`, invokes `supabase.rpc('get_community_feed', { p_page, p_limit, p_category: category ?? null })`, applies `limit + 1` → `has_more` logic, slices `data` to `limit`, maps each row into the `FeedPost` shape (resolving attachments through `storage.from('community-attachments').getPublicUrl(...)` only if the stored value is a path rather than a full URL per `research.md` §4), coalesces missing authors to the `AuthorStub` placeholder (`{ id: null, name: 'Deleted user', avatar_url: null }`), and returns `Page<FeedPost>`
- [x] T018 [US1] Add `getCommunityFeedAction` to `modules/community/actions.ts` — wrap `getCommunityFeedQuery` with `errorHandler()`, re-export the `GetCommunityFeedInput` / `GetCommunityFeedResult` types from `modules/community/types/index.ts`, no `revalidatePath` (read-only)

**Checkpoint**: Scenarios 1–3 from `quickstart.md` pass.

---

## Phase 4: User Story 2 — Like / Unlike a Post (Priority: P1)

**Goal**: Authenticated toggle of post like with atomic check-and-swap, self-like allowed, `POST_NOT_FOUND` gate on unpublished posts.

**Independent Test**: Run quickstart.md scenario 4 (like toggle atomicity) and the self-like portion of scenario 5.

- [x] T019 [US2] Add `togglePostLikeQuery({ post_id })` to `modules/community/queries.ts` — validates `post_id` via `postIdSchema`, invokes `supabase.rpc('toggle_post_like', { p_post_id })`, on RPC error with message `'POST_NOT_FOUND'` or `'UNAUTHENTICATED'` rethrows as `new CustomError({ code, message: <english source string> })`, returns `TogglePostLikeResult`
- [x] T020 [US2] Add `togglePostLikeAction({ post_id })` to `modules/community/actions.ts` — wrap with `errorHandler()`, after a successful toggle look up the post's `author_id` (single `SELECT author_id FROM community_posts WHERE post_id = ?`) and call `revalidatePath('/community')` + `revalidatePath(\`/profile/${authorId}\`)`per FR-024 and`research.md` §5

**Checkpoint**: Scenario 4 passes; a user can like their own post (scenario 5, first half).

---

## Phase 5: User Story 3 — Bookmark / Unbookmark a Post (Priority: P1)

**Goal**: Authenticated toggle of post bookmark, self-bookmark allowed, `POST_NOT_FOUND` gate on unpublished posts.

**Independent Test**: Run the bookmark portion of quickstart.md scenarios 4–5 and the `POST_NOT_FOUND` branch of scenario 6.

- [x] T021 [US3] Add `togglePostBookmarkQuery({ post_id })` to `modules/community/queries.ts` — mirrors `togglePostLikeQuery` structure, invokes `supabase.rpc('toggle_post_bookmark', { p_post_id })`, same error mapping, returns `TogglePostBookmarkResult`
- [x] T022 [US3] Add `togglePostBookmarkAction({ post_id })` to `modules/community/actions.ts` — wrap with `errorHandler()`, resolve `author_id` and call `revalidatePath('/community')` + `revalidatePath(\`/profile/${authorId}\`)`

**Checkpoint**: Self-bookmark works; bookmark on a tombstoned post returns `POST_NOT_FOUND`.

---

## Phase 6: User Story 10 — View Post Detail (Priority: P2)

**Goal**: Fetch full detail for a single post with strict `POST_NOT_FOUND` visibility (no draft/removed leakage, even for the author).

**Independent Test**: Run quickstart.md scenarios 14 (post-detail strict visibility) and 16 (error handler propagates `code`).

- [x] T023 [US10] Add `getCommunityPostDetailQuery({ post_id })` to `modules/community/queries.ts` — validates `post_id` via `postIdSchema`, invokes `supabase.rpc('get_community_post_detail', { p_post_id })`, on RPC error message `'POST_NOT_FOUND'` rethrows `new CustomError({ code: 'POST_NOT_FOUND', message: 'Post not found' })`, returns a single `FeedPost` (not a `Page<>`)
- [x] T024 [US10] Add `getCommunityPostDetailAction({ post_id })` to `modules/community/actions.ts` — wrap with `errorHandler()`, read-only so no `revalidatePath`

**Checkpoint**: Scenarios 14 + 16 pass; the author cannot view their own draft or removed post via this query.

---

## Phase 7: User Story 4 — View Comments on a Post (Priority: P2)

**Goal**: Paginated top-level comments with inline flattened replies (capped at 20), `replies_count`, `has_more_replies`, and a follow-up query for additional replies.

**Independent Test**: Run quickstart.md scenarios 7 (read path) and 11 tombstone visibility check.

- [x] T025 [US4] Add `getPostCommentsQuery({ post_id, page, limit })` to `modules/community/queries.ts` — validates via `postIdSchema` + `paginationSchema`, invokes `supabase.rpc('get_post_comments', { p_post_id, p_page, p_limit })`, applies `limit + 1` → `has_more` logic, maps each row into `TopLevelComment` shape, parses the `replies` jsonb column into `CommentNode[]` (preserving `parent_comment_id` on every reply and handling tombstones whose `content === ''` and `is_deleted === true`), coalesces missing authors to the `AuthorStub` placeholder, returns `Page<TopLevelComment>`
- [x] T026 [US4] Add `getPostCommentsAction({ post_id, page, limit })` to `modules/community/actions.ts` — wrap with `errorHandler()`, read-only
- [x] T027 [US4] Add `getCommentRepliesQuery({ comment_id, page, limit })` to `modules/community/queries.ts` — validates via `commentIdSchema` + a pagination variant with default `limit` = 20 / max 50, invokes `supabase.rpc('get_comment_replies', { p_comment_id, p_page, p_limit })`, applies `limit + 1` → `has_more`, returns `Page<CommentNode>` (non-deleted replies only)
- [x] T028 [US4] Add `getCommentRepliesAction({ comment_id, page, limit })` to `modules/community/actions.ts` — wrap with `errorHandler()`, read-only

**Checkpoint**: Scenario 7 passes end-to-end including the "more replies" path.

---

## Phase 8: User Story 5 — Add a Comment (Priority: P2)

**Goal**: Authenticated add-comment (top-level or reply) with auto-rewrite of reply-of-reply parents to the top-level ancestor, content validation, and `POST_NOT_FOUND` gate.

**Independent Test**: Run quickstart.md scenarios 8 (write-path auto-rewrite) and 9 (content validation).

- [x] T029 [US5] Add `addCommentQuery({ post_id, parent_comment_id, content })` to `modules/community/queries.ts` — validates `post_id` via `postIdSchema`, optional `parent_comment_id` via `commentIdSchema.optional()`, and `content` via `commentContentSchema`, invokes `supabase.rpc('add_comment', { p_post_id, p_parent_comment_id: parent_comment_id ?? null, p_content: content.trim() })`, maps RPC errors `'POST_NOT_FOUND'` / `'COMMENT_NOT_FOUND'` / `'UNAUTHENTICATED'` to corresponding `CustomError` instances, returns the newly-created `CommentNode`
- [x] T030 [US5] Add `addCommentAction({ post_id, parent_comment_id, content })` to `modules/community/actions.ts` — wrap with `errorHandler()`, after success look up the post's `author_id` and call `revalidatePath('/community')` + `revalidatePath(\`/profile/${postAuthorId}\`)` (post author, not the commenter, per FR-024)

**Checkpoint**: Scenarios 8 + 9 pass; a reply-of-reply is transparently rewritten to target the top-level ancestor without surfacing an error.

---

## Phase 9: User Story 6 — Edit and Delete Own Comments (Priority: P2)

**Goal**: Author-only edit (sets `is_edited` + `edited_at`) and soft-delete (sets `is_deleted = true` + clears `content`) with defense-in-depth authorization.

**Independent Test**: Run quickstart.md scenarios 10 (author-only enforcement), 11 (tombstone visibility), and 12 (`comment_count` excludes tombstones).

- [x] T031 [US6] Add `editOwnCommentQuery({ comment_id, content })` to `modules/community/queries.ts` — validates `comment_id` via `commentIdSchema` and `content` via `commentContentSchema`, preflight `SELECT comment_id, author_id, post_id, is_deleted FROM community_post_comments WHERE comment_id = ?`, throws `new CustomError({ code: 'COMMENT_NOT_FOUND', message })` on missing row or `is_deleted = true`, throws `new CustomError({ code: 'UNAUTHORIZED', message })` when the session user is not the comment author, then looks up the parent post's `content_status` and throws `new CustomError({ code: 'POST_NOT_FOUND', message })` when not `'published'` (FR-018a for edit-comment — no RPC exists so the gate is app-level), performs `UPDATE community_post_comments SET content = ?, is_edited = true, edited_at = now() WHERE comment_id = ?`, returns the updated `CommentNode` with hydrated author stub
- [x] T032 [US6] Add `editOwnCommentAction({ comment_id, content })` to `modules/community/actions.ts` — wrap with `errorHandler()`, resolve the parent post's `author_id` from the preflight result (to avoid a second round-trip) and call `revalidatePath('/community')` + `revalidatePath(\`/profile/${postAuthorId}\`)`
- [x] T033 [US6] Add `deleteOwnCommentQuery({ comment_id })` to `modules/community/queries.ts` — validates via `commentIdSchema`, same preflight as `editOwnCommentQuery` (`COMMENT_NOT_FOUND` / `UNAUTHORIZED`), **not gated** on the parent post's `content_status` per FR-018a carve-out, performs `UPDATE community_post_comments SET is_deleted = true, content = '' WHERE comment_id = ?`, returns `{ comment_id }`
- [x] T034 [US6] Add `deleteOwnCommentAction({ comment_id })` to `modules/community/actions.ts` — wrap with `errorHandler()`, resolve the parent post's `author_id` from the preflight result and call `revalidatePath('/community')` + `revalidatePath(\`/profile/${postAuthorId}\`)`

**Checkpoint**: Scenarios 10, 11, and 12 pass; non-authors get `UNAUTHORIZED`, tombstones remain readable, and `comment_count` drops correctly.

---

## Phase 10: User Story 8 — Delete Own Post (Priority: P2)

**Goal**: Author-only soft-delete of a post by flipping `content_status` to `'removed'`; storage files preserved.

**Independent Test**: Run quickstart.md scenarios 6 (unpublished-post gating from the caller side) and 10 (author-only enforcement via the Supabase JS client direct-call test).

- [x] T035 [US8] Add `deleteCommunityPostQuery({ post_id })` to `modules/community/queries.ts` — validates via `postIdSchema`, preflight `SELECT post_id, author_id, content_status FROM community_posts WHERE post_id = ?`, throws `POST_NOT_FOUND` when missing or `content_status <> 'published'`, throws `UNAUTHORIZED` when the caller is not the author, performs `UPDATE community_posts SET content_status = 'removed' WHERE post_id = ?` (no deletion from `community-attachments` bucket), returns `{ post_id }`
- [x] T036 [US8] Add `deleteCommunityPostAction({ post_id })` to `modules/community/actions.ts` — wrap with `errorHandler()`, call `revalidatePath('/community')` + `revalidatePath(\`/profile/${session.user.id}\`)` (the author == session user for this action)

**Checkpoint**: Scenario 6 and the direct-call RLS test in scenario 10 both pass.

---

## Phase 11: User Story 9 — View a Specific User's Community Posts (Priority: P3)

**Goal**: Paginated fetch of a specific user's published posts for the profile community tab.

**Independent Test**: Fetch posts for a seeded user id with multiple published posts and a mixture of drafts/removed rows; verify only `published` posts are returned and pagination is deterministic.

- [x] T037 [US9] Add `getUserCommunityPostsQuery({ user_id, page, limit })` to `modules/community/queries.ts` — validates `user_id` via `z.string().uuid()` plus `paginationSchema`, invokes `supabase.rpc('get_user_community_posts', { p_user_id, p_page, p_limit })`, applies `limit + 1` → `has_more` logic, maps each row into `FeedPost` exactly as `getCommunityFeedQuery` does (extract the mapping to a shared helper `mapFeedPostRow` inside `queries.ts` if it does not already exist after T017), returns `Page<FeedPost>`
- [x] T038 [US9] Add `getUserCommunityPostsAction({ user_id, page, limit })` to `modules/community/actions.ts` — wrap with `errorHandler()`, read-only

**Checkpoint**: User posts query returns only the specified user's published posts ordered by `published_at DESC, post_id DESC`.

---

## Phase 12: User Story 7 — Like / Unlike a Comment (Priority: P3)

**Goal**: Authenticated toggle of comment like, atomic via RPC, gated on parent post `content_status = 'published'` and comment `is_deleted = false`.

**Independent Test**: Toggle comment like twice and verify the returned `(is_liked, like_count)` reflects the database; toggle on a tombstoned comment returns `COMMENT_NOT_FOUND`; toggle on a comment whose parent post is removed returns `POST_NOT_FOUND`.

- [x] T039 [US7] Add `toggleCommentLikeQuery({ comment_id })` to `modules/community/queries.ts` — validates via `commentIdSchema`, invokes `supabase.rpc('toggle_comment_like', { p_comment_id })`, maps RPC errors `'COMMENT_NOT_FOUND'` / `'POST_NOT_FOUND'` / `'UNAUTHENTICATED'` to `CustomError` instances, returns `ToggleCommentLikeResult`
- [x] T040 [US7] Add `toggleCommentLikeAction({ comment_id })` to `modules/community/actions.ts` — wrap with `errorHandler()`, after success look up the parent post's `author_id` (via `community_post_comments` → `community_posts`) and call `revalidatePath('/community')` + `revalidatePath(\`/profile/${postAuthorId}\`)`

**Checkpoint**: All three gating branches and the happy path work; the commenting user's own profile is **not** revalidated.

---

## Phase 13: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, type hygiene, and quickstart sign-off.

- [x] T041 Run `npm run check` at the repo root — format, lint, and type-check must all pass with zero errors
- [x] T042 Execute all 16 scenarios in `specs/006-community-feed-queries/quickstart.md` end-to-end against a seeded dev database and tick every item in the "Definition of Done" checklist
- [x] T043 Confirm no UI files, hooks, or client components were added in this phase — grep for new files under `modules/community/components/`, `modules/community/**/components/`, and any `'use client'` directive introduced by this branch; if any exist, remove them (phase is data-layer-only per plan.md § Project Structure)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1, T001–T015)**: T001 blocks T002–T010 (RPCs depend on the schema delta and RLS). T011 (type regen) blocks every Phase 3+ task. T012–T014 are parallelizable with each other but all must land before Phase 2.
- **Foundational (Phase 2, T016)**: Depends on T011–T014 completion. **BLOCKS every user story.**
- **User Stories (Phases 3–12)**: All depend on Phase 2 completion. Once Phase 2 lands, US1–US10 phases are mutually independent and may proceed in parallel.
- **Polish (Phase 13)**: Depends on all user story phases being complete.

### User Story Dependencies

- All ten user-story phases are independent of each other after Foundational. The only implicit sharing is the private helper `mapFeedPostRow` introduced in T017 and reused in T037 — T037 depends on T017 for that reason (sequence US9 after US1, or duplicate the mapper if parallelized by different developers).

### Within Each User Story

- Query function (`queries.ts`) must land before its server-action wrapper (`actions.ts`).
- Server actions own all `revalidatePath` calls — query functions never call `revalidatePath`.

### Parallel Opportunities

- **Setup**: T002–T010 all depend on T001 but are independent RPC definitions; a single developer applies them as one migration, but within that migration each function body is written in parallel. T012, T013, T014 are fully parallel after T001 (different files).
- **User stories**: US1, US2, US3, US4, US10, US6, US8, US7 may all proceed in parallel after T016. US5 (add-comment) depends on nothing but the foundation. US9 depends on US1's `mapFeedPostRow` helper.

---

## Parallel Example: Phase 1 Setup

```bash
# After T001 (migration + RLS) lands, these can be applied in one migration pass
# but drafted in parallel:
Task: "Create RPC get_community_feed per contracts/rpc-functions.sql §1"
Task: "Create RPC get_user_community_posts per contracts/rpc-functions.sql §2"
Task: "Create RPC get_community_post_detail per contracts/rpc-functions.sql §3"
Task: "Create RPC toggle_post_like per contracts/rpc-functions.sql §4"
Task: "Create RPC toggle_post_bookmark per contracts/rpc-functions.sql §5"
Task: "Create RPC toggle_comment_like per contracts/rpc-functions.sql §6"
Task: "Replace RPC add_comment per contracts/rpc-functions.sql §7"
Task: "Create RPC get_post_comments per contracts/rpc-functions.sql §8"
Task: "Create RPC get_comment_replies per contracts/rpc-functions.sql §9"

# In parallel, on separate files:
Task: "Extend utils/CustomError.ts with optional code field"
Task: "Extend utils/error-handler.ts ApiResponseError with code field"
Task: "Extend modules/community/server-schema.ts with pagination/content/category Zod schemas"
```

## Parallel Example: After Phase 2 lands

```bash
# Eight user stories can start immediately in parallel:
Developer A: T017–T018 (US1 Feed)
Developer B: T019–T020 (US2 Like)
Developer C: T021–T022 (US3 Bookmark)
Developer D: T023–T024 (US10 Post Detail)
Developer E: T025–T028 (US4 View Comments)
Developer F: T029–T030 (US5 Add Comment)
Developer G: T031–T034 (US6 Edit/Delete Comment)
Developer H: T035–T036 (US8 Delete Post)
# Once US1 lands, pick up US9 (T037–T038) and US7 (T039–T040) — both independent
```

---

## Implementation Strategy

### MVP First (P1 only: US1 + US2 + US3)

1. Complete Phase 1 (T001–T015) — migration, RPCs, type regen, shared utilities
2. Complete Phase 2 (T016) — response entity types
3. Complete Phase 3 (US1 — browse feed) and **validate scenarios 1–3 from quickstart.md**
4. Complete Phase 4 (US2 — post like) and **validate scenario 4**
5. Complete Phase 5 (US3 — post bookmark) and **validate scenario 5**
6. Stop and sign off the MVP slice — the downstream UI phase can begin consuming these actions

### Incremental Delivery

1. MVP slice above → unblocks the community feed list UI
2. Add US10 (post detail) → unblocks the post-detail modal
3. Add US4 + US5 (view / add comments) → unblocks the comment thread UI
4. Add US6 (edit/delete own comments) → unblocks the comment kebab menu
5. Add US8 (delete own post) → unblocks the post kebab menu
6. Add US9 (user posts) → unblocks the profile community tab
7. Add US7 (comment likes) → unblocks the heart icon on comments
8. Polish phase — run all 16 quickstart scenarios and `npm run check`

### Parallel Team Strategy

With multiple developers:

1. One developer owns Phase 1 + Phase 2 end-to-end (T001–T016) since the migration and type regen are a single serialized operation
2. Once T016 lands, up to eight developers can pick up US1, US2, US3, US4, US5, US6, US8, US10 in parallel (US7 and US9 follow shortly after US1 lands)
3. Final polish (T041–T043) is done by whoever lands last

---

## Notes

- `[P]` tasks edit different files and have no incomplete dependencies
- Every server action passes through `errorHandler()` — no raw throws reach the UI
- `revalidatePath` targets are **always** `/community` and `/profile/${postAuthorId}` — never the commenting user's own profile for comment mutations
- snake_case is preserved end-to-end from DB → query → action → caller; no camelCase transformer layer
- No automated tests are generated; verification runs through `quickstart.md`
- Commit after each task or logical group; stop at any checkpoint to validate a story independently
