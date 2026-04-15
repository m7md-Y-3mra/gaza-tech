# Phase 0 — Research: Admin User Management (013-admin-user-rpcs)

Each section records a decision the plan depends on, the reasoning, and alternatives that were evaluated and rejected.

---

## R1. Implementation boundary: Supabase RPC vs. plain server-action query

**Decision**: Implement every mutating operation (change role, ban, unban, edit profile, change email) as a Supabase `SECURITY DEFINER` PL/pgSQL function. Server actions in `modules/admin-users/actions.ts` are thin wrappers that validate input with Zod and call `.rpc(...)` — they do **not** run their own UPDATE statements against `public.users`. The listing operation is also an RPC (`admin_list_users`) so pagination/sort/filter/count run in a single round-trip.

**Rationale**:

- **Atomicity for cross-row invariants**. The last-admin guard (FR-025) and the rate-limit read-and-insert (FR-064) have to evaluate and mutate inside the same transaction; otherwise two concurrent demotions can each read "2 admins still" and both succeed. A PL/pgSQL function in a single transaction closes that race. A server action that issues two PostgREST calls cannot.
- **Defense in depth vs. RLS drift**. `SECURITY DEFINER` lets the function bypass RLS deliberately, but only after it has verified `is_admin()` inside itself. That keeps the RLS policies on `public.users` as narrow as possible (users see themselves + public surfaces) — the admin path does not need a separate "admins can UPDATE anything" policy that someone could later reuse outside these operations.
- **Single source of truth for error codes**. The PL/pgSQL function raises named exceptions (`'NOT_ADMIN'`, `'SELF_TARGET'`, `'LAST_ADMIN'`, `'USER_NOT_FOUND'`, `'RATE_LIMITED'`, `'VALIDATION'`) via `RAISE EXCEPTION 'text' USING ERRCODE = 'P0001', HINT = '<code>'`. `errorHandler()` maps these to `ApiResponseError` with a stable `code` the UI can branch on.

**Alternatives rejected**:

- _All-in-TypeScript server actions_: simpler, but loses atomicity for last-admin/rate-limit and forces either a permissive RLS policy or a race-prone multi-statement flow.
- _Edge functions_: add a deployment surface and cold-start cost with no correctness benefit over PL/pgSQL for this workload.

---

## R2. How to persist the SQL (migrations directory)

**Decision**: Author every SQL change for this feature as a single reviewable migration file under `specs/013-admin-user-rpcs/contracts/sql/` (co-located with the spec), and apply it to the live Supabase project via the Supabase MCP (`mcp__supabase__apply_migration`). Once the project adopts a top-level `supabase/migrations/` directory, these files can be moved there verbatim without rewriting.

**Rationale**:

- The repo currently has no `supabase/migrations/` folder; inventing one unilaterally in this feature would make it unclear whether it's the project convention or just this feature's choice.
- Keeping the SQL inside the spec directory gives reviewers the migration, the contracts, and the spec side-by-side without cross-directory hunting.
- The Supabase MCP's `apply_migration` tool records the migration with a name in Supabase's own migration registry, so the live database stays authoritative until a repo-level convention is decided.

**Alternatives rejected**:

- _Create `supabase/migrations/` now, unilaterally_: premature — a conventions change like this should be a separate team decision, not a side effect of one feature.
- _Apply raw SQL ad-hoc via `execute_sql`_: loses the name-and-version record; future migrations would have to guess whether functions already exist.

---

## R3. `banned_at` column vs. reusing `banned_expires_at`

**Decision**: Add a new column `public.users.banned_at timestamptz NULL`. Set it inside `admin_ban_user` and clear it inside `admin_unban_user`. Do **not** conflate it with the existing `banned_expires_at` column, which continues to mean "scheduled end of ban" (currently unused / always null, but the name is a contract).

**Rationale**: Per FR-036, Phase 2 needs a timestamp of _when the ban took effect_ so middleware can compare the session's issued-at against it. That is semantically different from "when the ban expires". Merging them would overload a column with two contradictory meanings.

**Alternatives rejected**:

- _Reuse `banned_expires_at` with a sentinel value_: violates the column's current contract, surprises anyone reading the schema, and complicates later scheduled-unban work.
- _Derive `banned_at` from `updated_at`_: wrong — `updated_at` moves on every subsequent edit.

