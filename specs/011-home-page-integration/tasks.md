# Tasks: Home Page Integration

**Input**: Design documents from `/specs/011-home-page-integration/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped into Setup, Foundational, User Story, and Polish phases.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1)
- Include exact file paths in descriptions

## Important Context for Implementation

### Existing Code You Will Reuse (DO NOT recreate these)

1. **`getListingsAction`** — already exists in `modules/listings/actions.ts` (line 119). It wraps `getListingsQuery` with `errorHandler`. It accepts `{ filters, page, limit }` and returns `{ data: ListingCardItem[], count: number }`.

2. **`getCommunityFeedAction`** — already exists in `modules/community/actions.ts` (line 87). It wraps `getCommunityFeedQuery` with `errorHandler`. It accepts `{ page, limit, category?, search? }` and returns `{ data: FeedPost[], has_more: boolean, next_page: number | null, total_count: number }`.

3. **`ListingsGrid`** — already exists in `modules/listings/home/components/listings-grid/ListingsGrid.tsx`. It accepts `{ listings: ListingCardItem[], className?: string }` and renders listing cards in a responsive grid.

4. **`PostCard`** — already exists in `modules/community/components/post-card/PostCard.tsx`. It is a `'use client'` component that accepts `{ post: FeedPost }`. Export: `import { PostCard } from '@/modules/community/components/post-card'`.

5. **`PostCardSkeleton`** — already exists in `modules/community/components/post-card/PostCardSkeleton.tsx`. Export: `import { PostCardSkeleton } from '@/modules/community/components/post-card'`.

6. **`ListingCardItem`** type — exported from `modules/listings/queries.ts`.

7. **`FeedPost`** type — exported from `modules/community/types/index.ts`.

### Translation Keys Already Existing

- `"HomePage": { "title": "Hello world!" }` in both `messages/en.json` (line 41) and `messages/ar.json` (line 41). You will **replace** the content of this `"HomePage"` object with the new keys.

### Current Home Page Route

- `app/[locale]/(main)/page.tsx` currently imports and renders `<ListingsPage />`. You will **replace** this entire file to render `<HomePage />` instead.

---

## Phase 1: Setup (Module Scaffolding)

**Purpose**: Create the `modules/home/` directory structure and all empty files.

- [x] T001 Create the following directory structure and files (all files can be empty initially, they will be filled in subsequent tasks):

  ```
  modules/home/
  ├── components/
  │   ├── latest-listings/
  │   │   ├── LatestListings.tsx
  │   │   ├── LatestListingsSkeleton.tsx
  │   │   └── index.ts
  │   └── community-highlights/
  │       ├── CommunityHighlights.tsx
  │       ├── CommunityHighlightsSkeleton.tsx
  │       └── index.ts
  ├── HomePage.tsx
  └── index.ts
  ```

  **What each `index.ts` re-export file must contain:**
  - `modules/home/index.ts`: `export { default } from './HomePage';`
  - `modules/home/components/latest-listings/index.ts`: `export { LatestListings } from './LatestListings'; export { LatestListingsSkeleton } from './LatestListingsSkeleton';`
  - `modules/home/components/community-highlights/index.ts`: `export { CommunityHighlights } from './CommunityHighlights'; export { CommunityHighlightsSkeleton } from './CommunityHighlightsSkeleton';`

---

## Phase 2: Foundational (Translation Keys)

**Purpose**: Add all translation keys needed for the home page before building UI.

⚠️ **CRITICAL**: No UI work can begin until this phase is complete.

- [x] T002 Update the `"HomePage"` object in `messages/en.json` (line 41-43). **Replace** the existing `"HomePage": { "title": "Hello world!" }` with:

  ```json
  "HomePage": {
    "title": "Welcome to Gaza Tech",
    "latestListings": "Latest Listings",
    "communityHighlights": "Community Highlights",
    "viewAll": "View All",
    "emptyListings": "No listings yet",
    "emptyPosts": "No community posts yet",
    "errorListings": "Failed to load listings",
    "errorPosts": "Failed to load community posts"
  }
  ```

- [x] T003 Update the `"HomePage"` object in `messages/ar.json` (line 41-43). **Replace** the existing `"HomePage": { "title": "مرحبا بالعالم!" }` with:

  ```json
  "HomePage": {
    "title": "مرحباً بك في غزة تك",
    "latestListings": "أحدث الإعلانات",
    "communityHighlights": "أبرز منشورات المجتمع",
    "viewAll": "عرض الكل",
    "emptyListings": "لا توجد إعلانات بعد",
    "emptyPosts": "لا توجد منشورات بعد",
    "errorListings": "فشل تحميل الإعلانات",
    "errorPosts": "فشل تحميل منشورات المجتمع"
  }
  ```

**Checkpoint**: Translation keys ready — UI implementation can begin.

---

## Phase 3: User Story 1 — Explore marketplace and community from the home page (Priority: P1) 🎯 MVP

**Goal**: Users visiting `/` see a "Latest Listings" section (4 items) and a "Community Highlights" section (3 items), each with a "View All" link.

**Independent Test**: Visit `http://localhost:3000/` — two distinct sections should render independently with loading skeletons, and "View All" links should navigate correctly.

