# User Role Management — Spec-Driven Development Plan

> **Project:** GazaTechApp  
> **Feature:** User Role Management in Admin Dashboard  
> **Stack:** Supabase (PostgreSQL) + Next.js (React)  
> **Date:** April 14, 2026  
> **Roles:** `registered` · `verified_seller` · `moderator` · `admin`  
> **Table Library:** TanStack Table (React Table v8) + shadcn/ui

---

## Reference Documentation

> **shadcn/ui Data Table Guide (TanStack Table):**  
> [https://ui.shadcn.com/docs/components/radix/data-table](https://ui.shadcn.com/docs/components/radix/data-table)
>
> This guide covers: column definitions, `<DataTable />` component setup, pagination, sorting, filtering, column visibility, row selection, and row actions — all using `@tanstack/react-table` with shadcn/ui `<Table />` components.

---

## Phase 0 — Research & Pre-Implementation Gates

- [ ] Verify existing schema supports all four roles
- [ ] Confirm `is_active`, `ban_reason` columns exist on `users` table
- [ ] Confirm `is_admin()` and `is_moderator_or_admin()` helper functions are deployed
- [ ] Confirm RLS policies allow admin SELECT/UPDATE on `users`
- [ ] Decide ban enforcement strategy (middleware vs auth hook)

---

## Phase 1 — Database Layer (Secure RPCs)

- [ ] Create RPC: `admin_change_user_role(target_user_id, new_role)` — validates admin, prevents self-change, updates role
- [ ] Create RPC: `admin_ban_user(target_user_id, ban_reason)` — sets `is_active = false`, stores reason, prevents self-ban
- [ ] Create RPC: `admin_unban_user(target_user_id)` — sets `is_active = true`, clears ban fields
- [ ] Create RPC: `admin_edit_user(target_user_id, updates)` — validates allowed fields, applies changes
- [ ] Create RPC: `admin_list_users(page, page_size, sort_column, sort_direction, search, role_filter, status_filter)` — returns paginated, sorted, filtered users with total count for server-side table operations
- [ ] Test all RPCs manually via SQL

---

## Phase 2 — Ban Enforcement (Auth Layer)

- [ ] Add Next.js middleware to check `is_active` on authenticated routes
- [ ] Redirect banned users to `/banned` page and sign them out
- [ ] Add login-time ban check in auth callback
- [ ] Create `/banned` page showing ban reason

---

## Phase 3 — Install & Configure TanStack Table + shadcn/ui

- [ ] Install dependencies: `@tanstack/react-table`
- [ ] Add shadcn/ui components: `table`, `button`, `input`, `dropdown-menu`, `select`, `checkbox`, `badge`, `dialog`, `sheet`, `toast` (sonner), `skeleton`, `tooltip`
- [ ] Create reusable `<DataTable />` generic component following the shadcn/ui data table guide
- [ ] Create reusable `<DataTablePagination />` component (page size selector, page navigation, row count display)
- [ ] Create reusable `<DataTableColumnHeader />` component (sortable headers with asc/desc/hide controls via dropdown)
- [ ] Create reusable `<DataTableToolbar />` component (search input, faceted filters, column visibility toggle, reset filters button)
- [ ] Create reusable `<DataTableFacetedFilter />` component (popover multi-select filter for role & status columns)
- [ ] Create reusable `<DataTableRowActions />` component (dropdown menu per row: view, edit role, ban/unban)
- [ ] Create reusable `<DataTableViewOptions />` component (column visibility toggle dropdown)

---

## Phase 4 — Frontend: User Management Data Table

### 4.1 — Column Definitions & Types

- [ ] Define `User` type matching the `users` table schema
- [ ] Define columns using `ColumnDef<User>[]`:
  - **Select column:** checkbox for row selection (`enableSorting: false`, `enableHiding: false`)
  - **Avatar:** custom cell renderer with `<Avatar />` (not sortable, not hideable)
  - **Name:** `first_name + last_name`, sortable, searchable
  - **Role:** `user_role` with `<Badge />` renderer (color-coded), sortable, faceted filterable
  - **Status:** `is_active` → Active/Banned with `<Badge />` renderer, sortable, faceted filterable
  - **Verified:** `is_verified` with icon renderer, sortable
  - **Joined:** `created_at` with relative date formatter, sortable
  - **Last Active:** `last_activity_at` with relative date formatter, sortable
  - **Actions:** `<DataTableRowActions />` dropdown (View Details, Change Role, Ban/Unban)

### 4.2 — Server-Side Pagination, Sorting & Filtering

- [ ] Configure `useReactTable` with `manualPagination: true`, `manualSorting: true`, `manualFiltering: true`
- [ ] Manage table state: `pagination` (`pageIndex`, `pageSize`), `sorting`, `columnFilters`, `columnVisibility`, `rowSelection`
- [ ] Sync table state with URL search params (using `nuqs` or `useSearchParams`) for shareable/bookmarkable table views
- [ ] Fetch data from `admin_list_users` RPC on every state change (pagination, sort, filter)
- [ ] Pass `pageCount` from server response to TanStack Table for correct pagination controls
- [ ] Show skeleton rows while data is loading
- [ ] Display "No results" empty state when filters return zero rows

### 4.3 — Toolbar & Filters

- [ ] Search input: debounced (300ms), filters by name server-side
- [ ] Role faceted filter: multi-select popover with options `registered`, `verified_seller`, `moderator`, `admin`
- [ ] Status faceted filter: multi-select popover with options `Active`, `Banned`
- [ ] Column visibility dropdown: toggle any column on/off
- [ ] "Reset filters" button: clears all active filters
- [ ] Show active filter count badges on filter buttons

### 4.4 — Row Selection & Bulk Actions

- [ ] Header checkbox for select all (current page)
- [ ] Individual row checkboxes
- [ ] Floating action bar appears when rows are selected showing: selected count, bulk role change, bulk ban
- [ ] Confirmation dialog before any bulk action
- [ ] Deselect all after bulk action completes

### 4.5 — Row Actions Dropdown

- [ ] Each row has a `...` (more) button opening a `<DropdownMenu />`
- [ ] Actions: "View Details", "Change Role →" (submenu with role options), "Ban User" / "Unban User"
- [ ] "Change Role" submenu shows all four roles with a check on the current one
- [ ] Selecting a new role opens confirmation dialog → calls `admin_change_user_role` RPC
- [ ] "Ban User" opens dialog with required reason textarea → calls `admin_ban_user` RPC
- [ ] "Unban User" opens confirmation dialog → calls `admin_unban_user` RPC
- [ ] Disable self-actions (current admin's own row)

---

## Phase 5 — Frontend: User Detail Sheet (Side Panel)

- [ ] Clicking "View Details" opens a `<Sheet />` (slide-over) from the right
- [ ] **Header:** avatar, full name, role badge, status badge
- [ ] **Profile Tab:** editable form for name, phone, social links, verified toggle → calls `admin_edit_user` RPC (sends only changed fields)
- [ ] **Role Tab:** current role + role change dropdown with confirmation modal → calls `admin_change_user_role`
- [ ] **Ban Tab:** ban button with reason textarea / unban button → calls `admin_ban_user` / `admin_unban_user`
- [ ] Toast notifications for success/error states
- [ ] Loading states during RPC calls

---

## Phase 6 — Testing & Polish

- [ ] Non-admin calling any RPC gets "Unauthorized"
- [ ] Non-admin accessing `/dashboard/admin/users` is redirected
- [ ] Admin cannot change own role or ban themselves
- [ ] Banned user cannot log in; existing session is terminated
- [ ] Invalid inputs (bad role, empty reason, non-existent user) return proper errors
- [ ] Server-side pagination returns correct `pageCount` and sliced data
- [ ] Sorting by any sortable column works correctly server-side
- [ ] Combined filters (search + role + status) work together server-side
- [ ] Column visibility persists during pagination/sorting
- [ ] Row selection clears on page change
- [ ] Bulk actions work on selected rows only
- [ ] URL search params reflect current table state (shareable links)
- [ ] Responsive layout (horizontal scroll on mobile)
- [ ] Skeleton loaders, toast notifications, confirmation dialogs
- [ ] Role badge colors: registered (gray), verified_seller (blue), moderator (amber), admin (red)
- [ ] Status badges: Active (green), Banned (red)

---

## Phase Dependency Graph

```
Phase 0: Research & Gates
    ↓
Phase 1: Database RPCs (includes new admin_list_users RPC)
    ↓
Phase 2: Ban Enforcement  ←── can run in parallel with Phase 3
    ↓
Phase 3: TanStack Table + shadcn/ui setup (reusable components)
    ↓
Phase 4: User Management Data Table (columns, server-side ops, toolbar, selection, actions)
    ↓
Phase 5: User Detail Sheet (side panel)
    ↓
Phase 6: Testing & Polish
```
