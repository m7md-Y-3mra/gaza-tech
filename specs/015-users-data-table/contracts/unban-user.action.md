# Contract: `unbanUserAction`

Wraps Supabase RPC `admin_unban_user`.

## Location

`modules/admin-users/actions.ts`.

## Input

```ts
UnbanUserInputSchema = z.object({
  targetUserId: z.string().uuid(),
});
```

## Output

Success: `{ success: true }`.

Failure codes mirror the ban action (minus `ALREADY_BANNED`, plus `NOT_BANNED` which shows a converged-state toast and refetches).

## Behavior

1. `requireRole(['admin'])`.
2. RPC.
3. Caller refetches + closes confirmation + success toast.