### Implementation for User Story 1

- [x] T004 [P] [US1] Create the `LatestListingsSkeleton` component in `modules/home/components/latest-listings/LatestListingsSkeleton.tsx`.

  **This is a Server Component (NO `'use client'` directive).**

  It should render a skeleton matching the `ListingsGrid` layout: a `div` with `className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"` containing 4 skeleton cards. Each skeleton card should have:
  - A gray animated `div` for the image area (aspect-video, rounded-lg)
  - A gray animated `div` for the title (h-4, w-3/4)
  - A gray animated `div` for the price (h-4, w-1/4)

  Use `animate-pulse` and `bg-muted` for skeleton styling (Tailwind classes).

  Export as a named export: `export function LatestListingsSkeleton() { ... }`

- [x] T005 [P] [US1] Create the `CommunityHighlightsSkeleton` component in `modules/home/components/community-highlights/CommunityHighlightsSkeleton.tsx`.

  **This is a Server Component (NO `'use client'` directive).**

  Render 3 skeleton cards in a `div` with `className="grid grid-cols-1 gap-6"`. Each skeleton card should mimic the PostCard layout:
  - A gray `div` for the header (avatar circle + name line)
  - A gray `div` for the title (h-4, w-2/3)
  - Two gray `div` lines for content (h-3, w-full)

  Use `animate-pulse` and `bg-muted` for skeleton styling.

  Export as a named export: `export function CommunityHighlightsSkeleton() { ... }`

- [x] T006 [US1] Create the `LatestListings` server component in `modules/home/components/latest-listings/LatestListings.tsx`.

  **This is an async Server Component (NO `'use client'` directive).** Here is exactly what to write:

  ```tsx
  import { getListingsAction } from '@/modules/listings/actions';
  import ListingsGrid from '@/modules/listings/home/components/listings-grid';
  import { getTranslations } from 'next-intl/server';

  export async function LatestListings() {
    const t = await getTranslations('HomePage');
    const result = await getListingsAction({
      filters: {},
      page: 1,
      limit: 4,
    });

    if (
      !result.success ||
      !result.data?.data ||
      result.data.data.length === 0
    ) {
      return (
        <div className="border-muted-foreground/25 flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-muted-foreground">{t('emptyListings')}</p>
        </div>
      );
    }

    return <ListingsGrid listings={result.data.data} />;
  }
  ```

  **Important notes:**
  - `getListingsAction` returns `{ success, data: { data: ListingCardItem[], count }, message }` because it's wrapped with `errorHandler`.
  - `ListingsGrid` is a default export, so import with `import ListingsGrid from '...'`.
  - Use `getTranslations` (server-side, from `next-intl/server`) NOT `useTranslations`.

