# Implementation Plan: Community Feed Queries

**Branch**: `006-community-feed-queries` | **Date**: 2026-04-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-community-feed-queries/spec.md`

## Summary

Deliver the data-access layer for the community feed: paginated feed / user-posts / post-detail / comments queries, toggle like & bookmark mutations, comments CRUD with two-level flattened threading, and soft-delete for posts and comments. All server logic lives in `modules/community/queries.ts` and `modules/community/actions.ts`; no UI is produced in this phase.

Technical approach (from spec clarifications):

- **Atomic mutations** via three dedicated Postgres RPC functions (`toggle_post_like`, `toggle_post_bookmark`, `toggle_comment_like`) that perform check-and-swap + `content_status='published'` gate in one round-trip. `add_comment` is updated to perform the same gate + two-level parent rewrite inside SQL.
- **Single-round-trip reads** with correlated `EXISTS` subqueries for `is_liked` / `is_bookmarked` scoped to `auth.uid()`; unauthenticated callers naturally get `false`.
- **Pagination envelope** `{ data, has_more, next_page }` derived by fetching `limit + 1` rows — no `COUNT(*)` round-trips.
- **Two-level threading**: replies are stored with their true `parent_comment_id`, but `add_comment` auto-rewrites any reply-of-reply to its top-level ancestor at write time; read queries flatten descendants under the top-level ancestor with a 20-reply cap + `has_more_replies` + dedicated "more replies" paginated query.
- **Soft-delete everywhere**: posts via `content_status='removed'`; comments via `is_deleted=true` + blanked `content` (tombstones retained so descendant replies stay threaded).
- **Structured errors**: `CustomError` is extended to carry an optional `code` so `errorHandler()` can emit `{ success: false, code, message }` with stable codes `POST_NOT_FOUND`, `UNAUTHORIZED`, `COMMENT_NOT_FOUND`.
- **Defense in depth**: RLS policies on `UPDATE`/`DELETE` for `community_posts` and `community_post_comments` scoped to `author_id = auth.uid()`; server actions still preflight with a clean `SELECT` so the UI receives a structured error rather than a raw RLS failure.

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 16 (App Router), React 19
**Primary Dependencies**: `@supabase/supabase-js` ^2.86.0, `zod` ^4.2.1, `next-intl` ^4.7.0, shared utilities (`utils/error-handler.ts`, `utils/auth-handler.ts`, `utils/CustomError.ts`, `lib/zod-error.ts`)
**Storage**: Supabase Postgres — tables `community_posts`, `community_posts_attachments`, `community_posts_likes`, `bookmarked_posts`, `community_post_comments`, `community_comments_likes`, `users`. Supabase Storage bucket `community-attachments` (public-read, URLs emitted via `storage.from().getPublicUrl()`).
**Testing**: Manual verification per the `quickstart.md` scenarios; existing repo has no unit-test harness for server actions — each query is exercised end-to-end from a seeded feature branch before integration into UI phases.
**Target Platform**: Server (Node.js) — all new code lives in `'use server'` modules under `modules/community/`; no client components.
**Project Type**: Web application (Next.js App Router, module-first architecture mandated by constitution).
**Performance Goals**: Every paginated read must complete in one Postgres round-trip. Every mutation (like / bookmark / add-comment) must complete in one Postgres round-trip via RPC. No per-row hydration round-trips permitted.
**Constraints**: snake_case end-to-end (matches DB + existing codebase); `revalidatePath('/community')` + `revalidatePath('/profile/${postAuthorId}')` after every mutation; no UI or hooks in this phase.
**Scale/Scope**: ~30 query / server-action functions, ~6 Postgres RPC functions, 1 schema migration (adds `parent_comment_id`, `is_deleted` to `community_post_comments`; adds RPCs; adds RLS policies). Data volumes: feed assumed ≤10k published posts at launch; page size default 10 / max 50.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                               | Compliance                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **I. Module-First Architecture**        | ✅ All code lives under `modules/community/`; `queries.ts` and `actions.ts` are the only new server files; no shared abstractions introduced outside the module.                                                                                                                                                                                 |
| **II. Server-First Rendering**          | ✅ All new code is server-only (`'use server'` / `import 'server-only'`). No client components, no client data fetching.                                                                                                                                                                                                                         |
| **III. Incremental Staged Development** | ✅ Phase 2 (tasks.md) will split delivery into: (a) migration + type regen, (b) `CustomError`/`errorHandler` extension for `code`, (c) per-feature queries one at a time (feed → bookmark → like → detail → user-posts → comments read → add-comment → edit/delete comment → delete post → comment like → more-replies), each as its own commit. |
| **IV. Performance Standards**           | ✅ Single round-trip per read via correlated EXISTS; single round-trip per mutation via RPCs; `limit + 1` pagination avoids COUNT. No UI work so Core Web Vitals unaffected.                                                                                                                                                                     |
| **V. Accessibility**                    | N/A — no UI delivered in this phase. Downstream UI phases are responsible for WCAG compliance.                                                                                                                                                                                                                                                   |
| **VI. Consistent Error Handling**       | ✅ Every server action is wrapped with `errorHandler()`. Validation via Zod at the action boundary. Business-logic errors raised as `CustomError` with stable codes.                                                                                                                                                                             |

**Gate result**: PASS — proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/006-community-feed-queries/
├── plan.md              # This file
├── spec.md              # Clarified feature spec (input)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output — manual verification scenarios
├── contracts/           # Phase 1 output — server-action + RPC signatures
│   ├── server-actions.md
│   └── rpc-functions.sql
└── tasks.md             # Phase 2 output (created by /speckit.tasks, NOT by /speckit.plan)
```

