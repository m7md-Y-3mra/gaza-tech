# Research: Ban Enforcement (Auth Layer)

## Middleware Caching Strategy

**Decision**: Use a dedicated, signed cookie `sb-user-status` to cache the `is_active` status for 5 minutes.

**Rationale**:

- Prevents redundant database queries on every Next.js request.
- Middleware runs on every page load/navigation; caching is essential for performance (meeting SC-002).
- 5 minutes provides a reasonable balance between "immediate" ban enforcement and system load.

**Implementation Details**:

- Structure: `{ a: boolean, t: number }` (short keys to save cookie space). `a` = `is_active`, `t` = timestamp.
- On cache miss (or expiry):
  1. Fetch `is_active` from `public.users`.
  2. Update cookie with 5-minute TTL.

## Locale-Aware Redirects

**Decision**: Reuse the locale detection logic from `proxy.ts` and `rbacConfig`.

**Rationale**:

- Ensures consistency with existing routing behavior.
- Redirects to `/${locale}/banned` instead of just `/banned` to preserve user language.

## Server Action Integration

**Decision**: Add a blocking check in the `signIn` action before returning success.

**Rationale**:

- Prevents banned users from creating a new session, even if they have valid credentials.
- Returns a specific `CustomError` to be handled by the UI.

## Banned Page Structure

**Decision**: Implement as a Server Component in `modules/user/banned-page`.

**Rationale**:

- Follows Module-First architecture.
- Allows direct fetching of `ban_reason` from Supabase on the server side, ensuring the reason is shown even if the user is redirected before other client-side logic runs.
- Restricted session (Option B) allows the page to identify the user via `supabase.auth.getUser()`.

## Alternatives Considered

- **JWT Metadata**: Storing `is_active` in Supabase `user_metadata`.
  - _Rejected_: Requires manual metadata sync on every ban/unban; JWTs are harder to invalidate immediately than a side-cookie.
- **In-Memory Cache (Redis)**: Using Redis to store ban status.
  - _Rejected_: Adds infrastructure complexity and latency compared to a simple cookie-based cache for a basic boolean check.