- [x] T007 [US1] Create the `CommunityHighlights` server component in `modules/home/components/community-highlights/CommunityHighlights.tsx`.

  **This is an async Server Component (NO `'use client'` directive).** Here is exactly what to write:

  ```tsx
  import { getCommunityFeedAction } from '@/modules/community/actions';
  import { PostCard } from '@/modules/community/components/post-card';
  import { getTranslations } from 'next-intl/server';

  export async function CommunityHighlights() {
    const t = await getTranslations('HomePage');
    const result = await getCommunityFeedAction({
      page: 1,
      limit: 3,
    });

    if (
      !result.success ||
      !result.data?.data ||
      result.data.data.length === 0
    ) {
      return (
        <div className="border-muted-foreground/25 flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-muted-foreground">{t('emptyPosts')}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6">
        {result.data.data.map((post) => (
          <PostCard key={post.post_id} post={post} />
        ))}
      </div>
    );
  }
  ```

  **Important notes:**
  - `getCommunityFeedAction` returns `{ success, data: { data: FeedPost[], has_more, next_page, total_count }, message }`.
  - `PostCard` is a `'use client'` component but can be rendered as a child of a server component (Next.js handles the boundary automatically).

- [x] T008 [US1] Create the main `HomePage` component in `modules/home/HomePage.tsx`.

  **This is an async Server Component (NO `'use client'` directive).** It composes the two sections with independent `Suspense` boundaries. Here is exactly what to write:

  ```tsx
  import { Suspense } from 'react';
  import Link from 'next/link';
  import { getTranslations } from 'next-intl/server';
  import { LatestListings } from './components/latest-listings';
  import { LatestListingsSkeleton } from './components/latest-listings';
  import { CommunityHighlights } from './components/community-highlights';
  import { CommunityHighlightsSkeleton } from './components/community-highlights';

  export default async function HomePage() {
    const t = await getTranslations('HomePage');

    return (
      <div className="container mx-auto space-y-12 px-4 py-8">
        {/* Latest Listings Section */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">{t('latestListings')}</h2>
            <Link
              href="/listings"
              className="text-primary text-sm font-medium hover:underline"
            >
              {t('viewAll')} →
            </Link>
          </div>
          <Suspense fallback={<LatestListingsSkeleton />}>
            <LatestListings />
          </Suspense>
        </section>

        {/* Community Highlights Section */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">{t('communityHighlights')}</h2>
            <Link
              href="/community"
              className="text-primary text-sm font-medium hover:underline"
            >
              {t('viewAll')} →
            </Link>
          </div>
          <Suspense fallback={<CommunityHighlightsSkeleton />}>
            <CommunityHighlights />
          </Suspense>
        </section>
      </div>
    );
  }
  ```

  **Important notes:**
  - Each section is wrapped in its own `<Suspense>` so they load and fail independently (FR-005).
  - `Link` from `next/link` handles locale-aware routing automatically (locale prefix is applied by `next-intl` middleware).
  - Uses `getTranslations` from `next-intl/server` (server component pattern).

- [x] T009 [US1] Update the route page at `app/[locale]/(main)/page.tsx` to render `<HomePage />` instead of `<ListingsPage />`.

  **Replace the ENTIRE file content** with:

  ```tsx
  import HomePage from '@/modules/home';

  export const revalidate = 60;

  export default function Page() {
    return <HomePage />;
  }
  ```

  **Important notes:**
  - `export const revalidate = 60;` enables ISR with 60-second revalidation (FR-007).
  - The old imports (`ListingsPage`, `listingsSearchParamsCache`, `SearchParams`, `nuqs`) are all removed because the home page no longer needs search params.
  - The full listings page is already accessible at `app/[locale]/(main)/listings/page.tsx`, so removing it from the root route doesn't break anything.

**Checkpoint**: At this point, visiting `/` should display both sections with loading skeletons, data, empty states, and "View All" links.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Error boundaries, accessibility, and final quality checks.

