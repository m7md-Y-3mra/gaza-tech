---
description: 'Task list: User Management Data Table (015)'
---

# Tasks: User Management Data Table

**Input**: Design documents from `/specs/015-users-data-table/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested. Verification = manual per `quickstart.md`.

**Organization**: Grouped by user story for independent delivery. Each task is scoped to a single file and ready for a small-context LLM to execute without further research.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different file, no pending dependency).
- **[Story]**: Maps to US1..US5 from spec.md.

## Path Conventions

- Module root: `modules/admin-users/`
- Route file: `app/[locale]/dashboard/users/page.tsx`
- Existing reusable primitives: `components/data-table/*` (do NOT modify)
- i18n messages: `messages/en.json`, `messages/ar.json`
- Global RBAC: `config/rbac.ts`
- Supabase server client: `lib/supabase/server.ts`
- Error helper: `utils/error-handler.ts`, `utils/CustomError.ts`, `utils/rbac-handler.ts` (`requireRole`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold the module folder + i18n keys + route. No logic yet.

- [ ] T001 Create module folders: `modules/admin-users/`, `modules/admin-users/types/`, `modules/admin-users/components/`, `modules/admin-users/admin-users-page/`, `modules/admin-users/admin-users-page/components/users-table/hooks/`, and empty `index.ts` barrel files at each folder root.
- [ ] T002 Create the route wrapper file `app/[locale]/dashboard/users/page.tsx` that imports `AdminUsersPage` from `@/modules/admin-users/admin-users-page` and renders `<AdminUsersPage {...props} />` with async `params` typed as `Promise<{ locale: string }>` per CLAUDE.md best practices. Call `setRequestLocale(locale)`.
- [ ] T003 [P] Add i18n namespace `AdminUsers` to `messages/en.json` with keys: `pageTitle`, `pageDescription`, `columns.avatar`, `columns.name`, `columns.role`, `columns.status`, `columns.verified`, `columns.joined`, `columns.lastActive`, `columns.actions`, `roles.registered`, `roles.verified_seller`, `roles.moderator`, `roles.admin`, `status.active`, `status.banned`, `verified.yes`, `verified.no`, `search.placeholder`, `filters.role`, `filters.status`, `filters.reset`, `filters.columns`, `rowActions.trigger`, `rowActions.changeRole`, `rowActions.ban`, `rowActions.unban`, `dialogs.changeRole.title`, `dialogs.changeRole.confirm`, `dialogs.changeRole.cancel`, `dialogs.ban.title`, `dialogs.ban.reasonLabel`, `dialogs.ban.reasonPlaceholder`, `dialogs.ban.submit`, `dialogs.ban.cancel`, `dialogs.unban.title`, `dialogs.unban.submit`, `dialogs.unban.cancel`, `bulk.selectedCount`, `bulk.changeRole`, `bulk.ban`, `bulk.clear`, `bulk.confirm.changeRole`, `bulk.confirm.ban`, `toast.role.success`, `toast.role.error`, `toast.ban.success`, `toast.ban.error`, `toast.unban.success`, `toast.unban.error`, `toast.bulk.summary`, `empty.title`, `empty.description`, `error.title`, `error.retry`.
- [ ] T004 [P] Mirror all keys from T003 in `messages/ar.json` with Arabic translations.
- [ ] T005 [P] Register the new protected path in `config/rbac.ts` by adding `'/dashboard/users': { allowedRoles: ['admin'] }` and `'/dashboard/users/*': { allowedRoles: ['admin'] }` to `PROTECTED_ROUTES` (admin-only, stricter than `/dashboard/*`).

**Checkpoint**: Route returns a placeholder; module skeleton exists.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Types + server action wrappers + default constants. Nothing below can proceed without these.

- [ ] T006 [P] Write `modules/admin-users/types/index.ts` exporting exactly: `AdminUser`, `SortColumn`, `SortDirection`, `AdminUserListInput`, `AdminUserListResult`, `UsersTableState`, `ChangeRoleInput`, `BanUserInput`, `UnbanUserInput`, `BulkChangeRoleInput`, `BulkBanInput`, and re-export `UserRole` from `@/config/rbac`. Shapes must match `data-model.md` exactly.
- [ ] T007 Write `modules/admin-users/queries.ts` exporting five async functions that take a Supabase server client and typed inputs and call `supabase.rpc(...)` for: `listAdminUsersRpc`, `changeUserRoleRpc`, `banUserRpc`, `unbanUserRpc`. Return raw `{ data, error }`; throw a `CustomError` (code from RPC `HINT`, message from `error.message`) when `error` is truthy. No business logic; this file is the thin DB boundary.
- [ ] T008 Write `modules/admin-users/actions.ts`. Export server actions wrapped with `errorHandler()` from `@/utils/error-handler`:
  - `listAdminUsersAction(input)` — validate with `AdminUserListInputSchema` (zod), call `requireRole(['admin'])`, map UI `statusFilter` (`'active'|'banned'|'all'`) straight through, invoke `listAdminUsersRpc`, return `{ totalCount, items, pageIndex, pageSize }`.
  - `changeUserRoleAction(input)` — validate, `requireRole(['admin'])`, invoke RPC.
  - `banUserAction(input)` — validate `{ targetUserId, reason }` with reason 1–500 trimmed.
  - `unbanUserAction(input)` — validate `{ targetUserId }`.
  - `bulkChangeRoleAction(input)` — validate arrays ≤ 100, filter out current admin's id (fetch via `createClient().auth.getUser()`), run `Promise.allSettled` with a local concurrency cap of 10 using a small helper `runWithConcurrency<T>(items, limit, fn)` defined at the bottom of this file. Return `{ successful: string[], failed: Array<{ userId, code, message }> }`.
  - `bulkBanAction(input)` — same concurrency pattern with shared `reason`.
  All action return values must follow the `{ success, data?, message?, errors? }` contract from `errorHandler()`.
- [ ] T009 [P] Create `modules/admin-users/admin-users-page/components/users-table/constants.ts` exporting:
  - `DEFAULT_PAGE_SIZE = 20`
  - `PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const`
  - `DEFAULT_SORT: { column: 'created_at'; direction: 'desc' }`
  - `ROLE_OPTIONS` — array of `{ value: UserRole, labelKey: string, icon, className }` matching the four roles and the color scheme (registered=gray, verified_seller=blue, moderator=amber, admin=red).
  - `STATUS_OPTIONS` — `[{ value: 'active', labelKey, className: 'bg-green...' }, { value: 'banned', labelKey, className: 'bg-red...' }]`.
  - `SORT_COLUMN_MAP` — maps TanStack column id to RPC `SortColumn` value.
  - `SEARCH_DEBOUNCE_MS = 300`.

**Checkpoint**: Types + server actions + constants compile. `npm run check` passes.

---

## Phase 3: User Story 1 — Browse and Find Users (Priority: P1) 🎯 MVP

**Goal**: Admin opens `/dashboard/users` and sees a server-paginated, sortable, filterable, searchable table with URL-synced state.

**Independent Test**: Run `quickstart.md §1–2` — access control + browse/search/filter/sort/share URL + empty state + skeletons.

### Implementation

- [ ] T010 [US1] Write `modules/admin-users/components/user-avatar-cell/UserAvatarCell.tsx` — server-safe client component (no `'use client'` needed) that takes `{ user: AdminUser }` and renders shadcn `<Avatar>` with `AvatarImage src={avatar_url}` and `AvatarFallback` = initials from first_name+last_name. Fixed size 32×32, `min-width` reserved. Add `index.ts` barrel.
- [ ] T011 [P] [US1] Write `modules/admin-users/components/role-badge/constants.ts` (role → `{ labelKey, className }`) and `RoleBadge.tsx` that takes `{ role: UserRole }`, looks up constants, renders shadcn `<Badge>` with translated label via `useTranslations('AdminUsers')` + `aria-label` = `Role: {label}`. Add barrel.
- [ ] T012 [P] [US1] Write `modules/admin-users/components/status-badge/constants.ts` + `StatusBadge.tsx` taking `{ isActive: boolean }`. Active = green, Banned = red. Same a11y pattern.
- [ ] T013 [P] [US1] Write `components/relative-date/RelativeDate.tsx` (new global, reusable): a client component that takes `{ timestamp: string | null; className?: string }`, renders `<time dateTime={timestamp}>{formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale })}</time>`; locale chosen via `useLocale()` → map `'ar'→arSA`, else `enUS`. When `timestamp` is null render `—`. Add `title` attribute with full ISO for hover tooltip. Reserve `min-width: 6rem` to prevent CLS.
- [ ] T014 [US1] Write `modules/admin-users/components/users-table-columns/columns.tsx`. Export `getUsersTableColumns(currentAdminUserId: string): ColumnDef<AdminUser>[]` returning, in order:
  1. `select` column — uses shadcn `<Checkbox>` in header (select-all for current page) and cell. `enableSorting: false`, `enableHiding: false`.
  2. `avatar` column — renders `<UserAvatarCell>`. `enableSorting: false`, `enableHiding: false`.
  3. `name` column — accessor returns `${first_name} ${last_name}`, header uses `<DataTableColumnHeader>` with `column.id='name'`, sortable.
  4. `role` column — cell renders `<RoleBadge>`. Sortable via RPC `role`. `meta: { facetedOptions: ROLE_OPTIONS }`.
  5. `status` column — accessor `is_active`, cell renders `<StatusBadge>`. Sortable. `meta: { facetedOptions: STATUS_OPTIONS }`.
  6. `is_verified` column — cell renders `<CircleCheck>` or `<CircleX>` with `aria-label`. Sortable. Default hidden? No — visible.
  7. `created_at` column — cell renders `<RelativeDate>`. Sortable.
  8. `last_activity_at` column — cell renders `<RelativeDate>`. Sortable.
  9. `actions` column — cell renders `<UsersRowActions row={row.original} isSelf={row.original.user_id === currentAdminUserId} />`. `enableSorting: false`, `enableHiding: false`.
- [ ] T015 [US1] Write `modules/admin-users/admin-users-page/components/users-table/hooks/useUsersTableParams.ts` — custom hook returning URL-backed state + setters via `nuqs.useQueryStates`. Parsers:
  - `page`: `parseAsInteger.withDefault(0)`
  - `size`: `parseAsInteger.withDefault(20)` (validated in hook against PAGE_SIZE_OPTIONS; fallback 20 on invalid)
  - `sort`: `parseAsStringEnum([...SortColumn values]).withDefault('created_at')`
  - `dir`: `parseAsStringEnum(['asc','desc']).withDefault('desc')`
  - `q`: `parseAsString.withDefault('')`
  - `role`: `parseAsArrayOf(parseAsStringEnum(ROLES)).withDefault([])`
  - `status`: `parseAsArrayOf(parseAsStringEnum(['active','banned'])).withDefault([])`
  - `cols`: `parseAsJson<Record<string, boolean>>().withDefault({})`
  All with `shallow: true`. Expose also `resetFilters()` that clears `q`, `role`, `status`, and sets `page=0`.
- [ ] T016 [US1] Write `modules/admin-users/admin-users-page/components/users-table/hooks/useUsersTable.ts` — `'use client'` hook that:
  - Takes `{ initialData: AdminUserListResult; currentAdminUserId: string }`.
  - Reads URL params via `useUsersTableParams`.
  - Manages local state: `data: AdminUserListResult`, `isLoading: boolean`, `error: string | null`, `rowSelection: Record<string, boolean>`.
  - Exposes `fetchData()` that builds `AdminUserListInput` from URL (map `statusFilter` UI array → RPC scalar per `data-model.md`), calls `listAdminUsersAction`, handles abort via a ref-held `AbortController` re-created each call, sets data or error.
  - On URL param change (excluding `cols`) → calls `fetchData()` inside a `useEffect`. Uses a stringified dep key to avoid duplicate fetches.
  - Builds the TanStack `table` with `useReactTable`: `data=data.items`, `columns=getUsersTableColumns(currentAdminUserId)`, `manualPagination: true`, `manualSorting: true`, `manualFiltering: true`, `pageCount = Math.ceil(data.totalCount / pageSize)`, `state = { pagination, sorting, columnVisibility, rowSelection }`, and matching `onPaginationChange`/`onSortingChange`/`onColumnVisibilityChange` callbacks that write back to URL params (and clear `rowSelection` on pagination/sort/filter change per FR-025).
  - Returns `{ table, data, isLoading, error, refetch: fetchData, resetFilters }`.
- [ ] T017 [US1] Write `modules/admin-users/components/users-table-toolbar/hooks/useUsersTableToolbar.ts` — `'use client'` hook that:
  - Takes `table` + the URL setters + `resetFilters`.
  - Owns a local `searchInput: string` synced from URL `q` on mount.
  - Debounces `searchInput` via a local `useEffect` with `SEARCH_DEBOUNCE_MS`. On debounced change: `setSearchParam(value)` and `setPage(0)`.
  - Exposes `isFiltered = q || role.length || status.length` for the Reset button visibility.
- [ ] T018 [US1] Write `modules/admin-users/components/users-table-toolbar/UsersTableToolbar.tsx` — `'use client'`. Renders (left-to-right):
  - `<Input>` bound to `searchInput` with placeholder from `AdminUsers.search.placeholder`, `aria-label`.
  - `<DataTableFacetedFilter column={table.getColumn('role')!} title={t('filters.role')} options={ROLE_OPTIONS}>` from `components/data-table`.
  - Same for `status` with `STATUS_OPTIONS`.
  - `{isFiltered && <Button variant="ghost" onClick={resetFilters}>{t('filters.reset')} <X /></Button>}`.
  - `<DataTableViewOptions table={table} />` pushed to the right with `className="ms-auto"`.
- [ ] T019 [US1] Write `modules/admin-users/admin-users-page/components/users-table/UsersTable.tsx` — `'use client'`. Takes `{ initialData, currentAdminUserId }`. Uses `useUsersTable`. Layout:
  - `<UsersTableToolbar ...>`
  - Container with `overflow-x-auto`:
    - If `error`: render inline alert with retry button.
    - Else render `<DataTable table={table} />` (the existing primitive, which already handles skeleton/empty state if passed `isLoading`/`renderEmptyState`). Pass `isLoading`, skeleton row count = `pageSize`, empty state = translated label + Reset filters button.
  - `<DataTablePagination table={table} pageSizeOptions={PAGE_SIZE_OPTIONS} />`.
  - `<BulkActionBar table={table} currentAdminUserId={currentAdminUserId} onAfterBulk={refetch} />` rendered only when selection non-empty (stub for US4 — safe to no-op until T031 ships).
- [ ] T020 [US1] Write `modules/admin-users/admin-users-page/AdminUsersPage.tsx` — Server Component (no `'use client'`):
  - Async `({ params, searchParams })`. `params: Promise<{locale}>`, `searchParams: Promise<Record<string,string|string[]>>`.
  - `await setRequestLocale(locale)`.
  - `await requireRole(['admin'])` — if not admin, `redirect('/dashboard')`.
  - Read URL params and build `AdminUserListInput` (invalid params fall back to defaults silently).
  - `const initial = await listAdminUsersAction(input)` — on failure, render a fallback error UI.
  - Resolve `currentAdminUserId` via `createClient().auth.getUser()`.
  - Render `<h1>` + `<p>` (i18n) + `<UsersTable initialData={initial.data} currentAdminUserId={currentAdminUserId} />`.
- [ ] T021 [US1] Implement the row-actions stub `modules/admin-users/components/users-row-actions/UsersRowActions.tsx` as a `'use client'` component that for US1 renders a disabled `<DropdownMenu>` trigger only (no items). This keeps column shape stable; later stories enable items.

**Checkpoint**: Navigate to `/en/dashboard/users` as admin → see paginated, sortable, filterable, searchable table with URL state. Moderator/registered users are redirected.

---

## Phase 4: User Story 2 — Change a User's Role (Priority: P2)

**Goal**: Per-row role change with confirmation; self-row disabled.

**Independent Test**: `quickstart.md §3`.

- [ ] T022 [US2] Write `modules/admin-users/components/change-role-dialog/constants.ts` exporting `ChangeRoleSchema = z.object({ newRole: z.enum(ROLES) })`.
- [ ] T023 [US2] Write `modules/admin-users/components/change-role-dialog/ChangeRoleDialog.tsx` — `'use client'` controlled via `{ open, onOpenChange, user, currentRole, onConfirmed }`. Uses shadcn `<AlertDialog>`. Body includes a `<Select>` of the four roles with current one marked; footer `Cancel` / `Confirm`. On confirm: call `changeUserRoleAction({ targetUserId: user.user_id, newRole })`, on success call `onConfirmed()` (triggers refetch) + `toast.success(t('toast.role.success'))`, on failure `toast.error(message)`. Disable the currently-selected role option.
- [ ] T024 [US2] Update `modules/admin-users/components/users-row-actions/UsersRowActions.tsx` to now include a "Change Role" submenu item that opens `ChangeRoleDialog` pre-filled with `currentRole`. If `isSelf`, disable the entire menu trigger (or show only a disabled "Change Role" row with tooltip). Pass `onConfirmed` up via a `useUsersRowActions` hook that accepts a callback from the parent.
- [ ] T025 [US2] Pipe the row-actions callback through `UsersTable.tsx` so a successful mutation refetches the current page via the `refetch` returned from `useUsersTable`.

**Checkpoint**: Role changes work; self-row actions are disabled; optimistic UI is NOT used (refetch is the source of truth).

---

## Phase 5: User Story 3 — Ban / Unban (Priority: P2)

**Goal**: Ban with reason + unban with confirm.

**Independent Test**: `quickstart.md §4`.

- [ ] T026 [US3] Write `modules/admin-users/components/ban-user-dialog/constants.ts` exporting `BanReasonFormSchema = z.object({ reason: z.string().trim().min(1).max(500) })` and `BAN_REASON_MAX = 500`.
- [ ] T027 [US3] Write `modules/admin-users/components/ban-user-dialog/BanUserDialog.tsx` — `'use client'`. Props `{ open, onOpenChange, user, onConfirmed }`. Uses react-hook-form with `zodResolver(BanReasonFormSchema)`. Renders shadcn `<Dialog>` with title, a `<TextField>` (custom project component) bound to `reason`, character counter `N/500`, and `Submit`/`Cancel` buttons. On submit: `banUserAction({ targetUserId: user.user_id, reason })`; success → `onConfirmed()` + toast; failure → set form error on `reason` field or toast based on error code.
- [ ] T028 [US3] Write `modules/admin-users/components/unban-user-dialog/UnbanUserDialog.tsx` — `'use client'`. Shadcn `<AlertDialog>` with confirm/cancel; on confirm call `unbanUserAction({ targetUserId })`; success → `onConfirmed()` + toast.
- [ ] T029 [US3] Update `UsersRowActions.tsx` to add "Ban User" (if `is_active`) or "Unban User" (if banned) items wired to the two dialogs. Disable both when `isSelf`. When banned, render a small tooltip on the row showing `ban_reason` on the status badge.

**Checkpoint**: Ban requires reason; unban requires only confirm; self-row disabled.

---

## Phase 6: User Story 4 — Bulk Actions (Priority: P3)

**Goal**: Multi-row selection + floating bar + bulk role + bulk ban with shared reason.

**Independent Test**: `quickstart.md §5`.

- [ ] T030 [US4] Write `modules/admin-users/components/bulk-action-bar/hooks/useBulkActionBar.ts` — `'use client'`. Accepts `{ table, currentAdminUserId, refetch }`. Derives `selectedUserIds` from `table.getState().rowSelection` filtered against the current `data.items`, excluding `currentAdminUserId`. Exposes `runBulkRoleChange(role)`, `runBulkBan(reason)` each calling the corresponding bulk action, surfacing a summary toast `t('toast.bulk.summary', { ok: successful.length, total: selectedUserIds.length, failed: failed.length })`, then `table.resetRowSelection()` and `refetch()`.
- [ ] T031 [US4] Write `modules/admin-users/components/bulk-action-bar/BulkActionBar.tsx` — `'use client'` floating bar (position `sticky bottom-4` + centered) showing count, `Bulk change role` (opens small AlertDialog with role Select + confirm), `Bulk ban` (opens Dialog with shared-reason form using the same `BanReasonFormSchema`), and `Clear` button. Hidden when no rows selected. Focus-trap inside dialogs.
- [ ] T032 [US4] Replace the stub `<BulkActionBar>` usage in `UsersTable.tsx` (from T019) with the real component.
- [ ] T033 [US4] Update `useUsersTable.ts` so that on any URL param change (pagination, sort, filters, search) `table.resetRowSelection()` runs (FR-025).

**Checkpoint**: Bulk works with concurrency cap 10; own row auto-excluded; selection clears on nav; partial failures reported.

---

## Phase 7: User Story 5 — Customize the View (Priority: P3)

**Goal**: Column visibility toggle persisted in URL; page-size selector; reset-filters.

**Independent Test**: `quickstart.md §6`.

- [ ] T034 [US5] Verify and, if missing, ensure `DataTableViewOptions` is rendered inside `UsersTableToolbar` (done in T018) and that `columnVisibility` state is persisted via nuqs `cols` param (done in T015/T016). Add unit-level manual test via quickstart; patch any gaps.
- [ ] T035 [US5] Ensure `DataTablePagination` exposes `PAGE_SIZE_OPTIONS` via prop; if the shared primitive doesn't accept a custom options list, pass the options prop already supported, or (if not supported) render a small `<Select>` adjacent to the pagination showing `PAGE_SIZE_OPTIONS` and wiring to `setPageSize` + `setPage(0)`.
- [ ] T036 [US5] Confirm the "Reset filters" button in `UsersTableToolbar` does NOT reset `columnVisibility` (per spec: reset clears filters only). Add a brief code comment explaining the scope.

**Checkpoint**: All five user stories functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T037 [P] Run `npm run check` and fix any format/lint/type errors.
- [ ] T038 [P] Add Arabic translations review: open the page with `locale='ar'`, verify RTL layout for toolbar, pagination, dialogs.
- [ ] T039 [P] Accessibility sweep: keyboard traversal through header sort menus, filter popovers, dialogs, row actions; verify `aria-label`s on icon-only buttons; verify focus trap in dialogs; run axe browser extension and fix any critical issues (SC-007).
- [ ] T040 [P] Performance check: open `/en/dashboard/users` on a seeded dataset, confirm first paint renders server-rendered rows (no initial spinner) and filter change returns in < 1s p95 (SC-003). If slow, verify RPC returns `total_count + items` in one call and no N+1 fetches occur.
- [ ] T041 Run quickstart.md end-to-end (all 8 sections) and check off all acceptance scenarios across US1–US5.
- [ ] T042 Stage-by-stage commit review: confirm each user story ships as its own Conventional Commit per constitution III.

---

## Dependencies & Execution Order

### Phase dependencies

- Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1 MVP) → Phases 4–7 (US2–US5 can parallelize after US1 scaffolding lands) → Phase 8 (Polish).

### Within a story

- Dialog constants before dialog UI before row-actions wiring.
- Hook before component that consumes it.
- `columns.tsx` depends on all three cell components (avatar, role badge, status badge, relative date).

### Parallel opportunities

- T003/T004/T005 — independent files.
- T006/T007/T009 — independent files (T007 imports types from T006; order T006 → T007).
- T011/T012/T013 — independent components.
- Within US2/US3/US5 — each row-actions dialog pair is mostly independent after columns exist.
- Across stories: once US1 (T010–T021) is merged, US2–US5 can proceed in parallel by different developers.

---

## Parallel Example: User Story 1 kickoff

```bash
# After Phase 2 completes, launch in parallel:
Task: "Write modules/admin-users/components/role-badge/{constants.ts,RoleBadge.tsx,index.ts}"
Task: "Write modules/admin-users/components/status-badge/{constants.ts,StatusBadge.tsx,index.ts}"
Task: "Write components/relative-date/RelativeDate.tsx"
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Phase 1 Setup → Phase 2 Foundational → Phase 3 US1. Deploy/demo read-only admin table with URL-synced state. Stop & validate via quickstart §1–2.

### Incremental delivery

2. Add US2 (role changes) → validate §3.
3. Add US3 (ban/unban) → validate §4.
4. Add US4 (bulk) → validate §5.
5. Add US5 (view customization polish) → validate §6.
6. Polish (§7–8).

### Notes for executing LLM

- One file per task. Do not batch unrelated edits.
- After each task: `npm run check` and run the dev server briefly to spot runtime errors.
- Each user-story phase ends with a Conventional Commit like `feat(admin-users): US1 server-driven users table`.
- When a task says "write" → it's a new file; "update" → edit an existing file.
- Never modify `components/data-table/*` primitives — consume them.
- Never duplicate `public.users` shape — import `AdminUser` from `modules/admin-users/types`.
- All server actions must pass through `errorHandler()`; never `try/catch` server errors inside the action body.
- Toast messages come from `useTranslations('AdminUsers')`; no hard-coded English strings in components.
