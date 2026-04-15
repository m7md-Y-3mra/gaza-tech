# Phase 1 — Data Model: Admin User Management (013-admin-user-rpcs)

## Overview

Phase 1 builds on the existing `public.users` table and `public.users_with_email` view. It adds:

1. One new column on `public.users` (`banned_at`).
2. One new CHECK constraint on `public.users.user_role`.
3. One new table `public.admin_action_rate_log`.
4. Several new PL/pgSQL RPC functions (defined in `contracts/`).

The `user_role` enumeration is already the contract in `config/rbac.ts` (`'registered' | 'verified_seller' | 'moderator' | 'admin'`). We align the database to that contract here.

---

## Entities

### User (existing — augmented)

Source table: `public.users` (columns already present unless noted).

| Column               | Type          | Nullable | Notes                                                                                                                                   |
| -------------------- | ------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `user_id`            | `uuid`        | NO (PK)  | FK to `auth.users.id`.                                                                                                                  |
| `first_name`         | `text`        | NO       | Editable by admin (FR-050 whitelist).                                                                                                   |
| `last_name`          | `text`        | NO       | Editable by admin.                                                                                                                      |
| `avatar_url`         | `text`        | YES      | Editable by admin.                                                                                                                      |
| `bio`                | `text`        | YES      | NOT in admin edit whitelist (FR-051).                                                                                                   |
| `phone_number`       | `text`        | YES      | Editable by admin. Validated as non-empty if present.                                                                                   |
| `whatsapp_number`    | `text`        | YES      | Not in admin edit whitelist this phase.                                                                                                 |
| `facebook_link_url`  | `text`        | YES      | Grouped under "social_links" in the edit whitelist. Must be a valid URL if present.                                                     |
| `instagram_link_url` | `text`        | YES      | Same.                                                                                                                                   |
| `twitter_link_url`   | `text`        | YES      | Same.                                                                                                                                   |
| `website_url`        | `text`        | YES      | Same.                                                                                                                                   |
| `is_verified`        | `boolean`     | YES      | Editable by admin. Independent of `user_role` (FR-026).                                                                                 |
| `is_active`          | `boolean`     | YES      | Flipped by ban/unban RPCs. Public listing visibility depends on this.                                                                   |
| `ban_reason`         | `text`        | YES      | Populated by `admin_ban_user`; cleared by `admin_unban_user`. Max 500 chars.                                                            |
| `banned_expires_at`  | `timestamptz` | YES      | EXISTING — represents scheduled end of ban. Phase 1 does **not** set this column.                                                       |
| **`banned_at`**      | `timestamptz` | YES      | **NEW** — set by `admin_ban_user` to `now()`; cleared by `admin_unban_user`. Used by Phase 2 middleware to invalidate pre-ban sessions. |
| `user_role`          | `text`        | YES      | **Augmented** — adds CHECK constraint (see below). Default `'registered'` already enforced by app.                                      |
| `last_activity_at`   | `timestamptz` | YES      | Read-only for admin operations.                                                                                                         |
| `created_at`         | `timestamptz` | YES      | Read-only.                                                                                                                              |
| `updated_at`         | `timestamptz` | YES      | Refreshed on every mutating RPC.                                                                                                        |
| `terms_accepted_at`  | `timestamptz` | YES      | Not editable by admin.                                                                                                                  |

**Email** is NOT on `public.users`. It lives on `auth.users.email` and is exposed via the `public.users_with_email` view. The `admin_change_user_email` RPC updates `auth.users.email` through `auth.admin_update_user_by_id` (Supabase service-role helper) — see its contract.

#### Migration — new column

```sql
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS banned_at timestamptz;

COMMENT ON COLUMN public.users.banned_at IS
  'Server time at which the user was banned. Cleared on unban. Used to invalidate sessions issued before the ban. Distinct from banned_expires_at (scheduled end of ban).';
```

#### Migration — CHECK constraint on `user_role`

```sql
-- Backfill any existing non-conforming rows first (should be zero in practice).
UPDATE public.users
   SET user_role = 'registered'
 WHERE user_role IS NULL
    OR user_role NOT IN ('registered','verified_seller','moderator','admin');

ALTER TABLE public.users
  ADD CONSTRAINT users_user_role_check
  CHECK (user_role IN ('registered','verified_seller','moderator','admin'));
```

### Validation rules enforced in RPCs

| Field                      | Rule                                                       |
| -------------------------- | ---------------------------------------------------------- |
| `first_name` / `last_name` | Trimmed, 1–100 chars.                                      |
| `phone_number`             | If provided: trimmed, 5–30 chars, matches `^[+0-9 ()-]+$`. |
| `*_link_url`, `avatar_url` | If provided: matches `^https?://` and ≤ 500 chars.         |
| `is_verified`              | Boolean.                                                   |
| `user_role`                | One of the four supported values (see CHECK constraint).   |
| `ban_reason`               | Trimmed, 1–500 chars (FR-032).                             |
| `email` (change_email)     | Valid RFC-5322-ish pattern; unique across `auth.users`.    |

