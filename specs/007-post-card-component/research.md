# Research: Post Card Component

**Feature**: 007-post-card-component
**Date**: 2026-04-06

## R-001: Optimistic UI Pattern for Like/Bookmark in React 19

**Decision**: Use local `useState` for optimistic state with `useRef` for in-flight tracking. No `useOptimistic` from React 19 (it's tied to form actions and `useFormState`, which doesn't fit button-click semantics).

**Rationale**: The card's like/bookmark actions are button clicks, not form submissions. A simple pattern of:

1. Store previous state in a ref
2. Update local state immediately (optimistic)
3. Call server action
4. On failure: revert to previous state + show error toast
5. Use a `ref` boolean to track in-flight status and ignore rapid clicks

This is the most straightforward approach and avoids over-engineering with `useTransition` or external state libraries.

**Alternatives considered**:

- `useOptimistic` (React 19): Designed for form actions with `useActionState`, not standalone button clicks. Would add unnecessary complexity.
- SWR/React Query mutation: Overkill for a single toggle; the card doesn't own data fetching.
- Parent state lifting: Breaks the self-contained card contract; the spec explicitly requires the card to manage its own optimistic state.

## R-002: Supabase Browser Client Auth Hook (`useCurrentUser`)

**Decision**: Create a lightweight hook in `hooks/use-current-user.ts` that calls `supabase.auth.getUser()` on mount and returns `{ user, isLoading }`.

**Rationale**: The spec requires the card to internally determine auth state without a viewer prop. The Supabase browser client (`createBrowserClient`) is already configured at `lib/supabase/client.ts`. The hook:

1. Creates a Supabase browser client instance
2. Calls `getUser()` once on mount
3. Returns `{ user: User | null, isLoading: boolean }`
4. While loading, like/bookmark clicks are ignored (per spec)

**Alternatives considered**:

- React Context provider wrapping the app: More infrastructure than needed; the Supabase client already caches the session. Could be added later if multiple components need reactive auth state.
- `onAuthStateChange` listener: Adds complexity; the card only needs a snapshot, not real-time auth changes. The spec says "compute once" is fine.
- Server component prop drilling: Explicitly rejected by the spec — no viewer prop on the card.

## R-003: date-fns Locale-Aware Relative Time with 7-Day Threshold

**Decision**: Use `date-fns/formatDistanceToNow` with `{ addSuffix: true, locale }` for posts < 7 days old. For posts ≥ 7 days, use `date-fns/format` with a short date pattern (`'MMM d, yyyy'` for en, `'d MMMM yyyy'` for ar).

**Rationale**: `date-fns` v4 is already installed (^4.1.0) and used in `utils/date.utils.ts`. The existing `formatMemberSince` utility uses `formatDistanceToNow` with locale support. The 7-day threshold is a simple `Date.now() - publishedAt < 7 * 86400000` check. Both formatting paths support Arabic locale natively via `date-fns/locale/ar`.

**Alternatives considered**:

- `Intl.RelativeTimeFormat`: More manual calculation needed to determine "hours ago" vs "days ago" buckets. `date-fns` handles this automatically.
- `timeago.js`: New dependency; `date-fns` already covers this.

## R-004: Compact Number Formatting

**Decision**: Use `Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 })` as specified.

**Rationale**: Native browser API, zero dependency, locale-aware (Arabic compact notation is built-in). Spec explicitly mandates this exact API.

**Alternatives considered**: None — the spec is prescriptive.

## R-005: Category Badge Color Mapping

**Decision**: Define a constant map in `constants.ts`:

- `questions` → `bg-blue-100 text-blue-700` (dark: `bg-blue-900/30 text-blue-300`)
- `tips` → `bg-green-100 text-green-700` (dark: `bg-green-900/30 text-green-300`)
- `news` → `bg-amber-100 text-amber-700` (dark: `bg-amber-900/30 text-amber-300`)
- `troubleshooting` → `bg-red-100 text-red-700` (dark: `bg-red-900/30 text-red-300`)

**Rationale**: Using existing Tailwind utility classes with light/dark variants. All combinations meet WCAG AA 4.5:1 contrast ratio. No new design tokens. The existing `Badge` component from shadcn can be extended with custom className or a simple `<span>` with these classes.

**Alternatives considered**:

- Adding new shadcn badge variants: Would modify the shared component for a domain-specific need. Better to use className overrides or a local component.
- CSS custom properties: Unnecessary given Tailwind's built-in palette.

## R-006: Avatar Fallback with Deterministic Color

**Decision**: Hash the display name using a simple string hash (sum of char codes modulo 6) to pick from the 6-color palette. Render initials in a `<div>` with `rounded-full` and the selected background color.

**Rationale**: The spec defines exactly 6 colors (`slate-500`, `red-500`, `amber-500`, `emerald-500`, `sky-500`, `violet-500`) with white text. A simple hash ensures the same author always gets the same color. All 6 background colors at 500-weight with white text exceed 4.5:1 contrast.

**Alternatives considered**:

- `crypto.subtle.digest`: Overkill for a 6-bucket hash; also async.
- Random color: Not deterministic per spec.

## R-007: Clipboard API with Fallback

**Decision**: Use `navigator.clipboard.writeText()` in a try/catch. On success: `toast.success(t('PostCard.shareCopied'))`. On failure: `toast.error(t('PostCard.shareError'))`.

**Rationale**: The Clipboard API is supported in all modern browsers. The fallback path is simply a user-facing error toast — no `document.execCommand('copy')` fallback (deprecated and unreliable). The spec accepts graceful degradation.

**Alternatives considered**:

- `document.execCommand('copy')`: Deprecated, removed from standards.
- Third-party clipboard library: Unnecessary for a single `writeText` call.

## R-008: Sign-In Redirect Pattern for Guests

**Decision**: When an unauthenticated user clicks like/bookmark, use `router.push()` to navigate to the sign-in page with a `redirect` query parameter:

```
/[locale]/login?redirect=<encodeURIComponent(pathname + search)>
```

**Rationale**: The spec mandates `?redirect=<encoded locale-prefixed pathname+search>` and requires the value to start with `/` (same-origin). The login page must validate this — that validation is out of scope for the card but the card must produce correct URLs. The existing login form redirects to `/` on success; the `redirect` param support in the login page will need to be added (or is already planned for a future phase). The card's responsibility is only to construct and navigate to the correct URL.

**Alternatives considered**:

- Storing return URL in session storage: Less portable; URL-based is standard.
- Modal login: Not in scope; the spec says redirect.
