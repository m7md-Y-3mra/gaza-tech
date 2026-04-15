# Phase 1 — Client Data Model: User Management Data Table (015)

> This feature does **not** introduce new database tables, columns, or indexes. All database shapes are defined and owned by 013-admin-user-rpcs (`public.users`, `public.users_with_email`, admin RPCs). This document defines the **client-side TypeScript types** that flow between the RPC wrappers, the page, and the table components.

## Types (all under `modules/admin-users/types/index.ts`)

### `UserRole`

```ts
import type { UserRole } from '@/config/rbac'; // re-export, do not duplicate
// 'registered' | 'verified_seller' | 'moderator' | 'admin'
```

### `AdminUser`

Shape of each row returned by `admin_list_users`. Mirrors the `items[]` element in contract `specs/013-admin-user-rpcs/contracts/admin_list_users.md`.

```ts
export interface AdminUser {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  avatar_url: string | null;
  user_role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  ban_reason: string | null; // only set when is_active === false
  banned_at: string | null; // ISO timestamp
  created_at: string; // ISO timestamp
  last_activity_at: string | null; // ISO timestamp
}
```

### `SortColumn`

Must match the allow-list enforced by `admin_list_users` (FR-014 / contract 013).

```ts
export type SortColumn =
  | 'name'
  | 'role'
  | 'status'
  | 'is_verified'
  | 'created_at'
  | 'last_activity_at';

export type SortDirection = 'asc' | 'desc';
```

### `AdminUserListInput`

Normalized input to the server action. `statusFilter` uses the RPC's scalar contract; UI multi-select is mapped before this layer.

```ts
export interface AdminUserListInput {
  pageIndex: number; // 0-based
  pageSize: number; // 10 | 20 | 50 | 100
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  search: string | null; // trimmed or null
  roleFilter: UserRole[] | null; // null/empty → all
  statusFilter: 'active' | 'banned' | 'all';
}
```

### `AdminUserListResult`

```ts
export interface AdminUserListResult {
  totalCount: number;
  items: AdminUser[];
  pageIndex: number;
  pageSize: number;
}
```

### `UsersTableState` (URL-backed)

All parsed via `nuqs`. Defaults live in `modules/admin-users/admin-users-page/components/users-table/constants.ts`.

```ts
export interface UsersTableState {
  pageIndex: number; // default 0
  pageSize: 10 | 20 | 50 | 100; // default 20
  sortColumn: SortColumn; // default 'created_at'
  sortDirection: SortDirection; // default 'desc'
  search: string; // default ''
  roleFilter: UserRole[]; // default []
  statusFilter: Array<'active' | 'banned'>; // default []
  columnVisibility: Record<string, boolean>; // default {}
}
```

URL keys (short form, kept terse to avoid oversize links):

| State field        | URL key  |
| ------------------ | -------- |
| `pageIndex`        | `page`   |
| `pageSize`         | `size`   |
| `sortColumn`       | `sort`   |
| `sortDirection`    | `dir`    |
| `search`           | `q`      |
| `roleFilter`       | `role`   |
| `statusFilter`     | `status` |
| `columnVisibility` | `cols`   |

### UI → RPC mapping

| UI `statusFilter` value | RPC `p_status_filter` |
| ----------------------- | --------------------- |
| `[]`                    | `'all'`               |
| `['active','banned']`   | `'all'`               |
| `['active']`            | `'active'`            |
| `['banned']`            | `'banned'`            |

### Row mutation types

```ts
export interface ChangeRoleInput {
  targetUserId: string;
  newRole: UserRole;
}

export interface BanUserInput {
  targetUserId: string;
  reason: string; // trimmed, 1..500
}

export interface UnbanUserInput {
  targetUserId: string;
}

export interface BulkChangeRoleInput {
  targetUserIds: string[]; // acting admin's id filtered out before this call
  newRole: UserRole;
}

export interface BulkBanInput {
  targetUserIds: string[];
  reason: string; // shared, 1..500
}
```

### Zod schemas (referenced, not duplicated here)

- `AdminUserListInputSchema` in `modules/admin-users/actions.ts`
- `BanReasonFormSchema` in `modules/admin-users/components/ban-user-dialog/constants.ts`
- `ChangeRoleSchema` in `modules/admin-users/components/change-role-dialog/constants.ts` (or inline — small)

## Entities — lifecycle transitions touched by this feature

- `user_role`: any → any (through `admin_change_user_role` RPC). Self-change forbidden (FR-018).
- `is_active` + `ban_reason` + `banned_at`:
  - `true, null, null` → `false, <reason>, now()` via `admin_ban_user`.
  - `false, <reason>, <ts>` → `true, null, null` via `admin_unban_user`.
  - Self-ban forbidden (FR-018).

No new validation rules beyond what the RPCs already enforce. The UI merely echoes and labels them for user-facing errors.
