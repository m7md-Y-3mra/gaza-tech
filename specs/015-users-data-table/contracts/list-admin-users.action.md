# Contract: `listAdminUsersAction`

Server action wrapper around Supabase RPC `admin_list_users` (defined by 013-admin-user-rpcs). This feature **consumes** that RPC and is therefore bound by its contract. This document captures only the frontend action shape.

## Location

`modules/admin-users/actions.ts` — exported as `listAdminUsersAction`.

## Input

Zod-validated. All fields required (callers supply defaults at the URL layer).

```ts
AdminUserListInputSchema = z.object({
  pageIndex:     z.number().int().min(0),
  pageSize:      z.union([z.literal(10), z.literal(20), z.literal(50), z.literal(100)]),
  sortColumn:    z.enum(['name','role','status','is_verified','created_at','last_activity_at']),
  sortDirection: z.enum(['asc','desc']),
  search:        z.string().trim().min(0).nullable(),
  roleFilter:    z.array(z.enum(['registered','verified_seller','moderator','admin'])).nullable(),
  statusFilter:  z.enum(['active','banned','all']),
});
```

## Output (success)

```ts
{ success: true, data: AdminUserListResult }
```

Where `AdminUserListResult` is `{ totalCount, items, pageIndex, pageSize }` from `data-model.md`.

## Output (failure)

Produced by `errorHandler()`; possible codes forwarded from RPC:

| Code                | Cause                              | UX                              |
| ------------------- | ---------------------------------- | ------------------------------- |
| `NOT_AUTHENTICATED` | No session                         | Redirect to login               |
| `NOT_ADMIN`         | Session exists but not admin       | Redirect out of `/dashboard/*`  |
| `VALIDATION`        | Bad inputs (shouldn't happen in UI) | Inline error + reset to defaults |
| `UNEXPECTED`        | Other                               | Toast + inline retry button     |

## Behavior

1. `requireRole(['admin'])` — defense-in-depth in addition to middleware.
2. `AdminUserListInputSchema.parse(input)`.
3. Map UI status multi-select to RPC scalar per `data-model.md` table (caller supplies already-mapped `statusFilter`).
4. `supabase.rpc('admin_list_users', …)`.
5. Return `{ totalCount, items, pageIndex, pageSize }`.

## Consumers

- `AdminUsersPage` (server) — initial fetch with URL-derived params.
- `UsersTable` (client) — refetch on state change, on mutation success.
