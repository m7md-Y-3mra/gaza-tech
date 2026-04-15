# Contract: `admin_edit_user`

Backing: PL/pgSQL RPC, `SECURITY DEFINER`. Mutates a **closed whitelist** of columns on `public.users`.

## Purpose

Edit a target user's profile. Backs User Story 5 and FR-050 through FR-054.

## Whitelist (FR-050)

Exactly these six fields are editable through this RPC:

- `first_name` (1–100 chars, trimmed, non-empty)
- `last_name` (1–100 chars, trimmed, non-empty)
- `phone` → stored in column `phone_number` (nullable; if provided, 5–30 chars, matches `^[+0-9 ()-]+$`)
- `is_verified` (boolean)
- `avatar_url` (nullable; if provided, `^https?://` and ≤ 500 chars)
- `social_links` → object with any subset of keys `{ facebook_link_url, instagram_link_url, twitter_link_url, website_url }`. Each value is a URL validated as above or `null` to clear.

Any other key present in the input is a `VALIDATION:<field>` error — including `email`, `user_role`, `is_active`, `ban_reason`, `banned_at`, `user_id`, `created_at`, and `updated_at`.

## Inputs

| Parameter               | Type             | Notes                                                                                                                                  |
| ----------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `p_target_user_id`      | `uuid`           | Target. No self-restriction (admins may correct their own profile through this path — the restriction only applies to role/ban/email). |
| `p_updates`             | `jsonb`          | Object whose keys are the whitelist names above. Missing keys are left unchanged (FR-052).                                             |
| `p_rate_limit`          | `int` DEFAULT 60 | Window cap.                                                                                                                            |
| `p_rate_window_seconds` | `int` DEFAULT 60 | Window seconds.                                                                                                                        |

## Output

```sql
RETURNS TABLE (user_id uuid)
```

(No payload — the caller refetches via `admin_list_users` or a detail read.)

## Error codes

| Code                 | Condition                                                         |
| -------------------- | ----------------------------------------------------------------- |
| `NOT_AUTHENTICATED`  | No session.                                                       |
| `NOT_ADMIN`          | Not admin.                                                        |
| `VALIDATION:<field>` | Any disallowed or malformed field. Key name included after colon. |
| `USER_NOT_FOUND`     | Target missing.                                                   |
| `RATE_LIMITED`       | Window exceeded.                                                  |

## Algorithm

1. AuthN / AuthZ.
2. Rate-limit check.
3. Validate `p_updates`:
   - Every key must be in the whitelist. Any other key → `VALIDATION:<key>`.
   - `social_links` must itself be a jsonb object; its keys must be in `{ facebook_link_url, instagram_link_url, twitter_link_url, website_url }`.
   - For each provided value, run the shape check defined above. First failure raises `VALIDATION:<field>`.
4. If `p_updates = '{}'` (empty object): skip the UPDATE, log the rate action anyway (an "edit" with no changes is still a call), return target id (FR-052 accepts empty update).
5. Build dynamic UPDATE with only the provided fields. `phone` maps to `phone_number`; `social_links.*` map to the respective `*_link_url` columns. Always set `updated_at = now()`.
6. `SELECT user_id FROM users WHERE user_id = p_target_user_id FOR UPDATE` beforehand to get `USER_NOT_FOUND` cleanly before any dynamic SQL runs.
7. Insert rate-log row (`action = 'edit'`). Trim old rows.
8. Return the target's user_id.

## Acceptance scenarios covered

- Spec Scenarios 5.1–5.5.
- FR-050, FR-051, FR-052, FR-053, FR-054.

## SQL reference

