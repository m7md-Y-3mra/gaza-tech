# Contract: `admin_change_user_role`

Backing: PL/pgSQL RPC, `SECURITY DEFINER`. Mutates `public.users.user_role`.

## Purpose

Promote or demote a target user between the four supported roles. Backs User Story 2 and FR-020 through FR-026.

## Inputs

| Parameter               | Type             | Notes                                                                 |
| ----------------------- | ---------------- | --------------------------------------------------------------------- |
| `p_target_user_id`      | `uuid`           | Target user. Must not be `auth.uid()` (FR-022).                       |
| `p_new_role`            | `text`           | One of `'registered'`, `'verified_seller'`, `'moderator'`, `'admin'`. |
| `p_rate_limit`          | `int` DEFAULT 60 | Max mutations per `p_rate_window_seconds` per admin.                  |
| `p_rate_window_seconds` | `int` DEFAULT 60 | Sliding window size in seconds.                                       |

## Output

```sql
RETURNS TABLE (user_id uuid, user_role text)
```

## Error codes

| Code                | Condition                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------- |
| `NOT_AUTHENTICATED` | `auth.uid() IS NULL`.                                                                         |
| `NOT_ADMIN`         | Caller is not an admin.                                                                       |
| `SELF_TARGET`       | `p_target_user_id = auth.uid()`.                                                              |
| `VALIDATION:role`   | `p_new_role` not in the supported set.                                                        |
| `USER_NOT_FOUND`    | No row in `public.users` for `p_target_user_id`.                                              |
| `LAST_ADMIN`        | Demoting the target would leave zero admins. Check runs inside the same transaction (FR-025). |
| `RATE_LIMITED`      | Caller exceeded `p_rate_limit` mutating ops in the last `p_rate_window_seconds` seconds.      |

## Algorithm (must be atomic)

1. AuthN / AuthZ.
2. Validate `p_new_role`.
3. Reject self-target.
4. Rate-limit check: count rows in `admin_action_rate_log` with `admin_id = auth.uid()` AND `performed_at > now() - make_interval(secs := p_rate_window_seconds)`. If `>= p_rate_limit`, raise `RATE_LIMITED`.
5. `SELECT user_role FROM users WHERE user_id = p_target_user_id FOR UPDATE`. If none, raise `USER_NOT_FOUND`. Capture as `v_current_role`.
6. If `v_current_role = 'admin'` AND `p_new_role <> 'admin'`:
   - `SELECT count(*) FROM users WHERE user_role = 'admin'` (the `FOR UPDATE` on the target serializes this sufficiently under REPEATABLE READ-style semantics; the count also includes the target because we haven't written yet — see note). If `count <= 1`, raise `LAST_ADMIN`.
7. `UPDATE users SET user_role = p_new_role, updated_at = now() WHERE user_id = p_target_user_id`.
8. `INSERT INTO admin_action_rate_log(admin_id, action) VALUES (auth.uid(), 'change_role')`.
9. Trim: `DELETE FROM admin_action_rate_log WHERE performed_at < now() - interval '1 day'`.
10. `RETURN QUERY SELECT user_id, user_role FROM users WHERE user_id = p_target_user_id`.

> Concurrency note: because step 5 locks the target row and step 6 counts admins (including the target row which, at this point in the transaction, still holds its old role), two concurrent demotions of two different admins cannot both win — one will block on the other's row lock, and the second to proceed will re-read the admin count and see only one admin left. If safety under serialization-anomaly edge cases is a concern, the RPC may be run under `SET LOCAL transaction_isolation = 'serializable'` for step 5–7.

## Acceptance scenarios covered

- Spec Scenarios 2.1–2.5.
- FR-020, FR-021, FR-022, FR-023, FR-024, FR-025, FR-026 (the RPC does not touch `is_verified`).
- Edge case "Last remaining admin".

## SQL reference

```sql
CREATE OR REPLACE FUNCTION public.admin_change_user_role (
  p_target_user_id      uuid,
  p_new_role            text,
  p_rate_limit          int DEFAULT 60,
  p_rate_window_seconds int DEFAULT 60
)
RETURNS TABLE (user_id uuid, user_role text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_role text;
  v_admin_count  int;
  v_recent_ops   int;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = 'P0001', HINT = 'NOT_AUTHENTICATED';
  END IF;
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'admin required' USING ERRCODE = 'P0001', HINT = 'NOT_ADMIN';
  END IF;
  IF p_target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'cannot modify own role' USING ERRCODE = 'P0001', HINT = 'SELF_TARGET';
  END IF;
  IF p_new_role NOT IN ('registered','verified_seller','moderator','admin') THEN
    RAISE EXCEPTION 'invalid role' USING ERRCODE = 'P0001', HINT = 'VALIDATION:role';
  END IF;

  SELECT count(*) INTO v_recent_ops
    FROM public.admin_action_rate_log
   WHERE admin_id = auth.uid()
     AND performed_at > now() - make_interval(secs => p_rate_window_seconds);
  IF v_recent_ops >= p_rate_limit THEN
    RAISE EXCEPTION 'rate limit exceeded' USING ERRCODE = 'P0001', HINT = 'RATE_LIMITED';
  END IF;

  SELECT u.user_role INTO v_current_role
    FROM public.users u
   WHERE u.user_id = p_target_user_id
   FOR UPDATE;
  IF v_current_role IS NULL THEN
    RAISE EXCEPTION 'user not found' USING ERRCODE = 'P0001', HINT = 'USER_NOT_FOUND';
  END IF;

  IF v_current_role = 'admin' AND p_new_role <> 'admin' THEN
    SELECT count(*) INTO v_admin_count
      FROM public.users
     WHERE user_role = 'admin';
    IF v_admin_count <= 1 THEN
      RAISE EXCEPTION 'cannot remove the last administrator'
        USING ERRCODE = 'P0001', HINT = 'LAST_ADMIN';
    END IF;
  END IF;

  UPDATE public.users
     SET user_role = p_new_role,
         updated_at = now()
   WHERE user_id = p_target_user_id;

  INSERT INTO public.admin_action_rate_log (admin_id, action)
  VALUES (auth.uid(), 'change_role');

  DELETE FROM public.admin_action_rate_log
   WHERE performed_at < now() - interval '1 day';

  RETURN QUERY
    SELECT u.user_id, u.user_role
      FROM public.users u
     WHERE u.user_id = p_target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_change_user_role(uuid,text,int,int) TO authenticated;
```
