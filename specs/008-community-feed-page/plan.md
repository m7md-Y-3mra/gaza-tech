# Implementation Plan: Community Feed Page

**Branch**: `008-community-feed-page` | **Date**: 2026-04-06 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/008-community-feed-page/spec.md`

## Summary

Build the `/community` feed page: SSR-rendered first page with infinite scroll, category filtering and title-search persisted in the URL via `nuqs`, a "Create Post" entry point (desktop header button + mobile FAB), and a "Community" link added to the global navbar. Extends the existing `getCommunityFeedQuery` with search support (requires one Supabase RPC migration).

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 16 (App Router), React 19  
**Primary Dependencies**: `nuqs` ^2.8.8, `next-intl` ^4.7.0, `react-intersection-observer` ^10.0.2, shadcn/ui (radix), `lucide-react` ^0.562.0, Tailwind CSS ^4  
**Storage**: Supabase Postgres — `community_posts`, `community_posts_attachments`, `community_posts_likes`, `bookmarked_posts`; Supabase RPC `get_community_feed`  
**Testing**: `npm run check` (format + lint + type-check) before every commit  
**Target Platform**: Web (desktop + mobile, RTL-aware)  
**Project Type**: Next.js web application (App Router)  
**Performance Goals**: LCP < 2.5s, CLS < 0.1, FID < 100ms (Core Web Vitals SC-005)  
**Constraints**: Initial render must be SSR (server component reads `searchParams`); no client-side-only initial fetch; 300ms search debounce; filter state in URL  
**Scale/Scope**: Community feed page — one route, ~6 new components, one Supabase migration

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design._

| Gate                                  | Status | Notes                                                                                                            |
| ------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| **Module-first** (I)                  | ✅     | All new UI/logic lives in `modules/community/community-feed/`; route file is a thin wrapper                      |
| **Server-first** (II)                 | ✅     | Page is a server component; reads `searchParams` for SSR first batch; client sub-components hydrate afterward    |
| **No client-side initial fetch** (II) | ✅     | `getCommunityFeedQuery` called in the server page; client hook receives `initialItems` + `initialHasMore`        |
| **Incremental staged** (III)          | ✅     | Plan defines 10+ isolated stages; each = one commit                                                              |
| **Performance** (IV)                  | ✅     | SSR first page eliminates LCP risk; skeleton loader prevents CLS; no heavy client bundles for above-fold content |
| **Accessibility** (V)                 | ✅     | Semantic `<nav>`, `<ul>/<li>` for feed, `<button>` for FAB, visible focus states, keyboard-reachable tabs        |
| **Error handling** (VI)               | ✅     | `getCommunityFeedAction` already wrapped with `errorHandler()`; infinite scroll exposes error + retry            |

No violations — complexity tracking table not required.

## Project Structure

### Documentation (this feature)

```text
specs/008-community-feed-page/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── feed-api.md
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code

```text
# Supabase migration (search support)
supabase/migrations/
└── <timestamp>_add_search_to_get_community_feed.sql

# Schema extension
modules/community/
├── server-schema.ts          # MODIFIED: add search field to feedQuerySchema
├── queries.ts                # MODIFIED: pass p_search to RPC
└── actions.ts                # MODIFIED: expose search param in getCommunityFeedAction

# New page module
modules/community/community-feed/
├── types/
│   └── index.ts              # FeedFilters, FeedPageState
├── components/
│   ├── feed-filters/
│   │   ├── FeedFilters.tsx       # Client: category tabs + search input
│   │   ├── hooks/
│   │   │   └── useFeedFilters.ts # nuqs state, debounce logic
│   │   ├── constants.ts          # CATEGORY_TABS array
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── feed-list/
│   │   ├── FeedList.tsx          # Client: useInfiniteScroll + renders PostCards
│   │   └── index.ts
│   ├── feed-empty-state/
│   │   ├── FeedEmptyState.tsx    # Server-renderable: icon + message + CTA
│   │   └── index.ts
│   └── create-post-fab/
│       ├── CreatePostFab.tsx     # Client: fixed mobile FAB
│       └── index.ts
├── CommunityFeedPage.tsx         # Server component: SSR first page, assembles layout
└── index.ts

# Route (thin wrapper only)
app/[locale]/(main)/community/
└── page.tsx

# Navbar update
components/layout/navbar/constants.ts   # MODIFIED: add community link
components/layout/navbar/types/         # Possibly update NavLink if needed

# i18n
messages/en.json    # MODIFIED: add CommunityFeed, Navbar.community key
messages/ar.json    # MODIFIED: same in Arabic
```

**Structure Decision**: Single Next.js web application. All new source lives inside `modules/community/community-feed/` (page) and `modules/community/components/` (already has `post-card`). Route file is a one-liner delegating to `CommunityFeedPage`. Global files modified minimally: `server-schema.ts`, `queries.ts`, `actions.ts`, navbar constants, and i18n messages.