---

### AdminActionRateLog (new)

Source table: `public.admin_action_rate_log`. Append-only ledger used by every mutating RPC to enforce FR-064 / FR-065.

| Column         | Type          | Nullable | Notes                                                          |
| -------------- | ------------- | -------- | -------------------------------------------------------------- |
| `id`           | `bigserial`   | NO (PK)  |                                                                |
| `admin_id`     | `uuid`        | NO       | The acting admin (`auth.uid()` at the time of the mutation).   |
| `action`       | `text`        | NO       | One of: `change_role`, `ban`, `unban`, `edit`, `change_email`. |
| `performed_at` | `timestamptz` | NO       | `DEFAULT now()`.                                               |

**Indexes**:

- `PRIMARY KEY (id)`
- `CREATE INDEX admin_action_rate_log_admin_time_idx ON public.admin_action_rate_log(admin_id, performed_at DESC);`

**Retention**: rows older than 1 day are trimmed inline on each insert (cheap given the index) so the table stays small.

#### Migration

```sql
CREATE TABLE IF NOT EXISTS public.admin_action_rate_log (
  id bigserial PRIMARY KEY,
  admin_id uuid NOT NULL,
  action text NOT NULL,
  performed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_action_rate_log_admin_time_idx
  ON public.admin_action_rate_log(admin_id, performed_at DESC);

ALTER TABLE public.admin_action_rate_log ENABLE ROW LEVEL SECURITY;
-- No policies: writes happen only via SECURITY DEFINER RPCs that bypass RLS.
-- Reads are not exposed to any client.
```

---

## Indexes supporting `admin_list_users` performance (SC-001)

The listing RPC reads from `public.users_with_email`. To keep it under 1s at 100k rows:

```sql
-- Search (name + email) — trigram index for ILIKE
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS users_full_name_trgm_idx
  ON public.users USING gin ((first_name || ' ' || last_name) gin_trgm_ops);

-- Email lives on auth.users; Supabase manages indexing there. Search on email
-- inside the RPC uses `auth.users.email ILIKE` within a SECURITY DEFINER context.

-- Filter + sort helpers
CREATE INDEX IF NOT EXISTS users_user_role_idx    ON public.users (user_role);
CREATE INDEX IF NOT EXISTS users_is_active_idx    ON public.users (is_active);
CREATE INDEX IF NOT EXISTS users_created_at_idx   ON public.users (created_at DESC);
CREATE INDEX IF NOT EXISTS users_last_activity_idx ON public.users (last_activity_at DESC NULLS LAST);
```

Each `IF NOT EXISTS` guard lets the migration re-run safely if partial state exists.

---

## State transitions

### `is_active` / ban state

```
  ┌──────────┐   admin_ban_user   ┌──────────┐
  │ ACTIVE   │ ─────────────────▶ │ BANNED   │
  │ is_active=true               │ is_active=false
  │ ban_reason=NULL              │ ban_reason=<text>
  │ banned_at=NULL               │ banned_at=now()
  └──────────┘                   └──────────┘
        ▲                               │
        │       admin_unban_user        │
        └───────────────────────────────┘
```

- `admin_ban_user` on an already-banned user is idempotent-with-refresh: reason and `banned_at` are overwritten (FR-035).
- `admin_unban_user` on an already-active user is a no-op (FR-041).

### `user_role`

Any of the four values can transition to any other via `admin_change_user_role`, subject to:

- Never self-target (FR-022).
- Never leave zero admins (FR-025).
- Never an invalid value (enforced by RPC + CHECK constraint).

---

## Cross-feature integration: public listing visibility

Not a schema change, but a data-layer contract owned by this phase (see `contracts/public_listing_ban_visibility.md`):

> Every query in `modules/listings/queries.ts` that surfaces listings on **public-facing** pages (home, browse, search, category, category-filtered) must join the seller's user row and filter `users.is_active = true`. The seller's own "my listings" view is **not** filtered this way (the seller can still see their own listings while banned, just not sell them — they're blocked by auth enforcement in Phase 2).

---

## Relationships touched

```
public.users ──(user_id = admin_id, logically)──▶ public.admin_action_rate_log
                                                          │
                                                          └─ written by every mutating RPC

public.users ◀──(seller_id)── public.marketplace_listings
                     ▲
                     │ public listing queries now filter users.is_active = true
```

No foreign key from `admin_action_rate_log.admin_id` to `public.users.user_id` — the RPC trusts `auth.uid()` at time-of-call, and we don't want to cascade-delete audit-adjacent data if a user row is ever removed.