### Source Code (repository root)

This is a Next.js App Router web app with a strict module-first layout. The feature extends the existing `modules/community/` module in place — no new top-level directories are created.

```text
modules/community/
├── types/
│   └── index.ts                  # EXTEND: add response-envelope types, author-stub type,
│                                 #          feed/comment/reply/detail row types
├── schema.ts                     # EXISTING client schemas (unchanged)
├── server-schema.ts              # EXTEND: add pagination, category filter, comment
│                                 #          content, post-id, comment-id validators
├── queries.ts                    # EXTEND: add all new read queries + mutation wrappers
│                                 #          that invoke the RPCs
├── actions.ts                    # EXTEND: add server-action wrappers for every new query;
│                                 #          revalidatePath('/community') + profile page
├── components/                   # UNCHANGED (form components from prior phases)
├── create-post/                  # UNCHANGED
└── update-post/                  # UNCHANGED

utils/
├── CustomError.ts                # EXTEND: add optional `code?: string` field
└── error-handler.ts              # EXTEND: propagate `code` through ApiResponseError shape

types/
└── supabase.ts                   # REGENERATE after the migration runs

# Supabase (applied via the `mcp__supabase__apply_migration` tool during
# implementation — this repo has no checked-in supabase/ folder today):
#
# migration: 006_community_feed_queries.sql
#   - ALTER TABLE community_post_comments
#       ADD COLUMN parent_comment_id uuid REFERENCES community_post_comments(comment_id),
#       ADD COLUMN is_deleted boolean NOT NULL DEFAULT false;
#   - CREATE INDEX on (post_id, parent_comment_id, created_at);
#   - CREATE FUNCTION toggle_post_like(p_post_id uuid)      RETURNS record
#   - CREATE FUNCTION toggle_post_bookmark(p_post_id uuid)  RETURNS record
#   - CREATE FUNCTION toggle_comment_like(p_comment_id uuid) RETURNS record
#   - REPLACE FUNCTION add_comment(p_post_id uuid, p_parent_comment_id uuid, p_content text)
#       (adds content_status gate + parent auto-rewrite to top-level ancestor)
#   - RLS policies:
#       community_posts:           author UPDATE / DELETE only
#       community_post_comments:   author UPDATE / DELETE only
```

**Structure Decision**: Module-first, no structural changes. All feature code extends the existing `modules/community/` files. The only cross-module touches are (1) `utils/CustomError.ts` + `utils/error-handler.ts` to thread a stable error `code` field, and (2) `types/supabase.ts` regeneration after the migration. These are justified under Complexity Tracking below.

## Complexity Tracking

| Addition                                                                                                                                                         | Why Needed                                                                                                                                                       | Simpler Alternative Rejected Because                                                                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Extending `CustomError` with optional `code` field (shared util)                                                                                                 | Spec clarifications mandate stable machine-readable codes `POST_NOT_FOUND` / `UNAUTHORIZED` so the UI can branch on failure mode without parsing message strings | Encoding codes in `message` would force every caller to string-match; Zod-error-style `errors` map is for per-field validation, not top-level discriminators. The extension is one optional field, fully backward-compatible. |
| Extending `errorHandler()` response envelope with optional `code`                                                                                                | Same reason — the shape must surface `err.code` to the UI.                                                                                                       | Keeping the envelope frozen would require clients to parse `message` or call a separate "classify error" helper.                                                                                                              |
| Three dedicated RPC functions (`toggle_post_like`, `toggle_post_bookmark`, `toggle_comment_like`) instead of reusing the listings-style app-layer check-then-act | FR-020 mandates atomic toggle. App-layer check-then-act races under concurrent toggles and costs two round-trips (check + mutate + re-count).                    | The listings pattern exists but is known to be racy; promoting it here would violate FR-020 and FR-018a (the `content_status = 'published'` gate must be enforced authoritatively).                                           |
| RLS policy migration in addition to application-level preflight                                                                                                  | FR-029 mandates defense-in-depth: RLS is the authoritative gate; the preflight exists only to shape a clean structured error for the UI.                         | Relying on the preflight alone leaves a gap if a future code path bypasses it. RLS alone produces a raw `42501` that would need post-hoc mapping per call site.                                                               |

No other deviations from the constitution.
