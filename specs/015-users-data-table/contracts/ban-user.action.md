# Contract: `banUserAction`

Wraps Supabase RPC `admin_ban_user`.

## Location

`modules/admin-users/actions.ts`.

## Input

```ts
BanUserInputSchema = z.object({
  targetUserId: z.string().uuid(),
  reason:       z.string().trim().min(1).max(500),
});
```

## Output

Success: `{ success: true }`.

Failure codes:

| Code                | UX                                                  |
| ------------------- | --------------------------------------------------- |
| `NOT_AUTHENTICATED` | Logout + redirect.                                  |
| `NOT_ADMIN`         | Toast + redirect.                                   |
| `SELF_ACTION`       | Toast "You can't ban yourself." (UI also blocks).   |
| `USER_NOT_FOUND`    | Toast "User no longer exists." Refetch.             |
| `ALREADY_BANNED`    | Toast informational + refetch (state converged).    |
| `VALIDATION`        | Dialog inline field error on `reason`.              |
| `UNEXPECTED`        | Toast + retry.                                      |

## Behavior

1. `requireRole(['admin'])`.
2. Validate input (zod).
3. RPC.
4. Caller refetches + closes dialog + shows success toast.
