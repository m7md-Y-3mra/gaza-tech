# Implementation Plan: Profile Community Posts Tab

**Branch**: `010-profile-community-tab` | **Date**: 2026-04-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-profile-community-tab/spec.md`

## Summary

Add a "My Posts" tab to the user profile page (`/profile/[userId]`) that lists the profile owner's published community posts, paginated with the existing profile pagination pattern. The tab is visible to everyone; the profile owner additionally sees Edit and Delete controls on each post (Delete gated by a confirmation dialog, same pattern as the Listings tab). Clicking a post card opens the existing post detail modal (from Phase 5 / feature 009). All server-side actions and queries already exist — this is a frontend-only feature that wires existing building blocks (`getUserCommunityPostsAction`, `deleteCommunityPostAction`, `PostCard`, `PostDetailModal`, `ProfilePagination`) into the profile tabs tree.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Next.js 16 (App Router), React 19, `next-intl` ^4.7.0, `nuqs` ^2.8.8 (profile page-param cache), `sonner` ^2.0.7, `lucide-react` ^0.562.0, shadcn/ui (radix Tabs, AlertDialog), Tailwind CSS ^4, `react-error-boundary`
**Storage**: N/A (consumes existing `getUserCommunityPostsAction` and `deleteCommunityPostAction`; no new DB work, no new queries)
**Testing**: Manual acceptance testing per the spec's user-story scenarios (4 stories, FR-001…FR-020)
**Target Platform**: Web (Next.js App Router, SSR for tab content, client components for interactive controls)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: First page visible < 2s on typical broadband (SC-002); successful delete reflected in the list < 1s (SC-004); Core Web Vitals ≥ 95%
**Constraints**: WCAG AA, keyboard-only navigable (SC-007), EN/AR i18n with RTL/LTR mirroring (SC-006), no draft posts surfaced (FR-003), no bypass of the delete confirmation (SC-008)
**Scale/Scope**: Single new tab, ~6 new files under `modules/user/profile/components/profile-tabs/profile-posts-tab/`, plus minor edits to the existing `ProfileTabs`, `ProfileTabsClient`, `ProfilePage`, i18n message files. Adds one thin signature extension to `getUserCommunityPostsQuery` to return `total_count` alongside `has_more` so the existing `ProfilePagination` (which requires `totalCount`) can be reused without a second request. No new routes.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                           | Status | Notes                                                                                                                                                                                                                                                                                |
| ----------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| I. Module-First Architecture        | PASS   | All new UI lives under `modules/user/profile/components/profile-tabs/profile-posts-tab/`. No global `app/` or `components/` additions. Data access stays in `modules/community/queries.ts` and `modules/community/actions.ts`.                                                       |
| II. Server-First Rendering          | PASS   | `ProfilePostsTab.tsx` is a server component that fetches data via `getUserCommunityPostsAction`. Client boundary (`ProfilePostsTabClient.tsx`) exists only for the Delete transition, AlertDialog state, and PostCard interactivity.                                                 |
| III. Incremental Staged Development | PASS   | Plan defines six staged commits: (1) query signature + type additions, (2) server+skeleton+error shells, (3) client list + pagination wiring, (4) owner edit/delete actions + AlertDialog, (5) ProfileTabs integration, (6) i18n + a11y polish. Each commit reviewable in isolation. |
| IV. Performance Standards           | PASS   | Server component fetches on the server, skeleton shown during Suspense (no CLS), no new heavy client bundles, delete uses `useTransition` + `useOptimistic` (same as listings tab) so perceived latency is sub-second.                                                               |
| V. Accessibility (WCAG AA)          | PASS   | Reuses shadcn `Tabs`, `AlertDialog`, `Pagination` primitives (already a11y-audited), all interactive elements get translated `aria-label`s, AlertDialog handles focus trap, keyboard-only delete flow is SC-007.                                                                     |
| VI. Consistent Error Handling       | PASS   | `deleteCommunityPostAction` is already wrapped with `errorHandler()`; UI reads `{ success, data?, message? }`. No new server actions introduced. Error state rendered via `react-error-boundary` + `ProfilePostsTabError`.                                                           |

No violations. No entries in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/010-profile-community-tab/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── server-actions.md  # Signatures of the server actions this feature consumes
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
modules/
├── user/
│   └── profile/
│       ├── ProfilePage.tsx                                      ← MODIFIED: pass postsContent to ProfileTabs
│       └── components/
│           └── profile-tabs/
│               ├── ProfileTabs.tsx                              ← MODIFIED: wire ProfilePostsTab inside Suspense+ErrorBoundary
│               ├── ProfileTabsClient.tsx                        ← MODIFIED: render new "My Posts" TabsTrigger + TabsContent
│               ├── types/
│               │   └── index.ts                                 ← MODIFIED: add postsContent to ProfileTabsClientProps
│               └── profile-posts-tab/                           ← NEW
│                   ├── types/
│                   │   └── index.ts                             ← prop types for server/client/error/skeleton
│                   ├── ProfilePostsTab.tsx                      ← server component (fetch + Suspense boundary surface)
│                   ├── ProfilePostsTabClient.tsx                ← client list + delete transition + pagination
│                   ├── ProfilePostsTabSkeleton.tsx              ← loading placeholder
│                   ├── ProfilePostsTabError.tsx                 ← ErrorBoundary fallback
│                   └── index.ts                                 ← barrel export
└── community/
    ├── queries.ts                                               ← MODIFIED: getUserCommunityPostsQuery returns total_count
    └── types/
        └── index.ts                                             ← MODIFIED: Page<T> adds optional total_count or new PageWithCount<T>

messages/
├── en.json                                                      ← MODIFIED: Profile.Tabs.myPosts + Profile.PostsTab.* keys
└── ar.json                                                      ← MODIFIED: same keys in Arabic
```

**Structure Decision**: Matches the existing mandatory module structure at `modules/user/profile/components/profile-tabs/`. The new sub-folder `profile-posts-tab/` mirrors the existing `profile-listings-tab/` and `profile-bookmark-tab/` shapes verbatim (server component, client component, skeleton, error, types, barrel). No cross-module duplication: the shared `PostCard` component from `modules/community/components/post-card/` is imported rather than re-implemented; delete and fetch actions come from `modules/community/actions.ts`. The sole change outside `modules/user/profile/` is a small, backwards-compatible signature addition to `getUserCommunityPostsQuery` in `modules/community/queries.ts` so its return shape carries a total row count alongside `has_more` (required for the existing `ProfilePagination` component). All other Phase 6 work stays inside the profile module.

## Complexity Tracking

> No constitutional violations. Table intentionally empty.