```sql
CREATE OR REPLACE FUNCTION public.admin_edit_user (
  p_target_user_id      uuid,
  p_updates             jsonb,
  p_rate_limit          int DEFAULT 60,
  p_rate_window_seconds int DEFAULT 60
)
RETURNS TABLE (user_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_allowed_top   text[] := ARRAY['first_name','last_name','phone','is_verified','avatar_url','social_links'];
  v_allowed_social text[] := ARRAY['facebook_link_url','instagram_link_url','twitter_link_url','website_url'];
  v_key           text;
  v_recent_ops    int;
  v_exists        boolean;
  v_sl            jsonb;
  v_sl_key        text;
  v_val           text;
BEGIN
  -- AuthN / AuthZ
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

  -- Existence
  SELECT true INTO v_exists
    FROM public.users
   WHERE user_id = p_target_user_id
   FOR UPDATE;
  IF v_exists IS NULL THEN
    RAISE EXCEPTION 'user not found' USING ERRCODE = 'P0001', HINT = 'USER_NOT_FOUND';
  END IF;

  IF p_updates IS NULL OR jsonb_typeof(p_updates) <> 'object' THEN
    RAISE EXCEPTION 'updates must be object' USING ERRCODE = 'P0001', HINT = 'VALIDATION:updates';
  END IF;

  -- Whitelist the top-level keys
  FOR v_key IN SELECT jsonb_object_keys(p_updates) LOOP
    IF NOT (v_key = ANY(v_allowed_top)) THEN
      RAISE EXCEPTION 'disallowed field'
        USING ERRCODE = 'P0001', HINT = 'VALIDATION:' || v_key;
    END IF;
  END LOOP;

  -- Validate each provided field's shape
  IF p_updates ? 'first_name' THEN
    v_val := btrim(coalesce(p_updates->>'first_name',''));
    IF v_val = '' OR length(v_val) > 100 THEN
      RAISE EXCEPTION 'bad first_name' USING ERRCODE = 'P0001', HINT = 'VALIDATION:first_name';
    END IF;
  END IF;
  IF p_updates ? 'last_name' THEN
    v_val := btrim(coalesce(p_updates->>'last_name',''));
    IF v_val = '' OR length(v_val) > 100 THEN
      RAISE EXCEPTION 'bad last_name' USING ERRCODE = 'P0001', HINT = 'VALIDATION:last_name';
    END IF;
  END IF;
  IF p_updates ? 'phone' AND (p_updates->>'phone') IS NOT NULL THEN
    v_val := btrim(p_updates->>'phone');
    IF length(v_val) < 5 OR length(v_val) > 30 OR v_val !~ '^[+0-9 ()-]+$' THEN
      RAISE EXCEPTION 'bad phone' USING ERRCODE = 'P0001', HINT = 'VALIDATION:phone';
    END IF;
  END IF;
  IF p_updates ? 'is_verified'
     AND jsonb_typeof(p_updates->'is_verified') <> 'boolean' THEN
    RAISE EXCEPTION 'bad is_verified' USING ERRCODE = 'P0001', HINT = 'VALIDATION:is_verified';
  END IF;
  IF p_updates ? 'avatar_url' AND (p_updates->>'avatar_url') IS NOT NULL THEN
    v_val := p_updates->>'avatar_url';
    IF v_val !~ '^https?://' OR length(v_val) > 500 THEN
      RAISE EXCEPTION 'bad avatar_url' USING ERRCODE = 'P0001', HINT = 'VALIDATION:avatar_url';
    END IF;
  END IF;

  IF p_updates ? 'social_links' THEN
    v_sl := p_updates->'social_links';
    IF jsonb_typeof(v_sl) <> 'object' THEN
      RAISE EXCEPTION 'bad social_links' USING ERRCODE = 'P0001', HINT = 'VALIDATION:social_links';
    END IF;
    FOR v_sl_key IN SELECT jsonb_object_keys(v_sl) LOOP
      IF NOT (v_sl_key = ANY(v_allowed_social)) THEN
        RAISE EXCEPTION 'disallowed social_links key'
          USING ERRCODE = 'P0001', HINT = 'VALIDATION:social_links.' || v_sl_key;
      END IF;
      IF (v_sl->>v_sl_key) IS NOT NULL THEN
        v_val := v_sl->>v_sl_key;
        IF v_val !~ '^https?://' OR length(v_val) > 500 THEN
          RAISE EXCEPTION 'bad url'
            USING ERRCODE = 'P0001', HINT = 'VALIDATION:social_links.' || v_sl_key;
        END IF;
      END IF;
    END LOOP;
  END IF;

  -- Apply updates (static UPDATE with COALESCE-style gating per field)
  UPDATE public.users
     SET
       first_name        = CASE WHEN p_updates ? 'first_name'
                                 THEN btrim(p_updates->>'first_name')
                                 ELSE first_name END,
       last_name         = CASE WHEN p_updates ? 'last_name'
                                 THEN btrim(p_updates->>'last_name')
                                 ELSE last_name END,
       phone_number      = CASE WHEN p_updates ? 'phone'
                                 THEN NULLIF(btrim(coalesce(p_updates->>'phone','')), '')
                                 ELSE phone_number END,
       is_verified       = CASE WHEN p_updates ? 'is_verified'
                                 THEN (p_updates->>'is_verified')::boolean
                                 ELSE is_verified END,
       avatar_url        = CASE WHEN p_updates ? 'avatar_url'
                                 THEN p_updates->>'avatar_url'
                                 ELSE avatar_url END,
       facebook_link_url = CASE WHEN (p_updates->'social_links') ? 'facebook_link_url'
                                 THEN p_updates#>>'{social_links,facebook_link_url}'
                                 ELSE facebook_link_url END,
       instagram_link_url= CASE WHEN (p_updates->'social_links') ? 'instagram_link_url'
                                 THEN p_updates#>>'{social_links,instagram_link_url}'
                                 ELSE instagram_link_url END,
       twitter_link_url  = CASE WHEN (p_updates->'social_links') ? 'twitter_link_url'
                                 THEN p_updates#>>'{social_links,twitter_link_url}'
                                 ELSE twitter_link_url END,
       website_url       = CASE WHEN (p_updates->'social_links') ? 'website_url'
                                 THEN p_updates#>>'{social_links,website_url}'
                                 ELSE website_url END,
       updated_at        = now()
   WHERE user_id = p_target_user_id;

  INSERT INTO public.admin_action_rate_log (admin_id, action)
  VALUES (auth.uid(), 'edit');

  DELETE FROM public.admin_action_rate_log
   WHERE performed_at < now() - interval '1 day';

  RETURN QUERY SELECT p_target_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_edit_user(uuid,jsonb,int,int) TO authenticated;
```
