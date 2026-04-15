---
description: 'Executable task list for Phase 1 — Admin User Management (013-admin-user-rpcs)'
---

# Tasks: Admin User Management — Secure Server Operations

**Input**: Design documents from `/home/m7md/a/gaza-tech/front-end-agy/specs/013-admin-user-rpcs/`
**Feature branch**: `013-admin-user-rpcs`

## Execution notes for the implementer (READ FIRST)

This task list is written so a less-contextual model (Gemini CLI, etc.) can execute it end-to-end without having to re-derive decisions.

Follow these rules verbatim:

1. **Do not invent SQL or TypeScript**. Every task that writes code points you at a _source of truth_ file in this spec directory. You extract SQL from the `## SQL reference` fenced block of each `contracts/*.md` file, or copy the migration snippet from `data-model.md`. Do not paraphrase — copy.
2. **Supabase migrations are applied via the Supabase MCP tool** `mcp__supabase__apply_migration`. Each SQL file in `contracts/sql/` becomes one migration with a `name` equal to the file's basename without extension. Do not run them ad-hoc with `execute_sql`.
3. **After every migration phase (1, 2 and each RPC in Phase 3)**, regenerate types: run `mcp__supabase__generate_typescript_types` and write the result to `types/supabase.ts`.
4. **Absolute paths**. Every task gives an absolute path. Do not create files anywhere else.
5. **Each task is one commit**. Follow Conventional Commits; suggested prefixes are in each task. Stop after each task, verify it, then move on. Do not bulk-commit.
6. **Scope lock**. This phase delivers: SQL migrations + 6 RPCs + thin TS wrappers in `modules/admin-users/` + the public-listing-visibility patch. No UI. No tests beyond the quickstart SQL checks. Do not add anything else.
7. **Self-verify after each task** using the relevant quickstart section (`/home/m7md/a/gaza-tech/front-end-agy/specs/013-admin-user-rpcs/quickstart.md`). If quickstart doesn't cover it (e.g. TS wrappers), at minimum run `npm run type-check` before committing.
8. **If a task fails**, stop. Do not proceed to the next task. Report the failure.

Format legend: `- [ ] T### [P?] [Story?] Description (absolute path). SOURCE: <spec file>`

- `[P]` = parallel-safe (no conflict with other `[P]` tasks in the same phase).
- `[US#]` = belongs to User Story # from spec.md.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the co-located migration folder and confirm Supabase access before any code is written.

