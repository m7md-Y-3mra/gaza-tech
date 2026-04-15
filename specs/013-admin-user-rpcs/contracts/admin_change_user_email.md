# Contract: `admin_change_user_email`

Backing: PL/pgSQL RPC, `SECURITY DEFINER`. Uses the Supabase Auth admin surface (`auth.users`) via a privileged function. This RPC **does not** touch `public.users.email`-style mirrors directly — `auth.users.email` is the source of truth, and `public.users_with_email` simply re-reads it.

## Purpose

Allow an admin to change a target user's login email out-of-band (recovery / manual correction). Separated from `admin_edit_user` because email mutation is a security-sensitive operation — it changes what credential the user signs in with. Backs User Story 5 (split-out) and FR-055 through FR-059.

## Inputs

| Parameter               | Type             | Notes                                                                                                           |
| ----------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------- |
| `p_target_user_id`      | `uuid`           | Target user. Self-target allowed: an admin may correct their own email through this path.                       |
| `p_new_email`           | `text`           | Trimmed, lowercased before uniqueness check. Must match a basic RFC-5321-ish shape and be ≤ 254 chars (FR-056). |
| `p_rate_limit`          | `int` DEFAULT 60 | Per-admin window cap.                                                                                           |
| `p_rate_window_seconds` | `int` DEFAULT 60 | Window seconds.                                                                                                 |

## Output

```sql
RETURNS TABLE (user_id uuid, email text)
```

Returns the target id and the final (lower-cased) email.

## Error codes

| Code                | Condition                                                                          |
| ------------------- | ---------------------------------------------------------------------------------- |
| `NOT_AUTHENTICATED` | No session.                                                                        |
| `NOT_ADMIN`         | Caller not admin.                                                                  |
| `VALIDATION:email`  | Empty / whitespace / malformed / too long (FR-056).                                |
| `USER_NOT_FOUND`    | Target row missing in `auth.users`.                                                |
| `EMAIL_IN_USE`      | Another `auth.users` row already has that email (case-insensitive match) (FR-057). |
| `RATE_LIMITED`      | Window exceeded.                                                                   |

## Algorithm

1. AuthN / AuthZ.
2. Rate-limit check.
3. Validate the email:
   - `v_email := lower(btrim(coalesce(p_new_email,'')))`.
   - Empty → `VALIDATION:email`.
   - `length > 254` → `VALIDATION:email`.
   - Shape check: `v_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'`. Fail → `VALIDATION:email`.
4. `SELECT id FROM auth.users WHERE id = p_target_user_id FOR UPDATE`. If no row, `USER_NOT_FOUND`.
5. Uniqueness: `SELECT 1 FROM auth.users WHERE lower(email) = v_email AND id <> p_target_user_id`. If found, `EMAIL_IN_USE`.
6. `UPDATE auth.users SET email = v_email, updated_at = now() WHERE id = p_target_user_id`.
   - Supabase will _not_ automatically send a confirmation flow from an admin-side direct update; the new email is effective on next session refresh. That is the intended behavior for admin recovery — the user is informed out-of-band (FR-059).
   - `email_confirmed_at` is left untouched. If the target had a confirmed email previously, the new email inherits that confirmed state. Treat this as an admin-blessed correction.
7. Insert rate-log row (`action = 'change_email'`). Trim old rows.
8. Return `(p_target_user_id, v_email)`.

## Acceptance scenarios covered

- Spec FR-055, FR-056, FR-057, FR-058, FR-059.
- Edge case "Duplicate email on change".

## Notes / security

- `auth.users` is in the `auth` schema, not `public`. The RPC runs as `SECURITY DEFINER` owned by a role with `UPDATE` privilege on `auth.users` (the `supabase_auth_admin` role already has this — the migration creates this function owned by a role that has been `GRANT`ed `UPDATE, SELECT` on `auth.users` for the scope of this function, then `REVOKE`s in cleanup).
- Because the function owner needs elevated privileges, the SQL is applied by a Supabase-admin migration — not by user-role deployment scripts.
- The RPC intentionally does **not** return the old email. The caller does not need it and leaking it would widen the audit surface without benefit.

## SQL reference

```sql
CREATE OR REPLACE FUNCTION public.admin_change_user_email (
  p_target_user_id      uuid,
  p_new_email           text,
  p_rate_limit          int DEFAULT 60,
  p_rate_window_seconds int DEFAULT 60
)
RETURNS TABLE (user_id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_email      text;
  v_recent_ops int;
  v_exists     boolean;
  v_conflict   boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = 'P0001', HINT = 'NOT_AUTHENTICATED';
  END IF;
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'admin required' USING ERRCODE = 'P0001', HINT = 'NOT_ADMIN';
  END IF;

  -- Rate limit
  SELECT count(*) INTO v_recent_ops
    FROM public.admin_action_rate_log
   WHERE admin_id = auth.uid()
     AND performed_at > now() - make_interval(secs => p_rate_window_seconds);
  IF v_recent_ops >= p_rate_limit THEN
    RAISE EXCEPTION 'rate limit exceeded' USING ERRCODE = 'P0001', HINT = 'RATE_LIMITED';
  END IF;

  -- Validate email
  v_email := lower(btrim(coalesce(p_new_email, '')));
  IF v_email = '' OR length(v_email) > 254
     OR v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'bad email' USING ERRCODE = 'P0001', HINT = 'VALIDATION:email';
  END IF;

  -- Target exists
  SELECT true INTO v_exists
    FROM auth.users
   WHERE id = p_target_user_id
   FOR UPDATE;
  IF v_exists IS NULL THEN
    RAISE EXCEPTION 'user not found' USING ERRCODE = 'P0001', HINT = 'USER_NOT_FOUND';
  END IF;

  -- Uniqueness (case-insensitive, exclude self)
  SELECT true INTO v_conflict
    FROM auth.users
   WHERE lower(email) = v_email
     AND id <> p_target_user_id
   LIMIT 1;
  IF v_conflict THEN
    RAISE EXCEPTION 'email in use' USING ERRCODE = 'P0001', HINT = 'EMAIL_IN_USE';
  END IF;

  UPDATE auth.users
     SET email = v_email,
         updated_at = now()
   WHERE id = p_target_user_id;

  INSERT INTO public.admin_action_rate_log (admin_id, action)
  VALUES (auth.uid(), 'change_email');

  DELETE FROM public.admin_action_rate_log
   WHERE performed_at < now() - interval '1 day';

  RETURN QUERY SELECT p_target_user_id, v_email;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_change_user_email(uuid,text,int,int) TO authenticated;
```
