# Phase 0 — Research: User Management Data Table (015)

No `NEEDS CLARIFICATION` markers remained after `/speckit.clarify`. This document records the design decisions needed to resolve open technical choices for the admin users table.

---

## 1. URL state management

- **Decision**: Use `nuqs` (`useQueryStates`) with typed parsers for `pageIndex`, `pageSize`, `sortColumn`, `sortDirection`, `search`, `roleFilter` (array), `statusFilter` (array), `columnVisibility` (JSON). Apply `shallow: false` where SSR rehydration must see the latest URL (initial load only); `shallow: true` for subsequent in-page updates to avoid a full server round-trip on every keystroke.
- **Rationale**: Already a project dependency (v^2.8.8) and used elsewhere (profile community tab). It hand-crafts URL serialization, keeps state typed, and plays well with Next 16 App Router. Matches FR-013/FR-014.
- **Alternatives**: Raw `useSearchParams` + manual push/replace — too much boilerplate and fragile parsing. `@tanstack/react-table` built-in state + custom sync — duplicates work already done by nuqs.

## 2. Server-driven table state wiring

- **Decision**: Configure `useReactTable` with `manualPagination: true`, `manualSorting: true`, `manualFiltering: true`, and `pageCount = Math.ceil(totalCount / pageSize)`. Derive `sorting`, `columnFilters`, and `pagination` from nuqs parsers; on change, nuqs writes to URL and a server action refetches. Use `rowCount` from TanStack v8.14+ for the summary display.
- **Rationale**: Follows shadcn/ui's server-side pattern, required by FR-006/FR-007. Keeps the client lean.
- **Alternatives**: Client-side model fetched once — fails at 100k users and violates FR-006.

## 3. Initial data fetching

- **Decision**: Server component (`AdminUsersPage`) reads the URL search params, calls `listAdminUsersAction` with them, and passes `initialData` + `initialParams` to the client `UsersTable`. Subsequent fetches run in the client via the same server action (invoked through a thin `useTransition`-based hook).
- **Rationale**: Satisfies principle II (Server-First Rendering). Fast LCP — the first paint includes real rows, not a spinner. Skeletons cover only subsequent fetches.
- **Alternatives**: Fully client-side fetch with `useEffect` — breaks SSR and principle II.

## 4. Debounced search

- **Decision**: Local `useState` for the raw input value; debounce with 300ms using a small `useDebouncedValue` hook; when the debounced value changes, write it to nuqs (`search` param) and reset `pageIndex` to 0. Use `AbortController` to cancel inflight server-action requests on new keystrokes.
- **Rationale**: Meets FR-009. `AbortController` handles the "stale response" edge case.
- **Alternatives**: `nuqs` `debounce` option — exists but currently less flexible than a local debounce wrapper; we still need local state for the immediate input value.

## 5. Role & status faceted filters

- **Decision**: Use the existing `DataTableFacetedFilter` from `components/data-table/data-table-faceted-filter.tsx`. Options for role are all four `ROLES` from `config/rbac.ts`; options for status are `['active', 'banned']`. Multi-select is OR-within; combined filters are AND-across (server handles via `admin_list_users` input shape — role is `text[]`, status is a scalar).
- **Rationale**: Reuses the Phase 3 primitive. Server already supports array-typed role filter per contract 013-admin-user-rpcs/admin_list_users.
- **Caveat / bridge**: The 013 RPC takes `p_status_filter text` with values `active|banned|all`. To present multi-select OR semantics in UI, map `[]` or `['active','banned']` → `'all'`, `['active']` → `'active'`, `['banned']` → `'banned'`. This keeps the RPC contract unchanged while honoring the UI spec.
- **Alternatives**: Add a new RPC parameter taking `text[]` for status — unnecessary, only two possible values.

## 6. Relative dates

