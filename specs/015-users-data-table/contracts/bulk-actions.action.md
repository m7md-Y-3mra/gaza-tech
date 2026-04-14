# Contract: bulk actions (`bulkChangeRoleAction`, `bulkBanAction`)

No new RPCs. Each bulk action iterates targets and invokes the corresponding single-row action server-side via `Promise.allSettled` with concurrency 10.

## Location

`modules/admin-users/actions.ts`.

## Inputs

```ts
BulkChangeRoleInputSchema = z.object({
  targetUserIds: z.array(z.string().uuid()).min(1).max(100),
  newRole: z.enum(['registered', 'verified_seller', 'moderator', 'admin']),
});

BulkBanInputSchema = z.object({
  targetUserIds: z.array(z.string().uuid()).min(1).max(100),
  reason: z.string().trim().min(1).max(500),
});
```

## Output

```ts
{
  success: true,
  data: {
    successful: string[]; // user ids
    failed: Array<{ userId: string; code: string; message: string }>;
  }
}
```

Partial failures are **not** thrown. The caller maps this into a summary toast: "Updated N of M users. K failed." (FR-026). Full-failure case (0 successes) is still `success: true` from the wrapper's standpoint; UI surfaces the zero-success message and offers a retry focused on the failed ids.

## Behavior

1. `requireRole(['admin'])`.
2. Exclude the acting admin's own id from `targetUserIds` (FR-024) before the loop.
3. `Promise.allSettled` with a 10-concurrency semaphore.
4. Aggregate and return.
5. Caller clears selection + refetches current page.

## Constraints

- `targetUserIds.length` is capped at 100 by the schema (matches SC-005).
- Each child call is the same as the single-row action — no new RPCs, no new authorization surface.
