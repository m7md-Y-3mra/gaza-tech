# Contract: `admin_unban_user`

Backing: PL/pgSQL RPC, `SECURITY DEFINER`. Mutates `public.users`.

## Purpose

Reverse a previous ban. Flips `is_active` back to `true`, clears `ban_reason`, clears `banned_at`. Backs User Story 4 and FR-040 through FR-042.

Side effects (implicit): the user's marketplace listings reappear on public surfaces automatically (because those queries filter by `users.is_active`).

## Inputs

| Parameter               | Type             | Notes                                                                                                                                                                                                                                                                    |
| ----------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `p_target_user_id`      | `uuid`           | Target user. Self-target is **not** explicitly forbidden here (unbanning yourself would never be reachable — if you were banned, you couldn't call this — but there's no harm in disallowing it). Keep symmetrical: allow self-target so the RPC remains trivially safe. |
| `p_rate_limit`          | `int` DEFAULT 60 | Per-admin window.                                                                                                                                                                                                                                                        |
| `p_rate_window_seconds` | `int` DEFAULT 60 | Window in seconds.                                                                                                                                                                                                                                                       |

## Output

```sql
RETURNS TABLE (user_id uuid, is_active boolean)
```

## Error codes

| Code                | Condition              |
| ------------------- | ---------------------- |
| `NOT_AUTHENTICATED` | No session.            |
| `NOT_ADMIN`         | Caller not admin.      |
| `USER_NOT_FOUND`    | Target missing.        |
| `RATE_LIMITED`      | Mutation cap exceeded. |

## Algorithm

1. AuthN / AuthZ.
2. Rate-limit check.
3. `SELECT is_active FROM users WHERE user_id = p_target_user_id FOR UPDATE`. If no row, `USER_NOT_FOUND`.
4. If the target is already active, skip the UPDATE (idempotent no-op — FR-041). Still insert the rate-log row for consistent counting (admin still performed an action).
5. Else `UPDATE users SET is_active = true, ban_reason = NULL, banned_at = NULL, updated_at = now() WHERE user_id = p_target_user_id`.
6. Insert rate-log row (`action = 'unban'`). Trim old rows.
7. Return the user id and final active state.

## Acceptance scenarios covered

- Spec Scenarios 4.1–4.4.
- FR-040, FR-041, FR-042.

## SQL reference

```sql
CREATE OR REPLACE FUNCTION public.admin_unban_user (
  p_target_user_id      uuid,
  p_rate_limit          int DEFAULT 60,
  p_rate_window_seconds int DEFAULT 60
)
RETURNS TABLE (user_id uuid, is_active boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_active boolean;
  v_recent_ops     int;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = 'P0001', HINT = 'NOT_AUTHENTICATED';
  END IF;
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'admin required' USING ERRCODE = 'P0001', HINT = 'NOT_ADMIN';
  END IF;

  SELECT count(*) INTO v_recent_ops
    FROM public.admin_action_rate_log
   WHERE admin_id = auth.uid()
     AND performed_at > now() - make_interval(secs => p_rate_window_seconds);
  IF v_recent_ops >= p_rate_limit THEN
    RAISE EXCEPTION 'rate limit exceeded' USING ERRCODE = 'P0001', HINT = 'RATE_LIMITED';
  END IF;

  SELECT u.is_active INTO v_current_active
    FROM public.users u
   WHERE u.user_id = p_target_user_id
   FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'user not found' USING ERRCODE = 'P0001', HINT = 'USER_NOT_FOUND';
  END IF;

  IF v_current_active IS DISTINCT FROM true THEN
    UPDATE public.users
       SET is_active = true,
           ban_reason = NULL,
           banned_at = NULL,
           updated_at = now()
     WHERE user_id = p_target_user_id;
  END IF;

  INSERT INTO public.admin_action_rate_log (admin_id, action)
  VALUES (auth.uid(), 'unban');

  DELETE FROM public.admin_action_rate_log
   WHERE performed_at < now() - interval '1 day';

  RETURN QUERY
    SELECT u.user_id, u.is_active
      FROM public.users u
     WHERE u.user_id = p_target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_unban_user(uuid,int,int) TO authenticated;
```