---

## R4. Enforce `user_role` values at the DB level

**Decision**: Add a `CHECK (user_role IN ('registered','verified_seller','moderator','admin'))` constraint on `public.users.user_role`. Do not convert the column to a PostgreSQL `ENUM` type in this phase.

**Rationale**:

- The Supabase type generation already produces `user_role: string | null`. Converting to `ENUM` would require a type rewrite across all existing queries that depend on the `string` shape, creating risk well beyond this feature's scope.
- A `CHECK` constraint gives exactly the guarantee this feature needs — any invalid role value is rejected at the database boundary — without the migration blast radius of an enum swap.
- `admin_change_user_role` still validates inside the RPC (so a clean `VALIDATION` error flows back), but the constraint is the safety net.

**Alternatives rejected**:

- _Convert to `ENUM` now_: larger change, more risk, no additional safety once the CHECK is in place.
- _Rely only on application-level validation_: Bad-actor scenarios (direct DB access, a future RPC that forgets to validate) would bypass this; a CHECK is the cheapest defense.

---

## R5. Rate-limit storage: dedicated log table vs. counter row vs. Redis

**Decision**: Use a dedicated append-only table `public.admin_action_rate_log(id bigserial, admin_id uuid, action text, performed_at timestamptz DEFAULT now())` with an index on `(admin_id, performed_at DESC)`. Each mutating RPC inserts one row and counts rows for the same admin in the last `p_window_seconds` seconds; if the count exceeds `p_limit`, it raises a `RATE_LIMITED` exception **before** performing the real mutation. A scheduled job (or an inline `DELETE WHERE performed_at < now() - interval '1 day'` inside the same function) trims the table.

**Rationale**:

- No Redis is currently wired into the project — adding one would be out-of-scope infrastructure for this feature.
- An append-only log is trivial to query, trivial to reason about under concurrency, and the index keeps the count fast even as the log grows.
- A counter-row approach (one row per admin, incremented atomically) would be simpler still but loses the per-action breakdown and makes "sliding window" semantics awkward.

**Tunability**: The configured cap and window are taken from a function arg default (`p_limit int DEFAULT 60`, `p_window_seconds int DEFAULT 60`). FR-065 requires this to be operator-tunable without code change; since operators can `CREATE OR REPLACE FUNCTION` to bump the defaults, or the server action can pass an override read from an environment variable, this satisfies the spec. We will read the defaults from `process.env.ADMIN_RATE_LIMIT` / `ADMIN_RATE_LIMIT_WINDOW_SECONDS` in the server action and pass them explicitly to the RPC; missing env vars fall back to the 60/60 defaults.

**Alternatives rejected**:

- _Redis / Upstash sliding window_: extra infra, no material benefit at this scale.
- _One `last_actions jsonb` column on `users` per admin_: concurrency-unfriendly (read-modify-write) and grows unbounded.

---

## R6. Hiding banned users' listings on public surfaces

**Decision**: Change every **public-facing** listing query in `modules/listings/queries.ts` (and any feed that surfaces listings) to join `users` on `seller_id` and filter `users.is_active = true`. Do **not** mass-update `marketplace_listings.content_status` on ban.

**Rationale**:

- The filter approach is **auto-reversing on unban**: flip `is_active` back to `true` and the seller's listings reappear everywhere, with zero separate restore step. FR-040 explicitly requires this semantic.
- Mass-updating listings on ban is not safely reversible: we'd have to remember which listings were `published` vs `draft` before the ban and restore each to its prior state. That's extra state and a new class of bug.
- Community posts and comments are intentionally **not** filtered this way (FR-038) — their visibility is handled by the existing moderation pipeline (`content_status = 'removed'`), not ban.

**Performance**: The filter only adds one indexed equality check. An existing index on `marketplace_listings.seller_id` combined with the existing `users(user_id)` PK keeps the join negligible at 100k users.

**Alternatives rejected**:

- _Mark each listing as hidden on ban; restore on unban_: stateful, error-prone, harder to audit.
- _RLS policy on `marketplace_listings` that hides by seller status_: would affect the seller's own view of their listings too, which we don't want.

---

## R7. Search surface (name + email)

