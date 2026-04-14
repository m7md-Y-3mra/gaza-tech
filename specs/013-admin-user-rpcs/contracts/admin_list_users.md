# Contract: `admin_list_users`

Backing: PL/pgSQL RPC on Supabase. Reads from `public.users_with_email`.

## Purpose

Return a single page of users matching the admin's filters, together with the total count of users matching those filters (needed for pagination UI). The only listing entry-point in this feature. Backs User Story 1 / FR-010 through FR-018.

## Inputs

| Parameter          | Type     | Default        | Notes                                                                                                                   |
| ------------------ | -------- | -------------- | ----------------------------------------------------------------------------------------------------------------------- | --- | --- | --- | -------------------------------------- |
| `p_page_index`     | `int`    | `0`            | 0-based. `< 0` → VALIDATION.                                                                                            |
| `p_page_size`      | `int`    | `25`           | `1..100`. Values > 100 → VALIDATION (FR-017).                                                                           |
| `p_sort_column`    | `text`   | `'created_at'` | Allowed: `name`, `role`, `status`, `is_verified`, `created_at`, `last_activity_at`. Other values → VALIDATION (FR-014). |
| `p_sort_direction` | `text`   | `'desc'`       | `'asc'` or `'desc'`. Other values → VALIDATION.                                                                         |
| `p_search`         | `text`   | `NULL`         | Free text. Trimmed. Empty → no search filter. Matched case-insensitively against `first_name                            |     | ' ' |     | last_name`AND against`email` (FR-015). |
| `p_role_filter`    | `text[]` | `NULL`         | `NULL` or empty = no role filter. Each element must be one of the four valid roles (FR-018).                            |
| `p_status_filter`  | `text`   | `'all'`        | `'active'`, `'banned'`, or `'all'` (FR-018).                                                                            |

## Output

A single row shaped as:

```sql
RETURNS TABLE (
  total_count  bigint,
  items        jsonb        -- array of user objects
)
```

Each element of `items` has the shape:

```json
{
  "user_id": "uuid",
  "first_name": "string",
  "last_name": "string",
  "email": "string|null",
  "avatar_url": "string|null",
  "user_role": "registered|verified_seller|moderator|admin",
  "is_active": true,
  "is_verified": false,
  "ban_reason": "string|null", // only present when is_active = false
  "banned_at": "timestamptz|null",
  "created_at": "timestamptz",
  "last_activity_at": "timestamptz|null"
}
```

## Authorization

- Reject with `NOT_AUTHENTICATED` if `auth.uid() IS NULL`.
- Reject with `NOT_ADMIN` if the caller's `user_role` is not `'admin'` (FR-001, FR-003).

## Ordering

- Primary sort = `p_sort_column` in `p_sort_direction`.
- **Implicit final tiebreaker** = `user_id ASC` (FR-014a) — always appended regardless of primary direction — guarantees stable pagination.
- `NULL`s on the primary sort column go last (`NULLS LAST`).

## Filtering semantics

- All filters combine with logical AND (FR-016).
- `p_search` matches if **either** full name OR email contains the term (FR-015).
- Omitted (`NULL` or empty) `p_role_filter` → no role restriction (FR-018).
- `p_status_filter = 'all'` → no status restriction (FR-018).
- `p_status_filter = 'active'` → `is_active = true`.
- `p_status_filter = 'banned'` → `is_active = false`.

## Errors (raised via `RAISE EXCEPTION`)

| Code                | Condition                                                                             | HTTP-like intent |
| ------------------- | ------------------------------------------------------------------------------------- | ---------------- |
| `NOT_AUTHENTICATED` | No session.                                                                           | 401              |
| `NOT_ADMIN`         | Authenticated but not admin.                                                          | 403              |
| `VALIDATION`        | Bad pagination, sort, role, or status input. `HINT` carries the offending field name. | 400              |

## Performance

Target: SC-001 (< 1s at 100k users, any filter combination).

Relies on indexes defined in `data-model.md`:

- Trigram GIN on `first_name || ' ' || last_name` for name search.
- Btree on `user_role`, `is_active`, `created_at`, `last_activity_at` for filter/sort.

Email search uses `ILIKE` on the view; at admin-directory scale (< 100k) this is acceptable without a trigram index on `auth.users.email`. If profiling shows it's the bottleneck, add one in a follow-up — not a blocker for this phase.

## Server action wrapper (`modules/admin-users/actions.ts`)

Input parsed via Zod, output mapped into the `AdminUserListResult` type. On error, `errorHandler()` returns `{ success: false, code, message, errors }`.

```ts
export const listAdminUsersAction = errorHandler(
  async (input: AdminUserListInput) => {
    await requireRole(['admin']); // extra defense-in-depth
    const parsed = AdminUserListInputSchema.parse(input);
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('admin_list_users', {
      p_page_index: parsed.pageIndex,
      p_page_size: parsed.pageSize,
      p_sort_column: parsed.sortColumn,
      p_sort_direction: parsed.sortDirection,
      p_search: parsed.search ?? null,
      p_role_filter: parsed.roleFilter ?? null,
      p_status_filter: parsed.statusFilter ?? 'all',
    });
    if (error) throw mapRpcError(error); // translates P0001 hints → CustomError(code=…)
    return {
      totalCount: data.total_count,
      items: data.items,
      pageIndex: parsed.pageIndex,
      pageSize: parsed.pageSize,
    };
  }
);
```

