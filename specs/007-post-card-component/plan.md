# Implementation Plan: Post Card Component

**Branch**: `007-post-card-component` | **Date**: 2026-04-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-post-card-component/spec.md`

## Summary

Build a reusable `PostCard` client component and a server-renderable `PostCardSkeleton` inside the community module. The card renders a single flattened `FeedPost` with author header, category badge, title, content preview, attachment indicator, and an action bar (like, comment, bookmark, share). Like and bookmark use optimistic UI with rollback on failure. A shared `useCurrentUser` hook gates authenticated-only actions by redirecting guests to sign-in. All text is i18n-ready (EN + AR, RTL-safe).

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 16, React 19
**Primary Dependencies**: `next-intl` ^4.7.0, `date-fns` ^4.1.0, `lucide-react` ^0.562.0, `sonner` ^2.0.7, `@supabase/supabase-js` ^2.86.0, shadcn/ui (radix), Tailwind CSS ^4
**Storage**: N/A (consumes existing server actions; no new DB work)
**Testing**: Manual verification + Lighthouse audit + accessibility checks
**Target Platform**: Web (desktop + mobile), LTR + RTL
**Project Type**: Next.js App Router web application (community module)
**Performance Goals**: LCP < 2.5s, FID < 100ms, CLS < 0.1; skeleton must cause zero CLS on swap
**Constraints**: Single `'use client'` component; skeleton must be server-renderable; no new design tokens
**Scale/Scope**: 1 module, ~6-8 new files, consumed by community feed + profile + home highlights

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle | Status | Notes |
|---|---|---|
| I. Module-First Architecture | ✅ PASS | Component lives in `modules/community/components/post-card/`. Route files untouched. |
| II. Server-First Rendering | ✅ PASS | `PostCard` is `'use client'` only because it manages interactive state (like, bookmark, auth check). `PostCardSkeleton` is server-renderable. No client-side data fetching. |
| III. Incremental Staged Development | ✅ PASS | Tasks will be split into small stages: skeleton → static card layout → category badge → action bar → optimistic logic → auth gating → i18n → a11y. |
| IV. Performance Standards | ✅ PASS | Skeleton prevents CLS. No heavy dependencies. `next/dynamic` not needed (card is lightweight). Compact number formatting avoids layout reflows. |
| V. Accessibility (WCAG AA) | ✅ PASS | Semantic HTML (`<h3>`, `<button>`, `<a>`), keyboard-reachable actions, visible focus states, ARIA labels, 4.5:1 contrast on all badge colors. |
| VI. Consistent Error Handling | ✅ PASS | Server actions already wrapped with `errorHandler()`. Card uses `toast.error()` for failures. |

**Result**: All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/007-post-card-component/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
modules/community/
├── components/
│   └── post-card/
│       ├── PostCard.tsx              # Main client component ('use client')
│       ├── PostCardSkeleton.tsx      # Server-renderable skeleton
│       ├── index.ts                  # Public exports
│       ├── constants.ts              # Category color map, avatar palette, time threshold
│       ├── types/
│       │   └── index.ts              # PostCardProps, CategoryColorMap types
│       └── hooks/
│           └── usePostCard.ts        # Optimistic like/bookmark, share, auth-gating logic
├── constant.ts                       # (existing) DELETED_USER_NAME_KEY
├── types/
│   └── index.ts                      # (existing) FeedPost, AuthorStub, etc.
├── queries.ts                        # (existing) unchanged
└── actions.ts                        # (existing) unchanged

hooks/
└── use-current-user.ts               # NEW shared hook: Supabase browser client auth

messages/
├── en.json                           # Add PostCard.* keys
└── ar.json                           # Add PostCard.* keys
```

**Structure Decision**: All card code lives inside the community module under `components/post-card/`. The `useCurrentUser` hook is shared (reusable by later phases) and lives in the global `hooks/` directory. No new routes, no new pages, no changes to existing server logic.

## Implementation Notes

### Avatar Color Hash

The deterministic avatar background color uses a simple char-code-sum hash:

```typescript
function getAvatarColorIndex(name: string): number {
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return sum % AVATAR_PALETTE.length; // AVATAR_PALETTE.length === 6
}
```

This is intentionally simple — no cryptographic hash needed. The only requirement is that the same name always produces the same index.

### Guest Sign-in Redirect

```typescript
// In usePostCard handleLike / handleBookmark:
const locale = useLocale(); // from next-intl
const pathname = window.location.pathname + window.location.search;
router.push(`/${locale}/login?redirect=${encodeURIComponent(pathname)}`);
```

The login page is responsible for validating that `redirect` starts with `/` (open-redirect prevention). The card only constructs the URL.

## Complexity Tracking

> No violations to justify — all gates pass.