- **Decision**: `date-fns` `formatDistanceToNow` with locale from `next-intl` (`useLocale()` → `enUS` or `arSA`). Wrap in a small `<RelativeDate timestamp={...} />` component that renders a `<time dateTime=...>` element with absolute ISO in its `title` for tooltip on hover.
- **Rationale**: Accessibility (FR-032, machine-readable datetime), stable width by reserving `min-width` to avoid CLS, existing dep.
- **Alternatives**: `Intl.RelativeTimeFormat` directly — works but requires manual bucketing; `date-fns` is already in the project and does the bucketing for us.

## 7. Dialogs (Change Role, Ban, Unban, Bulk)

- **Decision**:
  - Change Role & Unban: `<AlertDialog />` (confirmation only, no form state).
  - Ban & Bulk Ban: `<Dialog />` with `react-hook-form` + `zod` (reason: trimmed, 1–500 chars per existing `ban_reason` column). One shared `BanReasonFormSchema` lives in `ban-user-dialog/constants.ts`.
  - Bulk Role: `<AlertDialog />` with an inline `<Select />` for the target role.
- **Rationale**: Matches constitution's form pattern (VI); confirmation-only actions don't need rhf.
- **Alternatives**: Single generic dialog — over-engineered for four slightly different flows.

## 8. Optimistic UI vs. refetch after mutation

- **Decision**: Refetch the current page after any successful mutation (single or bulk). Do not apply optimistic updates.
- **Rationale**: Row may leave the visible page after a status change (e.g., status filter active). Refetch is the simplest correct answer; 1s budget (SC-003) easily absorbs it. Also keeps `totalCount` accurate for partial-success summaries.
- **Alternatives**: Optimistic local patch + background refetch — adds edge cases (role change collapses a row out of the current filter, pagination offsets drift), not worth the complexity for an admin tool.

## 9. Bulk action execution

- **Decision**: Client iterates selected rows and calls single-row mutation server actions in parallel via `Promise.allSettled`. Collect successes/failures; show a single toast summary. Auto-exclude the acting admin's own user id before firing. Cap concurrency at 10 in-flight via a tiny semaphore helper (guards the DB under SC-005's 100-row ceiling).
- **Rationale**: Avoids introducing bulk RPCs (not defined in Phase 1 contracts); meets FR-022a/FR-024/FR-026. 100 rows × small RPCs × 10 parallel → well under 15s budget.
- **Alternatives**: A new bulk RPC — scope creep; out of this phase's surface per spec Assumptions.

## 10. Admin self-row detection

- **Decision**: Resolve `currentAdminUserId` once on the server side (`AdminUsersPage`) and pass it to the client. Columns and the bulk action bar compare against it to disable self-actions (FR-018, FR-024).
- **Rationale**: Avoids exposing any secret; fits module-first plumbing.
- **Alternatives**: Read session client-side — doubles network calls.

## 11. Column visibility persistence

- **Decision**: Persist column visibility in the URL as a compact bitmask-like JSON object only when it differs from defaults. When absent, defaults apply. Session-only per spec.
- **Rationale**: Matches FR-013 and the clarified assumption. No extra local storage; shareable URLs stay opt-in.

## 12. Route placement & access control

- **Decision**: `app/[locale]/dashboard/users/page.tsx`. Access gated by the existing RBAC route map in `config/rbac.ts` (`/dashboard/*` already requires `admin` or `moderator`). Add an extra `requireRole(['admin'])` guard inside `AdminUsersPage` to enforce admin-only (FR-029), redirecting moderators to `/dashboard`.
- **Rationale**: Defense in depth; matches existing pattern in `modules/verification-review`.

## 13. i18n

- **Decision**: Add translation keys under `AdminUsers.*` in `messages/en.json` and `messages/ar.json`. Use `next-intl` `useTranslations('AdminUsers')`. RTL already supported globally.
- **Rationale**: Consistent with all other modules in the codebase.

## 14. Responsive & mobile

- **Decision**: Wrap the table in an overflow-x container; pin the selection and actions columns visually unless viewport ≥ lg. Provide a `data-testid="users-table"` wrapper for QA hooks.
- **Rationale**: FR-033 with minimal complexity.

---

All decisions resolved. Proceed to Phase 1.