- [ ] T001 Create directory `/home/m7md/a/gaza-tech/front-end-agy/specs/013-admin-user-rpcs/contracts/sql/` (no `.gitkeep` — real files land in it in Phase 2). Use `mkdir -p`. No commit yet; T002 produces the first file.
- [ ] T002 [P] Verify Supabase MCP connectivity: call `mcp__supabase__list_projects` and confirm the active project (the one used by this repo's `.env.local`) is listed. If no project is returned, STOP and report. No file changes, no commit.
- [ ] T003 [P] Verify the repo builds cleanly before any changes. Run `npm run check` (format + lint + type-check) from the repo root. If it fails, STOP and report the failure. No commit.

---

## Phase 2: Foundational (Schema migrations — BLOCK all user stories)

**Purpose**: Apply the four schema changes every RPC depends on. Order matters — apply top-to-bottom.

**Source-of-truth file**: `/home/m7md/a/gaza-tech/front-end-agy/specs/013-admin-user-rpcs/data-model.md`

**⚠️ No RPC work may begin until Phase 2 is fully green. All four migrations must apply without errors on the live Supabase project.**

- [ ] T004 Create SQL file `/home/m7md/a/gaza-tech/front-end-agy/specs/013-admin-user-rpcs/contracts/sql/01_add_banned_at.sql` with the contents of the **`#### Migration — new column`** block in `data-model.md` (the `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS banned_at ...` plus its `COMMENT ON COLUMN`). Commit as `feat(db): add banned_at column to users`.

- [ ] T005 Apply migration `01_add_banned_at` via `mcp__supabase__apply_migration` with `name = "admin_users_01_add_banned_at"` and the SQL from T004. Verify by running `mcp__supabase__execute_sql` with `SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='banned_at';` — expect one row returned. No commit (migrations are applied server-side; the local SQL file is the artifact).

- [ ] T006 Create SQL file `/home/m7md/a/gaza-tech/front-end-agy/specs/013-admin-user-rpcs/contracts/sql/02_user_role_check.sql` with the contents of the **`#### Migration — CHECK constraint on user_role`** block in `data-model.md` (both the backfill `UPDATE` and the `ALTER TABLE ... ADD CONSTRAINT users_user_role_check`). Commit as `feat(db): enforce user_role check constraint`.

- [ ] T007 Apply migration `02_user_role_check` via `mcp__supabase__apply_migration` with `name = "admin_users_02_user_role_check"`. Verify by running `SELECT conname FROM pg_constraint WHERE conname = 'users_user_role_check';` — expect one row.

- [ ] T008 Create SQL file `/home/m7md/a/gaza-tech/front-end-agy/specs/013-admin-user-rpcs/contracts/sql/03_admin_action_rate_log.sql` with the contents of the **`### AdminActionRateLog` → `#### Migration`** block in `data-model.md` (the `CREATE TABLE`, the `CREATE INDEX`, and the `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` with its comment). Commit as `feat(db): add admin_action_rate_log table`.

- [ ] T009 Apply migration `03_admin_action_rate_log` via `mcp__supabase__apply_migration` with `name = "admin_users_03_rate_log"`. Verify `SELECT to_regclass('public.admin_action_rate_log');` returns a non-null value.

- [ ] T010 Create SQL file `/home/m7md/a/gaza-tech/front-end-agy/specs/013-admin-user-rpcs/contracts/sql/04_supporting_indexes.sql` with the contents of the **`## Indexes supporting admin_list_users performance (SC-001)`** block in `data-model.md` (the `CREATE EXTENSION pg_trgm`, the trigram index on `first_name || ' ' || last_name`, and the four btree indexes). Commit as `perf(db): add indexes supporting admin_list_users`.

- [ ] T011 Apply migration `04_supporting_indexes` via `mcp__supabase__apply_migration` with `name = "admin_users_04_indexes"`. Verify with `SELECT indexname FROM pg_indexes WHERE schemaname='public' AND indexname IN ('users_full_name_trgm_idx','users_user_role_idx','users_is_active_idx','users_created_at_idx','users_last_activity_idx');` — expect five rows.

- [ ] T012 Regenerate `types/supabase.ts`: call `mcp__supabase__generate_typescript_types` and overwrite `/home/m7md/a/gaza-tech/front-end-agy/types/supabase.ts` with the result. Run `npm run type-check` — it must pass. Commit as `chore(types): regenerate Supabase types after Phase 1 foundational migrations`.

**Checkpoint**: `public.users.banned_at` exists, `users_user_role_check` is active, `admin_action_rate_log` is created, all five perf indexes are in place, and `types/supabase.ts` reflects the new shape. User-story phases may now begin.

---

## Phase 3: User Story 1 — Admin Browses the User Directory (Priority: P1) 🎯 MVP

**Goal**: Expose a single `admin_list_users` RPC so an admin can page, filter, search, and sort the user directory.

**Independent Test**: Run the **`## 1. Smoke — list users`** section of `quickstart.md` end-to-end. All positive and negative cases there must pass.

**Source of truth**: `/home/m7md/a/gaza-tech/front-end-agy/specs/013-admin-user-rpcs/contracts/admin_list_users.md`

### Implementation for User Story 1

- [ ] T013 [US1] Create SQL file `/home/m7md/a/gaza-tech/front-end-agy/specs/013-admin-user-rpcs/contracts/sql/05_admin_list_users.sql` with the contents of the **`## SQL reference (authoritative)`** fenced block in `contracts/admin_list_users.md` — the full `CREATE OR REPLACE FUNCTION public.admin_list_users(...)` plus the trailing `GRANT EXECUTE`. Commit as `feat(db): add admin_list_users RPC`.

- [ ] T014 [US1] Apply migration via `mcp__supabase__apply_migration` with `name = "admin_users_05_list_users"` and the SQL from T013. Verify: run `mcp__supabase__execute_sql` with `SELECT proname FROM pg_proc WHERE proname='admin_list_users';` — expect one row.

- [ ] T015 [US1] Regenerate `types/supabase.ts`: call `mcp__supabase__generate_typescript_types` and overwrite the file. Run `npm run type-check`. Commit as `chore(types): regenerate types (admin_list_users)`.

- [ ] T016 [P] [US1] Create `/home/m7md/a/gaza-tech/front-end-agy/modules/admin-users/constants.ts` with exactly these exports (no other code):

  ```ts
  export const ADMIN_USERS_MAX_PAGE_SIZE = 100;
  export const ADMIN_USERS_DEFAULT_PAGE_SIZE = 25;
  export const ADMIN_USERS_MAX_BAN_REASON_LENGTH = 500;
  export const ADMIN_USERS_SORT_COLUMNS = [
    'name',
    'role',
    'status',
    'is_verified',
    'created_at',
    'last_activity_at',
  ] as const;
  export const ADMIN_USERS_SORT_DIRECTIONS = ['asc', 'desc'] as const;
  export const ADMIN_USERS_STATUS_FILTERS = [
    'all',
    'active',
    'banned',
  ] as const;
  export const ADMIN_USERS_RATE_LIMIT_DEFAULT = Number(
    process.env.ADMIN_RATE_LIMIT ?? 60
  );
  export const ADMIN_USERS_RATE_WINDOW_SECONDS_DEFAULT = Number(
    process.env.ADMIN_RATE_LIMIT_WINDOW_SECONDS ?? 60
  );
  ```

  Part of the commit for T019.

- [ ] T017 [P] [US1] Create `/home/m7md/a/gaza-tech/front-end-agy/modules/admin-users/types/index.ts` with the TypeScript types derived from the contract `contracts/admin_list_users.md` "Output" section. Include:
  - `AdminUserRow` matching the `items[]` JSON shape (user_id, first_name, last_name, email, avatar_url, user_role, is_active, is_verified, ban_reason, banned_at, created_at, last_activity_at — use `string | null` for nullable timestamps/text and the `Database['public']['Enums']` types where a Supabase enum exists; fall back to the four-value literal union `'registered' | 'verified_seller' | 'moderator' | 'admin'` for `user_role`).
  - `AdminUserListInput` (pageIndex, pageSize, sortColumn, sortDirection, search, roleFilter, statusFilter) — use `typeof ADMIN_USERS_SORT_COLUMNS[number]` etc. from `constants.ts`.
  - `AdminUserListResult` (totalCount, items, pageIndex, pageSize).
    Part of the commit for T019.

- [ ] T018 [US1] Create `/home/m7md/a/gaza-tech/front-end-agy/modules/admin-users/queries.ts`. Export one async function `listAdminUsersQuery(input: AdminUserListInput): Promise<AdminUserListResult>` that:
  1. Gets `supabase = await createClient()` from `@/lib/supabase/server`.
  2. Calls `supabase.rpc('admin_list_users', { p_page_index, p_page_size, p_sort_column, p_sort_direction, p_search, p_role_filter, p_status_filter })` mapping camelCase input to the snake_case RPC args.
  3. If `error`, `throw error` (let `errorHandler` in `actions.ts` translate it).
  4. Returns `{ totalCount: data.total_count, items: data.items, pageIndex: input.pageIndex, pageSize: input.pageSize }`.
     The `.rpc()` call returns `{ data: { total_count: number; items: AdminUserRow[] } | null, error }` — trust the types from the regenerated `types/supabase.ts`. Part of the commit for T019.

- [ ] T019 [US1] Create `/home/m7md/a/gaza-tech/front-end-agy/modules/admin-users/actions.ts` with a single exported server action `listAdminUsersAction`:
  1. First line: `'use server';`.
  2. Zod schema `AdminUserListInputSchema` matching `AdminUserListInput`, using `.nativeEnum`-style validation drawn from `constants.ts` arrays. Page size capped at `ADMIN_USERS_MAX_PAGE_SIZE`.
  3. Wrap with `errorHandler(async (input) => { ... })` from `@/utils/error-handler`.
  4. Inside: `await requireRole(['admin'])` from `@/utils/rbac-handler` (defense in depth), `const parsed = AdminUserListInputSchema.parse(input)`, then `return await listAdminUsersQuery(parsed)`.
     After creating T016–T019 files, run `npm run check` (must pass). Commit as `feat(admin-users): add listAdminUsers query and server action`.

- [ ] T020 [US1] Execute `quickstart.md` section **`## 1. Smoke — list users`** against the live DB (use `mcp__supabase__execute_sql` while impersonating an admin — call `SET LOCAL role authenticated; SET LOCAL request.jwt.claim.sub = '<admin uuid>';` or equivalent per Supabase's testing pattern). Every positive and negative case (VALIDATION:pageSize, NOT_AUTHENTICATED, NOT_ADMIN) must behave exactly as documented. If any case fails, STOP. No commit — this is a verification task; record results in the PR description later.

**Checkpoint**: US1 (list) fully functional at the DB + server-action layer. Independent of US2–US5.

---

## Phase 4: User Story 2 — Admin Changes Another User's Role (Priority: P1)

**Goal**: Add `admin_change_user_role` RPC + TS wrapper. Enforces self-target and last-admin guards atomically.

**Independent Test**: Run `quickstart.md` section **`## 2. Change role`** including the last-admin guard and self-target cases.

**Source of truth**: `/home/m7md/a/gaza-tech/front-end-agy/specs/013-admin-user-rpcs/contracts/admin_change_user_role.md`

- [ ] T021 [US2] Create SQL file `/home/m7md/a/gaza-tech/front-end-agy/specs/013-admin-user-rpcs/contracts/sql/06_admin_change_user_role.sql` with the **`## SQL reference`** fenced block from `contracts/admin_change_user_role.md`. Commit as `feat(db): add admin_change_user_role RPC`.

- [ ] T022 [US2] Apply migration via `mcp__supabase__apply_migration` with `name = "admin_users_06_change_role"`. Verify with `SELECT proname FROM pg_proc WHERE proname='admin_change_user_role';`.

- [ ] T023 [US2] Regenerate `types/supabase.ts` (same procedure as T015). Commit as `chore(types): regenerate types (admin_change_user_role)`.

- [ ] T024 [US2] Extend `/home/m7md/a/gaza-tech/front-end-agy/modules/admin-users/queries.ts` with a new exported async function `changeAdminUserRoleQuery(input: { targetUserId: string; newRole: 'registered'|'verified_seller'|'moderator'|'admin' }): Promise<{ userId: string; userRole: string }>`. Call `supabase.rpc('admin_change_user_role', { p_target_user_id, p_new_role, p_rate_limit, p_rate_window_seconds })`, passing `ADMIN_USERS_RATE_LIMIT_DEFAULT` and `ADMIN_USERS_RATE_WINDOW_SECONDS_DEFAULT`. Return `{ userId: data[0].user_id, userRole: data[0].user_role }`.

- [ ] T025 [US2] Extend `/home/m7md/a/gaza-tech/front-end-agy/modules/admin-users/actions.ts` with `changeAdminUserRoleAction`. Zod schema: `{ targetUserId: z.string().uuid(), newRole: z.enum(['registered','verified_seller','moderator','admin']) }`. Wrap with `errorHandler` + `requireRole(['admin'])`. Delegate to `changeAdminUserRoleQuery`. Run `npm run check`. Commit T024 + T025 as `feat(admin-users): add changeAdminUserRole query and server action`.

- [ ] T026 [US2] Execute `quickstart.md` section **`## 2. Change role`** (self-target, last-admin, happy path). All cases must pass. No commit.

**Checkpoint**: US2 functional. Admins can transition any user between the four roles atomically with self-protection.

---

## Phase 5: User Story 3 — Admin Bans a User (Priority: P1)

**Goal**: Add `admin_ban_user` RPC + TS wrapper. Stores reason + `banned_at`; does not touch listings rows (visibility handled by Phase 8).

**Independent Test**: Run `quickstart.md` section **`## 3. Ban / Unban`** → ban path only (unban comes in Phase 6).

**Source of truth**: `/home/m7md/a/gaza-tech/front-end-agy/specs/013-admin-user-rpcs/contracts/admin_ban_user.md`

- [ ] T027 [US3] Create SQL file `/home/m7md/a/gaza-tech/front-end-agy/specs/013-admin-user-rpcs/contracts/sql/07_admin_ban_user.sql` with the **`## SQL reference`** block from `contracts/admin_ban_user.md`. Commit as `feat(db): add admin_ban_user RPC`.

- [ ] T028 [US3] Apply migration via `mcp__supabase__apply_migration` with `name = "admin_users_07_ban_user"`. Verify `SELECT proname FROM pg_proc WHERE proname='admin_ban_user';`.

- [ ] T029 [US3] Regenerate `types/supabase.ts`. Commit as `chore(types): regenerate types (admin_ban_user)`.

- [ ] T030 [US3] Extend `modules/admin-users/queries.ts` with `banAdminUserQuery(input: { targetUserId: string; reason: string }): Promise<{ userId: string; isActive: boolean; banReason: string; bannedAt: string }>`. Call `.rpc('admin_ban_user', { p_target_user_id, p_reason, p_rate_limit, p_rate_window_seconds })` using the defaults from `constants.ts`.

- [ ] T031 [US3] Extend `modules/admin-users/actions.ts` with `banAdminUserAction`. Zod: `{ targetUserId: z.string().uuid(), reason: z.string().trim().min(1).max(ADMIN_USERS_MAX_BAN_REASON_LENGTH) }`. Commit T030 + T031 together as `feat(admin-users): add banAdminUser query and server action`.

- [ ] T032 [US3] Execute `quickstart.md` **`## 3. Ban / Unban`** — only the ban cases (self-target rejection, empty reason → VALIDATION:reason, happy path, re-ban refreshes `banned_at`). All cases must pass. No commit.

**Checkpoint**: US3 functional. Ban data state is correct. Listings visibility is NOT yet filtered — Phase 8 handles that. Verify that Scenario 3.1 step "listings disappear from public surfaces" is NOT yet true — it will become true after Phase 8.

---

## Phase 6: User Story 4 — Admin Unbans a User (Priority: P2)

**Goal**: Add `admin_unban_user` RPC + TS wrapper. Idempotent when target already active.

**Independent Test**: Run `quickstart.md` section **`## 3. Ban / Unban`** → unban + idempotent cases.

**Source of truth**: `/home/m7md/a/gaza-tech/front-end-agy/specs/013-admin-user-rpcs/contracts/admin_unban_user.md`

- [ ] T033 [US4] Create SQL file `/home/m7md/a/gaza-tech/front-end-agy/specs/013-admin-user-rpcs/contracts/sql/08_admin_unban_user.sql` with the **`## SQL reference`** block from `contracts/admin_unban_user.md`. Commit as `feat(db): add admin_unban_user RPC`.

- [ ] T034 [US4] Apply migration via `mcp__supabase__apply_migration` with `name = "admin_users_08_unban_user"`. Verify.

- [ ] T035 [US4] Regenerate `types/supabase.ts`. Commit as `chore(types): regenerate types (admin_unban_user)`.

- [ ] T036 [US4] Extend `modules/admin-users/queries.ts` with `unbanAdminUserQuery(input: { targetUserId: string }): Promise<{ userId: string; isActive: boolean }>`. Call `.rpc('admin_unban_user', { p_target_user_id, p_rate_limit, p_rate_window_seconds })`.

- [ ] T037 [US4] Extend `modules/admin-users/actions.ts` with `unbanAdminUserAction`. Zod: `{ targetUserId: z.string().uuid() }`. Commit T036 + T037 as `feat(admin-users): add unbanAdminUser query and server action`.

- [ ] T038 [US4] Execute `quickstart.md` **`## 3. Ban / Unban`** unban cases (already-active no-op, unban-after-ban restores active, clears `ban_reason` and `banned_at`). All cases must pass. No commit.

**Checkpoint**: US4 functional. Ban → Unban → Ban round-trip works.

---

## Phase 7: User Story 5 — Admin Edits a User's Profile + Change Email (Priority: P2)

**Goal**: Add `admin_edit_user` (closed-whitelist profile edit) and `admin_change_user_email` (separate email-change path per FR-055).

**Independent Test**: Run `quickstart.md` sections **`## 4. Edit profile`** and **`## 5. Change email`**.

**Sources of truth**:

- `/home/m7md/a/gaza-tech/front-end-agy/specs/013-admin-user-rpcs/contracts/admin_edit_user.md`
- `/home/m7md/a/gaza-tech/front-end-agy/specs/013-admin-user-rpcs/contracts/admin_change_user_email.md`

### Edit profile

- [ ] T039 [US5] Create SQL file `/home/m7md/a/gaza-tech/front-end-agy/specs/013-admin-user-rpcs/contracts/sql/09_admin_edit_user.sql` with the **`## SQL reference`** block from `contracts/admin_edit_user.md`. Commit as `feat(db): add admin_edit_user RPC`.

- [ ] T040 [US5] Apply migration via `mcp__supabase__apply_migration` with `name = "admin_users_09_edit_user"`. Verify.

- [ ] T041 [US5] Regenerate `types/supabase.ts`. Commit as `chore(types): regenerate types (admin_edit_user)`.

- [ ] T042 [US5] Extend `modules/admin-users/queries.ts` with `editAdminUserQuery(input: { targetUserId: string; updates: Record<string, unknown> }): Promise<{ userId: string }>`. Call `.rpc('admin_edit_user', { p_target_user_id, p_updates, p_rate_limit, p_rate_window_seconds })` — pass `input.updates` directly as jsonb.

- [ ] T043 [US5] Extend `modules/admin-users/actions.ts` with `editAdminUserAction`. Zod schema that matches the whitelist in `contracts/admin_edit_user.md` § "Whitelist (FR-050)" exactly:
  - `first_name`, `last_name`: `z.string().trim().min(1).max(100).optional()`
  - `phone`: `z.string().trim().min(5).max(30).regex(/^[+0-9 ()-]+$/).nullable().optional()`
  - `is_verified`: `z.boolean().optional()`
  - `avatar_url`: `z.string().url().max(500).nullable().optional()`
  - `social_links`: `z.object({ facebook_link_url, instagram_link_url, twitter_link_url, website_url }).partial()` where each value is `z.string().url().max(500).nullable().optional()`
    Wrap the input as `{ targetUserId: z.string().uuid(), updates: <whitelistSchema> }`. Use `.strict()` on the whitelist so unknown keys fail fast client-side even though the RPC also enforces it. Commit T042 + T043 as `feat(admin-users): add editAdminUser query and server action`.

- [ ] T044 [US5] Execute `quickstart.md` **`## 4. Edit profile`** — happy path, empty update, disallowed field, bad social_links URL. All cases must pass. No commit.

### Change email

- [ ] T045 [US5] Create SQL file `/home/m7md/a/gaza-tech/front-end-agy/specs/013-admin-user-rpcs/contracts/sql/10_admin_change_user_email.sql` with the **`## SQL reference`** block from `contracts/admin_change_user_email.md`. **Important**: this function updates `auth.users`. The migration may fail on the first apply if the owning role lacks UPDATE on `auth.users`. If so, prepend the following grant statements to the SQL file (run as the Supabase admin during migration):

  ```sql
  -- Run once; the function is owned by postgres which has auth.users access via Supabase defaults.
  GRANT UPDATE, SELECT ON TABLE auth.users TO postgres;
  ```

  Commit as `feat(db): add admin_change_user_email RPC`.

- [ ] T046 [US5] Apply migration via `mcp__supabase__apply_migration` with `name = "admin_users_10_change_email"`. If the apply fails with a permission error on `auth.users`, stop and report (do NOT loosen auth schema permissions unilaterally). Verify `SELECT proname FROM pg_proc WHERE proname='admin_change_user_email';`.

- [ ] T047 [US5] Regenerate `types/supabase.ts`. Commit as `chore(types): regenerate types (admin_change_user_email)`.

- [ ] T048 [US5] Extend `modules/admin-users/queries.ts` with `changeAdminUserEmailQuery(input: { targetUserId: string; newEmail: string }): Promise<{ userId: string; email: string }>`. Call `.rpc('admin_change_user_email', { p_target_user_id, p_new_email, p_rate_limit, p_rate_window_seconds })`.

- [ ] T049 [US5] Extend `modules/admin-users/actions.ts` with `changeAdminUserEmailAction`. Zod: `{ targetUserId: z.string().uuid(), newEmail: z.string().trim().toLowerCase().email().max(254) }`. Commit T048 + T049 as `feat(admin-users): add changeAdminUserEmail query and server action`.

- [ ] T050 [US5] Execute `quickstart.md` **`## 5. Change email`** — happy path, duplicate email (`EMAIL_IN_USE`), malformed (`VALIDATION:email`). All cases must pass. No commit.

**Checkpoint**: All five user stories have working DB + server-action layers. Phase 8 wires the cross-feature visibility guarantee.

---

## Phase 8: Cross-cutting — Public Listing Visibility After Ban (mandatory precondition for FR-037)

**Goal**: Make banning a user actually hide that user's marketplace listings on public surfaces, per the contract in `contracts/public_listing_ban_visibility.md`. This is the companion to Phase 5 (US3) — without it, ban is a visibility hole.

**Source of truth**: `/home/m7md/a/gaza-tech/front-end-agy/specs/013-admin-user-rpcs/contracts/public_listing_ban_visibility.md`

**Scope**: ONLY the **public-facing** listing queries in `modules/listings/queries.ts`. Do NOT modify `getSellerListingsQuery` (that is the seller's own-view). Do NOT modify any community query.

Public-facing queries to patch in `/home/m7md/a/gaza-tech/front-end-agy/modules/listings/queries.ts`:

1. `getListingDetailsQuery` (line ~68) — listing detail page. If the join returns a row whose owner `users.is_active = false`, the function must return `null` (translates to 404 upstream).
2. `getSimilarListingsQuery` (line ~125) — related listings on detail page.
3. `getListingsQuery` (line ~525) — powers browse + home "latest listings".
4. `hybridSearchListingsQuery` (line ~732) — search endpoint.

For each of those four functions:

- [ ] T051 Patch `getListingDetailsQuery` in `/home/m7md/a/gaza-tech/front-end-agy/modules/listings/queries.ts`. Open the function, find the existing `users!marketplace_listings_seller_id_fkey (...)` embedded select. Add `is_active` to the selected fields. After the `.single()` / `.maybeSingle()` call, add a guard: if `data?.users?.is_active === false`, return `null`. Commit as `fix(listings): hide banned sellers' listing detail from public`.

- [ ] T052 [P] Patch `getSimilarListingsQuery` in the same file. Add the embedded users select `users!inner (is_active)` (use `!inner` so rows where `is_active=false` are filtered out at the join) AND add `.eq('users.is_active', true)`. Commit as `fix(listings): hide banned sellers' similar listings from public`.

- [ ] T053 [P] Patch `getListingsQuery` in the same file. Same pattern: upgrade the seller join to `users!inner` and add `.eq('users.is_active', true)`. This covers home page "latest" and browse/category. Commit as `fix(listings): filter banned sellers from public listings feed`.

- [ ] T054 [P] Patch `hybridSearchListingsQuery` in the same file. Same pattern. Commit as `fix(listings): filter banned sellers from search results`.

- [ ] T055 Verify: run `npm run check`. Then manually: pick a user with published listings, call `banAdminUserAction` on them, and verify via SQL (`SELECT count(*) FROM ...` equivalent, or by calling the four actions/queries above) that their listings are absent from every patched query's result. Then `unbanAdminUserAction` and verify they reappear. No commit — this is a verification task; results go in the PR description.

**Checkpoint**: FR-037 is truly satisfied. Ban → listings hidden. Unban → listings restored. Community posts/comments untouched (no changes made to community queries, per FR-038).

---

## Phase 9: Polish & Cross-Cutting Concerns

- [ ] T056 [P] Add an index file `/home/m7md/a/gaza-tech/front-end-agy/modules/admin-users/index.ts` that re-exports everything from `actions.ts` and the public types from `types/index.ts`. No new logic — just re-exports. Commit as `refactor(admin-users): add module barrel export`.

- [ ] T057 Run the full quickstart walkthrough end-to-end: `quickstart.md` sections 1 → 7 in order, against a clean test pair of ADMIN + TARGET users. Every section's expectations must hold. If section 6 (rate limiting) exceeds the window, wait it out; do not lower limits. If any section fails, STOP and report. No commit — outcome is documented in the PR description.

- [ ] T058 Run `npm run check` one last time across the whole repo. Must pass. If it fails because of unrelated pre-existing issues, note them in the PR; do not fix outside this feature's scope. No commit if no changes.

- [ ] T059 Update `/home/m7md/a/gaza-tech/front-end-agy/specs/013-admin-user-rpcs/spec.md` status from `Draft` to `Implemented (Phase 1 server-side)` in the header block. Commit as `docs(013-admin-user-rpcs): mark Phase 1 implemented`.

---

## Dependencies & Execution Order

### Phase dependencies

- Phase 1 (Setup) → no deps, runs first.
- Phase 2 (Foundational migrations) → requires Phase 1. **Blocks Phases 3–8.**
- Phase 3 (US1 list) → requires Phase 2.
- Phase 4 (US2 change role) → requires Phase 2. Independent of Phase 3.
- Phase 5 (US3 ban) → requires Phase 2. Independent of Phase 3/4.
- Phase 6 (US4 unban) → requires **Phase 5** (to have something to unban in quickstart; functionally the SQL compiles without it).
- Phase 7 (US5 edit + change_email) → requires Phase 2. Independent of other stories.
- Phase 8 (public listing visibility) → requires Phase 5 (otherwise there's no ban to verify against). The code patches are independent of the RPCs per se, but the **verification** step needs ban/unban working.
- Phase 9 (polish) → requires all prior phases.

### Per-story task dependencies (within each phase)

- Within each RPC phase: `SQL file → apply migration → regenerate types → queries.ts addition → actions.ts addition → verification`. Strict serial order. Types regeneration cannot be skipped because the TS wrappers depend on the updated `Database['public']['Functions']` typings.
- Inside `modules/admin-users/*.ts`, every phase touches the **same** `queries.ts` and `actions.ts` files, so those additions are NOT `[P]` across phases.

### Parallel opportunities

- Phase 1: T002 and T003 are `[P]` with each other.
- Phase 3 pre-wrapper files: T016 and T017 are `[P]` (different files). T018 depends on T017 (imports types). T019 depends on T016, T017, T018.
- Phase 8: T052, T053, T054 are `[P]` with each other (they touch different exported functions in the same file, but the functions are non-overlapping textually — apply each in its own edit). T051 should go first because the detail-page guard is slightly different from the list filters.
- Across phases 3/4/5/7 — an implementer with multiple sessions could parallelize US1 / US2 / US3 / US5. US4 must follow US3. Phase 8 must follow US3.

---

## Parallel Example: Phase 3 (User Story 1)

```bash
# T016 and T017 can be written simultaneously (different files):
Task: "Create /home/.../modules/admin-users/constants.ts per T016"
Task: "Create /home/.../modules/admin-users/types/index.ts per T017"

# Then sequentially:
Task: "Create modules/admin-users/queries.ts per T018"
Task: "Create modules/admin-users/actions.ts per T019"
```

---

## Implementation Strategy

### MVP (ship this first)

1. Phase 1 + Phase 2 (schema ready).
2. Phase 3 (US1 list) — gives the future dashboard something to render.
3. Stop. Validate with quickstart § 1. Open PR, review, merge.

### Incremental additions post-MVP

- Phase 4 (US2 change role) → quickstart § 2.
- Phase 5 (US3 ban) + **Phase 8** (visibility) → these two ship together or US3 is a visibility hole. Quickstart § 3 + verification steps in Phase 8 T055.
- Phase 6 (US4 unban) → quickstart § 3 unban cases.
- Phase 7 (US5 edit + change email) → quickstart § 4 + § 5.
- Phase 9 (polish) → final cleanup PR.

### STOP conditions (report and do not proceed)

- Any migration fails to apply.
- `types/supabase.ts` regeneration yields unexpected drift in unrelated tables.
- `npm run check` fails after any commit in Phases 3–8.
- Any quickstart assertion fails.
- `mcp__supabase__get_advisors` emits a new critical advisor after a migration applies.

---

## Notes

- Every task's SQL **must** be copied verbatim from the referenced contract's `## SQL reference` block. The contracts are the spec; paraphrasing is a bug.
- Do not create a `supabase/migrations/` directory. Migrations live in `specs/013-admin-user-rpcs/contracts/sql/` (per research R2) and are applied via the Supabase MCP.
- Tests are NOT part of this phase (not requested in spec). Verification is by running the quickstart steps against the live database.
- Rate limit defaults come from env: `ADMIN_RATE_LIMIT` and `ADMIN_RATE_LIMIT_WINDOW_SECONDS`. If those env vars are not set in `.env.local`, the constants default to `60 / 60`. This is deliberate per FR-065 — do not hard-code.
- Commit after every task unless the task explicitly says "No commit". Do not batch multiple tasks into one commit unless paired (e.g. T016+T017+T018+T019 may ship together because the wrapper is only useful as a whole).