**Decision**: `admin_list_users` reads from `public.users_with_email` (the existing view that joins `auth.users.email`) and searches against `first_name || ' ' || last_name` and `email` using `ILIKE '%term%'`. A GIN trigram index (`pg_trgm`) on each of those expressions is created if not already present; otherwise we fall back to sequential scan, which is acceptable at 100k rows.

**Rationale**:

- The view exists and already includes email — no new join plumbing needed.
- `ILIKE` + trigram index is the standard Postgres pattern for case-insensitive substring search and comfortably clears the <1s SC-001 budget.
- Phone and user identifier are explicitly **not** in search scope (FR-015) so we don't index them for search.

**Alternatives rejected**:

- _Full-text search (`tsvector`)_: overkill for name/email and loses partial-substring matching ("john" shouldn't be required to be a whole token to match "johnson").

---

## R8. Relationship to the existing `banUserQuery` in `modules/content-moderation`

**Decision**: Leave the moderation module's `banUserQuery` in place for this phase. It is called from the content-moderation "resolve report → ban user" flow and allows `moderator` role callers, which is out of scope for the admin-users spec. Phase 1 creates a parallel, stricter `admin_ban_user` path for the admin dashboard only.

**Follow-up (out of scope here)**: Once Phase 2 ban enforcement lands (middleware honoring `banned_at`), the moderation ban can be refactored to call the new RPC but with a `p_caller_roles text[] := ARRAY['admin','moderator']` overload. Tracked as a known consolidation item, not a blocker.

**Rationale**: The moderation `banUserQuery` already uses `banned_expires_at`, not the new `banned_at` (by design — they represent different things; see R3). So the new RPC will be the first writer to `banned_at`, and the moderation path will start writing `banned_at` too in the follow-up so its bans also invalidate sessions correctly.

**Alternatives rejected**:

- _Fold moderation ban into admin_ban_user now_: risks regressing the content-moderation feature that just shipped; better handled as a deliberate consolidation PR.

---

## R9. Error code taxonomy surfaced to the frontend

**Decision**: Every RPC uses `RAISE EXCEPTION` with a fixed, documented code set. `errorHandler()` preserves the `code` field on `ApiResponseError` so the UI can branch and translate without parsing the message text.

Codes:

| Code                | Meaning                                                                                                                                            | Raised by                                         |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `NOT_AUTHENTICATED` | Caller has no Supabase session.                                                                                                                    | `authHandler()` (server action layer, before RPC) |
| `NOT_ADMIN`         | Authenticated caller is not an admin.                                                                                                              | Every RPC, first line.                            |
| `SELF_TARGET`       | Admin tried to act on their own account where the operation forbids it.                                                                            | change_role, ban, change_email                    |
| `LAST_ADMIN`        | Role change would leave zero admins.                                                                                                               | change_role                                       |
| `USER_NOT_FOUND`    | Target `user_id` does not exist.                                                                                                                   | All mutating RPCs                                 |
| `VALIDATION`        | Input violates a field-level rule (bad role value, empty reason, malformed email/url/phone, disallowed edit field). Accompanied by a `field` hint. | All RPCs                                          |
| `EMAIL_IN_USE`      | `change_email` target email already belongs to another user.                                                                                       | change_email                                      |
| `RATE_LIMITED`      | Mutation cap exceeded for this admin. Hint includes `reset_at`.                                                                                    | All mutating RPCs                                 |

**Rationale**: A small, closed code set keeps the client-side branching and translation files finite. `message` remains free-form for logs; the UI reads `code` for behavior and `errors` for field-level highlighting.

---

## R10. Non-goals (explicitly out of scope for Phase 1)

Recorded here so `/speckit.tasks` does not accidentally pull them in:

- Admin dashboard UI (Phases 3–5 in the source plan).
- Ban enforcement on live sessions / `/banned` page / login-time check (Phase 2).
- Persisted `admin_audit_log` writes (clarified out; only signatures stay audit-ready — see FR-063).
- Bulk operations (bulk role change, bulk ban) — the RPCs are single-target. A later phase may add bulk wrappers that call the single-target RPCs inside a transaction.
- Moderator-callable admin operations — moderators use their own moderation flows.
- Consolidation of `modules/content-moderation`'s `banUserQuery` into `admin_ban_user` (see R8).
