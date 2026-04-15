# Tasks: Community Feed Page

**Input**: Design documents from `/specs/008-community-feed-page/`  
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/feed-api.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)

## Phase 1: Setup (Shared Infrastructure)

- [x] **[T001]** **[Setup]** Add `CommunityFeed` i18n namespace to `messages/en.json` (meta, pageTitle, filters, emptyState, errorState) and `Navbar.community` key.
- [x] **[T002]** **[Setup]** Add `CommunityFeed` i18n namespace to `messages/ar.json` and `Navbar.community` key.
- [x] **[T003]** **[Setup]** Create community-feed module types file at `modules/community/community-feed/types/index.ts`.
- [x] **[T004]** **[Setup]** Create community-feed module barrel at `modules/community/community-feed/index.ts` (export `CommunityFeedPage`).

## Phase 2: Foundational (Blocking Prerequisites)

- [x] **[T005]** **[P]** **[Foundational]** Add `search` field to `feedQuerySchema` in `modules/community/server-schema.ts`.
- [x] **[T006]** **[P]** **[Foundational]** Pass `p_search` to `get_community_feed` RPC call in `modules/community/queries.ts`. (Requires DB migration first).
- [x] **[T007]** **[P]** **[Foundational]** Create the nuqs search-params definition file at `modules/community/community-feed/search/index.ts`.

## Phase 3: User Story 1 — Browse Community Feed (Priority: P1)

- [x] **[T008]** **[US1]** Create `CommunityFeedPage` at `modules/community/community-feed/CommunityFeedPage.tsx` (SSR initial fetch + FeedList + placeholders).
- [x] **[T009]** **[US1]** Create the route file at `app/[locale]/(main)/community/page.tsx` that calls `CommunityFeedPage`.
- [x] **[T010]** **[US1]** Create `FeedList` component at `modules/community/community-feed/components/feed-list/FeedList.tsx` (useInfiniteScroll + PostCard).
- [x] **[T011]** **[US1]** Complete US1 implementation: Ensure `FeedList` correctly handles filter changes (re-fetch when nuqs states change).

## Phase 4: User Story 2 — Filter Posts by Category (Priority: P2)

- [x] **[T012]** **[US2]** Create `FeedFilters` constants at `modules/community/community-feed/components/feed-filters/constants.ts` (CATEGORY_TABS).
- [x] **[T013]** **[US2]** Create `useFeedFilters` hook at `modules/community/community-feed/components/feed-filters/hooks/useFeedFilters.ts` (nuqs sync + 300ms debounce).
- [x] **[T014]** **[US2]** Create `FeedFilters` component at `modules/community/community-feed/components/feed-filters/FeedFilters.tsx` (horizontal tabs + search input).
- [x] **[T015]** **[US2]** Wire `FeedFilters` into `CommunityFeedPage` and ensure it triggers `FeedList` refresh.

## Phase 5: User Story 3 — Search Posts by Title (Priority: P2)

- [x] **[Search logic is integrated within Phase 2 & Phase 4 tasks.]**

## Phase 6: User Story 4 — Create a New Post (Priority: P2)

- [x] **[T016]** **[US4]** Create `FeedEmptyState` component at `modules/community/community-feed/components/feed-empty-state/FeedEmptyState.tsx`.
- [x] **[T017]** **[US4]** Wire `FeedEmptyState` into `FeedList` (show when items.length === 0).
- [x] **[T018]** **[US4]** Create `CreatePostFab` component at `modules/community/community-feed/components/create-post-fab/CreatePostFab.tsx`.
- [x] **[T019]** **[US4]** Wire `CreatePostFab` into `CommunityFeedPage`.

## Phase 7: User Story 5 — Discover Community via Navigation (Priority: P3)

- [x] **[T020]** **[US5]** Add "Community" link to navbar constants in `components/layout/navbar/constants.ts`.

## Phase 8: Polish & Cross-Cutting Concerns

- [x] **[T021]** **[SEO]** Add `generateMetadata` for SEO to `app/[locale]/(main)/community/page.tsx`.
- [x] **[T022]** **[QA]** Run `npm run check` and fix any lint/type/format errors.
