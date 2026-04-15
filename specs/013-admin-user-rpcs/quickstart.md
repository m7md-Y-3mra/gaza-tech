# Quickstart: Phase 1 (Admin User RPCs) end-to-end verification

This quickstart is for a developer who has just applied the Phase 1 migrations to their Supabase instance and wants to verify that all six RPCs behave correctly, end-to-end, against a real database.

Phase 1 ships **only** the database layer: migrations + RPCs + grants. No Next.js routes, no UI. Verification here is against `psql` / the SQL editor / the Supabase RPC HTTP surface — not through the browser.

## Prerequisites

- Supabase project reachable (dev or branch).
- `psql` or SQL editor access as a superuser (to apply migrations).
- Two test identities in `auth.users`:
  - `ADMIN` — row in `public.users` with `user_role = 'admin'`, `is_active = true`.
  - `TARGET` — row in `public.users` with `user_role = 'registered'`, `is_active = true`.
- Know each user's `user_id` (uuid) and have a JWT / session token for `ADMIN` for RPC calls.

## 0. Apply migrations

Migrations live under `specs/013-admin-user-rpcs/contracts/sql/` (added in Phase 1 implementation). Apply them in order through the Supabase MCP `apply_migration` tool, or paste them into the SQL editor:

1. `2026xxxx_add_banned_at_to_users.sql` — adds `banned_at timestamptz` to `public.users`.
2. `2026xxxx_user_role_check.sql` — adds `CHECK (user_role IN (...))`.
3. `2026xxxx_admin_action_rate_log.sql` — creates the rate-log table + indexes.
4. `2026xxxx_supporting_indexes.sql` — pg_trgm + btree indexes for `admin_list_users` perf.
5. `2026xxxx_admin_list_users.sql`
6. `2026xxxx_admin_change_user_role.sql`
7. `2026xxxx_admin_ban_user.sql`
8. `2026xxxx_admin_unban_user.sql`
9. `2026xxxx_admin_edit_user.sql`
10. `2026xxxx_admin_change_user_email.sql`

After applying, regenerate types:

```bash
npx supabase gen types typescript --project-id <ref> > types/supabase.ts
```

## 1. Smoke — list users

As `ADMIN`:

```sql
SELECT * FROM public.admin_list_users(
  p_page_index := 0,
  p_page_size  := 25
);
```

Expect: one row `(total_count, items)`. `items` is a jsonb array containing at least `ADMIN` and `TARGET`. `total_count` matches the total number of users in the database.

### Negative: anonymous

```sql
SET LOCAL role anon;
SELECT * FROM public.admin_list_users();
```

Expect: `ERROR ... HINT = NOT_AUTHENTICATED`.

### Negative: non-admin

Log in as `TARGET`. Expect: `HINT = NOT_ADMIN`.

### Filtering / sorting / search

```sql
SELECT * FROM public.admin_list_users(
  p_page_size := 10,
  p_sort_column := 'name',
  p_sort_direction := 'asc',
  p_search := 'alice',
  p_role_filter := ARRAY['registered','verified_seller']::text[],
  p_status_filter := 'active'
);
```

Expect: items contain only registered/verified_seller active users whose name or email matches `%alice%` case-insensitively. Stable pagination — paging twice with identical filters yields non-overlapping sets.

### Validation

```sql
SELECT * FROM public.admin_list_users(p_page_size := 500);
-- ERROR ... HINT = VALIDATION:pageSize
```

## 2. Change role

```sql
SELECT * FROM public.admin_change_user_role(
  p_target_user_id := '<TARGET uuid>',
  p_new_role       := 'verified_seller'
);
```

Expect: row `(TARGET uuid, 'verified_seller')`. Re-read via `admin_list_users` confirms the change.

### Last-admin guard

With exactly one admin in the table, attempt to demote `ADMIN` from another admin session — blocked by self-target. Now temporarily create a second admin, log in as the second admin, and try to demote `ADMIN`:

```sql
SELECT * FROM public.admin_change_user_role(
  p_target_user_id := '<ADMIN uuid>',
  p_new_role       := 'registered'
);
-- succeeds, because 2 admins exist
```

Now repeat with only one admin remaining:

```sql
-- ERROR ... HINT = LAST_ADMIN
```

### Self-target

