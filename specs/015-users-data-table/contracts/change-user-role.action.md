# Contract: `changeUserRoleAction`

Wraps Supabase RPC `admin_change_user_role`.

## Location

`modules/admin-users/actions.ts`.

## Input

```ts
ChangeRoleInputSchema = z.object({
  targetUserId: z.string().uuid(),
  newRole:      z.enum(['registered','verified_seller','moderator','admin']),
});
```

## Output

Success: `{ success: true }`.
Failure codes surfaced to UI:

| Code                | UX                                                            |
| ------------------- | ------------------------------------------------------------- |
| `NOT_AUTHENTICATED` | Logout + redirect.                                            |
| `NOT_ADMIN`         | Toast "Not authorized"; page redirects out of admin section.  |
| `SELF_ACTION`       | Toast "You can't change your own role." (defense; UI blocks). |
| `USER_NOT_FOUND`    | Toast "User no longer exists." Refetch table.                 |
| `VALIDATION`        | Dialog inline error.                                          |
| `UNEXPECTED`        | Toast with generic message + retry.                           |

## Behavior

1. `requireRole(['admin'])`.
2. Parse input.
3. RPC call.
4. On success, caller (`UsersTable`) refetches the current page and clears selection if applicable.