## SQL reference (authoritative)

```sql
CREATE OR REPLACE FUNCTION public.admin_list_users (
  p_page_index      int       DEFAULT 0,
  p_page_size       int       DEFAULT 25,
  p_sort_column     text      DEFAULT 'created_at',
  p_sort_direction  text      DEFAULT 'desc',
  p_search          text      DEFAULT NULL,
  p_role_filter     text[]    DEFAULT NULL,
  p_status_filter   text      DEFAULT 'all'
)
RETURNS TABLE (total_count bigint, items jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_offset        int;
  v_sort_expr     text;
  v_search_like   text;
  v_dir           text;
BEGIN
  -- AuthN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = 'P0001', HINT = 'NOT_AUTHENTICATED';
  END IF;

  -- AuthZ
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'admin required' USING ERRCODE = 'P0001', HINT = 'NOT_ADMIN';
  END IF;

  -- Validate pagination
  IF p_page_index < 0 THEN
    RAISE EXCEPTION 'bad pageIndex' USING ERRCODE = 'P0001', HINT = 'VALIDATION:pageIndex';
  END IF;
  IF p_page_size < 1 OR p_page_size > 100 THEN
    RAISE EXCEPTION 'bad pageSize' USING ERRCODE = 'P0001', HINT = 'VALIDATION:pageSize';
  END IF;

  -- Validate sort
  v_dir := lower(p_sort_direction);
  IF v_dir NOT IN ('asc','desc') THEN
    RAISE EXCEPTION 'bad sortDirection' USING ERRCODE = 'P0001', HINT = 'VALIDATION:sortDirection';
  END IF;
  v_sort_expr := CASE p_sort_column
    WHEN 'name'              THEN 'lower(first_name || '' '' || last_name)'
    WHEN 'role'              THEN 'user_role'
    WHEN 'status'            THEN 'is_active'
    WHEN 'is_verified'       THEN 'is_verified'
    WHEN 'created_at'        THEN 'created_at'
    WHEN 'last_activity_at'  THEN 'last_activity_at'
    ELSE NULL
  END;
  IF v_sort_expr IS NULL THEN
    RAISE EXCEPTION 'bad sortColumn' USING ERRCODE = 'P0001', HINT = 'VALIDATION:sortColumn';
  END IF;

  -- Validate role filter (each element must be a known role)
  IF p_role_filter IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM unnest(p_role_filter) r
        WHERE r NOT IN ('registered','verified_seller','moderator','admin')
     )
  THEN
    RAISE EXCEPTION 'bad roleFilter' USING ERRCODE = 'P0001', HINT = 'VALIDATION:roleFilter';
  END IF;

  -- Validate status filter
  IF p_status_filter NOT IN ('all','active','banned') THEN
    RAISE EXCEPTION 'bad statusFilter' USING ERRCODE = 'P0001', HINT = 'VALIDATION:statusFilter';
  END IF;

  v_offset := p_page_index * p_page_size;
  v_search_like := CASE
    WHEN p_search IS NULL OR btrim(p_search) = '' THEN NULL
    ELSE '%' || btrim(p_search) || '%'
  END;

  RETURN QUERY EXECUTE format($q$
    WITH filtered AS (
      SELECT uwe.*
        FROM public.users_with_email uwe
       WHERE (%1$L IS NULL
              OR (uwe.first_name || ' ' || uwe.last_name) ILIKE %1$L
              OR uwe.email ILIKE %1$L)
         AND (%2$L::text[] IS NULL
              OR array_length(%2$L::text[], 1) IS NULL
              OR uwe.user_role = ANY (%2$L::text[]))
         AND (%3$L = 'all'
              OR (%3$L = 'active'  AND uwe.is_active = true)
              OR (%3$L = 'banned'  AND uwe.is_active = false))
    ),
    counted AS (SELECT count(*)::bigint AS n FROM filtered)
    SELECT
      (SELECT n FROM counted),
      coalesce(jsonb_agg(row_to_json(p)::jsonb) FILTER (WHERE p.user_id IS NOT NULL), '[]'::jsonb)
    FROM (
      SELECT
        f.user_id, f.first_name, f.last_name, f.email, f.avatar_url,
        f.user_role, f.is_active, f.is_verified,
        CASE WHEN f.is_active = false THEN f.ban_reason ELSE NULL END AS ban_reason,
        f.banned_at, f.created_at, f.last_activity_at
      FROM filtered f
      ORDER BY %4$s %5$s NULLS LAST, f.user_id ASC
      OFFSET %6$L LIMIT %7$L
    ) p
  $q$,
  v_search_like,         -- %1
  p_role_filter,         -- %2
  p_status_filter,       -- %3
  v_sort_expr,           -- %4  (controlled, not user-supplied text)
  v_dir,                 -- %5  (controlled)
  v_offset,              -- %6
  p_page_size            -- %7
  );
END;
$$;

-- Make it callable from the authenticated role
GRANT EXECUTE ON FUNCTION public.admin_list_users(int,int,text,text,text,text[],text) TO authenticated;
```

Note: the `users_with_email` view exposes `banned_at` only after the migration adds it — regenerate types after applying the migration so the view includes it. If the view does not automatically pick up the new column, recreate it with `banned_at` included.

## Acceptance scenarios covered

- Spec Scenarios 1.1–1.5 (page, filter, search, sort-pagination stability, non-admin refusal).
- FR-010 through FR-018.
- SC-001 (performance target).