```sql
SELECT * FROM public.admin_change_user_role(
  p_target_user_id := auth.uid(),
  p_new_role       := 'registered'
);
-- ERROR ... HINT = SELF_TARGET
```

## 3. Ban / Unban

```sql
SELECT * FROM public.admin_ban_user(
  p_target_user_id := '<TARGET uuid>',
  p_reason         := 'Posted disallowed content'
);
```

Expect: `(target_uuid, is_active=false, ban_reason='Posted disallowed content', banned_at=<now>)`.

Then run any **public** listing query (e.g. `getLatestListingsQuery` via SQL) — the target's listings are absent. A **community feed** query still returns the target's posts (FR-038).

Unban:

```sql
SELECT * FROM public.admin_unban_user(
  p_target_user_id := '<TARGET uuid>'
);
```

Expect: `(target_uuid, is_active=true)`. Public listing queries now include the target's listings again.

### Re-ban refreshes fields

```sql
SELECT banned_at FROM public.users WHERE user_id = '<TARGET uuid>';  -- first ban ts
-- ban again with a new reason
SELECT banned_at FROM public.users WHERE user_id = '<TARGET uuid>';  -- new ts > old
```

### Empty reason

```sql
SELECT * FROM public.admin_ban_user('<TARGET uuid>', '   ');
-- ERROR ... HINT = VALIDATION:reason
```

## 4. Edit profile

```sql
SELECT * FROM public.admin_edit_user(
  p_target_user_id := '<TARGET uuid>',
  p_updates        := jsonb_build_object(
    'first_name', 'Updated',
    'is_verified', true,
    'social_links', jsonb_build_object('website_url', 'https://example.com')
  )
);
```

Expect: `(target_uuid)`. Re-read confirms changes and unspecified fields are untouched.

### Empty update

```sql
SELECT * FROM public.admin_edit_user('<TARGET uuid>', '{}'::jsonb);
-- returns target id; no mutations applied; rate-log row still inserted
```

### Disallowed field

```sql
SELECT * FROM public.admin_edit_user(
  '<TARGET uuid>',
  jsonb_build_object('user_role','admin')
);
-- ERROR ... HINT = VALIDATION:user_role
```

### Bad URL in social_links

```sql
SELECT * FROM public.admin_edit_user(
  '<TARGET uuid>',
  jsonb_build_object('social_links', jsonb_build_object('facebook_link_url','javascript:alert(1)'))
);
-- ERROR ... HINT = VALIDATION:social_links.facebook_link_url
```

## 5. Change email

```sql
SELECT * FROM public.admin_change_user_email(
  p_target_user_id := '<TARGET uuid>',
  p_new_email      := 'new.address@example.com'
);
```

Expect: `(target_uuid, 'new.address@example.com')`. A fresh `admin_list_users` call reflects the new email.

### Duplicate email

```sql
-- ADMIN's own email is 'admin@example.com'
SELECT * FROM public.admin_change_user_email('<TARGET uuid>', 'admin@example.com');
-- ERROR ... HINT = EMAIL_IN_USE
```

### Malformed

```sql
SELECT * FROM public.admin_change_user_email('<TARGET uuid>', 'not-an-email');
-- ERROR ... HINT = VALIDATION:email
```

## 6. Rate limiting

With defaults (60 / 60 seconds), burst 60 successful mutations from `ADMIN` within a minute:

```sql
DO $$
DECLARE i int;
BEGIN
  FOR i IN 1..60 LOOP
    PERFORM public.admin_edit_user('<TARGET uuid>', '{}'::jsonb);
  END LOOP;
END$$;
```

The 61st call (before the window rolls) must:

```sql
SELECT * FROM public.admin_edit_user('<TARGET uuid>', '{}'::jsonb);
-- ERROR ... HINT = RATE_LIMITED
```

After 60 seconds, calls succeed again. Listing RPC is NOT rate-limited (never touches `admin_action_rate_log`).

Verify log trimming:

```sql
SELECT count(*) FROM public.admin_action_rate_log;
-- grows during a burst; self-trims rows older than 1 day
```

## 7. Done — exit criteria for Phase 1

- All six RPCs return the expected shapes for success paths.
- All error HINTs fire under the documented conditions.
- `admin_list_users` paginates stably across 100k+ synthetic users in < 1s (SC-001).
- `types/supabase.ts` regenerated and committed.
- No application code (`modules/admin-users/*`) has been written yet — that is Phase 2.