- [x] T010 [US1] Add Error Boundaries for both sections in `modules/home/HomePage.tsx`.

  **What to do:** Create a small `'use client'` error boundary component. Create a new file `modules/home/components/section-error-boundary/SectionErrorBoundary.tsx`:

  ```tsx
  'use client';

  import { Component, type ReactNode, type ErrorInfo } from 'react';

  type Props = {
    fallbackMessage: string;
    children: ReactNode;
  };

  type State = {
    hasError: boolean;
  };

  export class SectionErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
      return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
      console.error('SectionErrorBoundary caught:', error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="border-destructive/25 bg-destructive/5 flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
            <p className="text-destructive">{this.props.fallbackMessage}</p>
          </div>
        );
      }
      return this.props.children;
    }
  }
  ```

  Then update `modules/home/HomePage.tsx` to wrap each `<Suspense>` block with `<SectionErrorBoundary>`:

  ```tsx
  <SectionErrorBoundary fallbackMessage={t('errorListings')}>
    <Suspense fallback={<LatestListingsSkeleton />}>
      <LatestListings />
    </Suspense>
  </SectionErrorBoundary>
  ```

  Do the same for the community section using `t('errorPosts')`.

  **Don't forget**: Add `import { SectionErrorBoundary } from './components/section-error-boundary/SectionErrorBoundary';` to `HomePage.tsx`. Also create `modules/home/components/section-error-boundary/index.ts` with `export { SectionErrorBoundary } from './SectionErrorBoundary';`.

- [x] T011 Add semantic HTML and accessibility attributes to `modules/home/HomePage.tsx`.

  Ensure:
  - Each `<section>` has an `aria-labelledby` pointing to its heading's `id` (e.g., `id="latest-listings-heading"` and `aria-labelledby="latest-listings-heading"`).
  - The "View All" links have `aria-label` attributes (e.g., `aria-label={t('viewAll') + ' - ' + t('latestListings')}`).
  - The page uses a `<main>` wrapper if not already provided by the layout.

- [x] T012 Run `npm run check` (format + lint + type-check) from the project root and fix any errors.

  Run the command: `npm run check`

  If there are TypeScript errors, fix them. Common issues:
  - Missing type imports
  - Incorrect Server/Client component usage
  - Missing exports in `index.ts` files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: No dependencies — can run in parallel with Phase 1
- **User Story 1 (Phase 3)**: Depends on Phase 1 (files exist) and Phase 2 (translation keys exist)
- **Polish (Phase 4)**: Depends on Phase 3 completion

### Within User Story 1

- T004 and T005 (skeletons) can run in **parallel** — they are in different files
- T006 depends on T004 (skeleton used as Suspense fallback, but actually this is in T008)
- T007 depends on T005 (same reasoning)
- T008 depends on T006 + T007 (imports both sections)
- T009 depends on T008 (imports HomePage)

### Parallel Opportunities

```bash
# These can run in parallel:
T002 + T003  (en.json and ar.json are separate files)
T004 + T005  (skeletons are in separate files)
T006 + T007  (section components are in separate files)
```

---

## Implementation Strategy

### MVP First (Complete in Order)

1. ✅ Phase 1: T001 (scaffold)
2. ✅ Phase 2: T002 + T003 (translations)
3. ✅ Phase 3: T004 → T005 → T006 → T007 → T008 → T009
4. **STOP and VALIDATE**: Run `npm run dev`, visit `/`, verify both sections render
5. ✅ Phase 4: T010 → T011 → T012

---

## Notes

- [P] tasks = different files, no dependencies
- [US1] = all tasks map to User Story 1 (there is only one user story for this feature)
- Every file path is relative to the repository root: `/home/m7md/a/gaza-tech/front-end-agy/`
- Server Components: NO `'use client'` directive, use `getTranslations` from `next-intl/server`
- Client Components: MUST have `'use client'` directive, use `useTranslations` from `next-intl`
- ISR: Set `export const revalidate = 60;` in the route page file
- Commit after each task or logical group using Conventional Commits format
