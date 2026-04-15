# Contract: `admin_ban_user`

Backing: PL/pgSQL RPC, `SECURITY DEFINER`. Mutates `public.users`.

## Purpose

Ban a target user — flip `is_active` to `false`, record the reason and the ban timestamp. Backs User Story 3 and FR-030 through FR-038.

Side effects (implicit, via data model):

- The user's marketplace listings disappear from public-facing surfaces because those queries filter by `users.is_active = true` (see `public_listing_ban_visibility.md`).
- Community posts and comments are intentionally untouched (FR-038).

## Inputs

| Parameter               | Type             | Notes                                                    |
| ----------------------- | ---------------- | -------------------------------------------------------- |
| `p_target_user_id`      | `uuid`           | Target user. Must not be `auth.uid()` (FR-033).          |
| `p_reason`              | `text`           | Non-empty, non-whitespace, ≤ 500 chars (FR-031, FR-032). |
| `p_rate_limit`          | `int` DEFAULT 60 | Per-admin mutations per window.                          |
| `p_rate_window_seconds` | `int` DEFAULT 60 | Sliding window in seconds.                               |

## Output

```sql
RETURNS TABLE (user_id uuid, is_active boolean, ban_reason text, banned_at timestamptz)
```

## Error codes

| Code                | Condition                                |
| ------------------- | ---------------------------------------- |
| `NOT_AUTHENTICATED` | No session.                              |
| `NOT_ADMIN`         | Caller not admin.                        |
| `SELF_TARGET`       | Caller tried to ban themselves.          |
| `VALIDATION:reason` | Reason empty / whitespace / > 500 chars. |
| `USER_NOT_FOUND`    | Target missing.                          |
| `RATE_LIMITED`      | Mutation cap exceeded.                   |

## Algorithm

1. AuthN / AuthZ.
2. Reject self-target.
3. `v_reason := btrim(p_reason)`. If empty or `length > 500`, raise `VALIDATION:reason`.
4. Rate-limit check (same pattern as `admin_change_user_role`).
5. `SELECT user_id FROM users WHERE user_id = p_target_user_id FOR UPDATE`. If none, `USER_NOT_FOUND`.
6. `UPDATE users SET is_active = false, ban_reason = v_reason, banned_at = now(), updated_at = now() WHERE user_id = p_target_user_id`.
   - Re-ban of an already-banned user is allowed and refreshes both `ban_reason` and `banned_at` (FR-035).
7. Insert rate-log row (`action = 'ban'`). Trim old rows.
8. Return the updated row's identity and new ban state.

## Acceptance scenarios covered

- Spec Scenarios 3.1–3.5.
- FR-030 through FR-036.
- Edge case "Empty, whitespace-only, or overly long ban reason".

## SQL reference

```sql
CREATE OR REPLACE FUNCTION public.admin_ban_user (
  p_target_user_id      uuid,
  p_reason              text,
  p_rate_limit          int DEFAULT 60,
  p_rate_window_seconds int DEFAULT 60
)
RETURNS TABLE (user_id uuid, is_active boolean, ban_reason text, banned_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_reason     text;
  v_recent_ops int;
  v_exists     boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = 'P0001', HINT = 'NOT_AUTHENTICATED';
  END IF;
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'admin required' USING ERRCODE = 'P0001', HINT = 'NOT_ADMIN';
  END IF;
  IF p_target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'cannot ban yourself' USING ERRCODE = 'P0001', HINT = 'SELF_TARGET';
  END IF;

  v_reason := btrim(coalesce(p_reason, ''));
  IF v_reason = '' THEN
    RAISE EXCEPTION 'reason required' USING ERRCODE = 'P0001', HINT = 'VALIDATION:reason';
  END IF;
  IF length(v_reason) > 500 THEN
    RAISE EXCEPTION 'reason too long' USING ERRCODE = 'P0001', HINT = 'VALIDATION:reason';
  END IF;

  SELECT count(*) INTO v_recent_ops
    FROM public.admin_action_rate_log
   WHERE admin_id = auth.uid()
     AND performed_at > now() - make_interval(secs => p_rate_window_seconds);
  IF v_recent_ops >= p_rate_limit THEN
    RAISE EXCEPTION 'rate limit exceeded' USING ERRCODE = 'P0001', HINT = 'RATE_LIMITED';
  END IF;

  SELECT true INTO v_exists
    FROM public.users
   WHERE user_id = p_target_user_id
   FOR UPDATE;
  IF v_exists IS NULL THEN
    RAISE EXCEPTION 'user not found' USING ERRCODE = 'P0001', HINT = 'USER_NOT_FOUND';
  END IF;

  UPDATE public.users
     SET is_active = false,
         ban_reason = v_reason,
         banned_at = now(),
         updated_at = now()
   WHERE user_id = p_target_user_id;

  INSERT INTO public.admin_action_rate_log (admin_id, action)
  VALUES (auth.uid(), 'ban');

  DELETE FROM public.admin_action_rate_log
   WHERE performed_at < now() - interval '1 day';

  RETURN QUERY
    SELECT u.user_id, u.is_active, u.ban_reason, u.banned_at
      FROM public.users u
     WHERE u.user_id = p_target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_ban_user(uuid,text,int,int) TO authenticated;
```
