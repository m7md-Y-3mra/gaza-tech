# Feature Specification: Community Feed Page

**Feature Branch**: `008-community-feed-page`  
**Created**: 2026-04-06  
**Status**: Draft  
**Input**: User description: "Read @CHAT.md and create specification for PHASE 4 - community-feed-page"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Browse Community Feed (Priority: P1)

A registered user visits the `/community` page and sees a paginated feed of published community posts. As they scroll down the page, more posts automatically load without any manual interaction.

**Why this priority**: This is the core value of the page — users must be able to discover and read community content. Without it, the page has no purpose.

**Independent Test**: Navigate to `/community`, verify posts render as cards, scroll to the bottom, and confirm additional posts load automatically.

**Acceptance Scenarios**:

1. **Given** a user navigates to `/community`, **When** the page loads, **Then** the first page of published posts is displayed as a list of post cards in reverse-chronological order.
2. **Given** a user has scrolled to the bottom of the loaded posts, **When** more posts are available, **Then** additional posts are loaded automatically and appended to the list without a page reload.
3. **Given** all posts have been loaded, **When** the user reaches the end of the list, **Then** no further loading occurs and no spinner is shown.

---

### User Story 2 - Filter Posts by Category (Priority: P2)

A registered user wants to narrow down the feed to a specific topic. They click a category tab (Questions, Tips, News, Troubleshooting) to see only posts of that type.

**Why this priority**: Without filtering, users must scroll through all content to find what they care about. Category filtering significantly improves discoverability.

**Independent Test**: Click the "Questions" tab and verify only posts with category "questions" are shown.

**Acceptance Scenarios**:

1. **Given** the feed page is open, **When** the user clicks a category tab (e.g., "Questions"), **Then** the feed refreshes and shows only posts matching that category.
2. **Given** a category tab is active, **When** the user clicks the "All" tab, **Then** the category filter is cleared and all posts are shown again.
3. **Given** a category filter is applied, **When** the user scrolls down, **Then** infinite scroll continues to load more posts matching that category.
4. **Given** a filtered category has no posts, **When** the tab is selected, **Then** an empty state is shown with a message and a CTA to create the first post.

---

### User Story 3 - Search Posts (Priority: P3)

A registered user types keywords into the search bar to find posts by title.

**Why this priority**: Search complements filtering by allowing freeform discovery. It is less critical than browsing and category filtering but meaningfully improves UX.

**Independent Test**: Type a keyword in the search bar, wait for debounce, and verify that only posts whose title contains that keyword are shown.

**Acceptance Scenarios**:

1. **Given** the user types a keyword in the search bar, **When** a short debounce period passes, **Then** the feed updates to show only posts whose title matches the search term.
2. **Given** an active search yields no results, **When** the feed renders, **Then** an empty state with a clear message is displayed.
3. **Given** the user clears the search input, **When** the debounce passes, **Then** the full (optionally filtered by category) feed is restored.
4. **Given** both a category filter and a search term are active, **When** the feed renders, **Then** results satisfy both constraints simultaneously.

---

### User Story 4 - Create a New Post (Priority: P2)

A registered user wants to contribute to the community. On desktop they see an inline "Create Post" button in the page header; on mobile they tap a floating action button (FAB).

**Why this priority**: The feed page is also the entry point for content creation. Without this, the community cannot grow.

**Independent Test**: Click the create button on desktop and the FAB on mobile, and confirm navigation to the post creation page.

**Acceptance Scenarios**:

1. **Given** a user is on the feed page on a desktop viewport, **When** they click the "Create Post" button in the header, **Then** they are navigated to the post creation page.
2. **Given** a user is on the feed page on a mobile viewport, **When** they tap the floating action button, **Then** they are navigated to the post creation page.
3. **Given** a user is on a mobile viewport, **When** they scroll the feed, **Then** the FAB remains fixed and does not fully obstruct feed content.

---

### User Story 5 - Discover Community via Navigation (Priority: P3)

A registered user accesses the community feed directly from the main navigation bar.

**Why this priority**: Without a navbar entry, users cannot discover the community section unless they know the direct URL.

**Independent Test**: Load any page in the app, find the "Community" link in the navbar, click it, and verify navigation to `/community`.

**Acceptance Scenarios**:

1. **Given** a registered user is on any page, **When** they click the "Community" link in the navbar, **Then** they are taken to `/community`.
2. **Given** the user is on the community page, **When** the navbar is visible, **Then** the "Community" link is visually indicated as the active route.

---

### Edge Cases

- What happens when the network fails during infinite scroll load? The feed shows an error state with a descriptive message; previously loaded posts remain visible.
- What happens when no posts match the active category and search combination? An empty state with a message and a "Create Post" CTA is shown.
- What happens when the initial server fetch returns zero posts? The empty state is displayed immediately without a loading flicker.
- What happens when the user changes the category filter while a scroll-triggered fetch is in progress? The in-flight request is discarded, state resets, and a new fetch for the new filter begins.
- What happens on slow connections? A skeleton loader matching the post card layout is shown while posts are loading.

## Clarifications

### Session 2026-04-06

- Q: What is the search debounce duration? → A: 300ms (immediate update on clear)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST render the community feed at `/community` showing published posts in reverse-chronological order.
- **FR-002**: The system MUST automatically load the next page of posts when the user scrolls near the bottom of the current list (infinite scroll).
- **FR-003**: The system MUST provide horizontally scrollable category filter tabs: All, Questions, Tips, News, Troubleshooting. The active tab MUST be visually highlighted.
- **FR-004**: Selecting a category tab MUST filter the feed to posts of that category. Selecting "All" MUST clear the category filter.
- **FR-005**: The system MUST provide a search bar with a **300ms debounce** that filters posts by title match. Clearing the search input triggers an immediate update (no debounce delay).
- **FR-006**: The active category and search query MUST be persisted as URL search params so the state is shareable and survives page refresh.
- **FR-007**: When both a category filter and a search term are active, the feed MUST return only posts satisfying both constraints.
- **FR-008**: When filters change, the feed MUST reset (clear loaded items, reset to page 1) and refetch from the beginning.
- **FR-009**: On desktop, a "Create Post" button MUST be visible in the page header area (right-aligned, next to the page title).
- **FR-010**: On mobile, a floating action button (FAB) with a pen icon and label MUST be fixed at the bottom corner of the screen. The desktop button MUST be hidden on mobile and vice versa.
- **FR-011**: Both create-post entry points MUST navigate the user to the post creation page.
- **FR-012**: The feed MUST display an empty state (icon + message + create CTA) when no posts match the current filters.
- **FR-013**: The feed MUST display a skeleton loader while posts are being fetched.
- **FR-014**: The feed MUST display an error state with a descriptive message when the data fetch fails.
- **FR-015**: The system MUST add a "Community" link to the main navbar, visible and accessible to registered users only.
- **FR-016**: The page MUST include SEO metadata (title and description).
- **FR-017**: All UI text MUST be available in both English and Arabic via the existing i18n system.
- **FR-018**: The layout MUST be fully responsive and RTL-aware — Arabic layout mirrors directional elements (tabs scroll direction, button positioning, text alignment).

### Key Entities _(include if feature involves data)_

- **Community Post (card view)**: A published post displayed in the feed. Key attributes: post ID, title, content preview, category, author name and avatar, publication date, like count, comment count, bookmark status, attachment indicator. Defined in Phase 2 as `CommunityPostCardItem`.
- **Feed Filters**: The combined state of an optional category and an optional search term. Drives what posts are fetched. Reflected in the URL.
- **Feed Page State**: Tracks the list of loaded posts, current page number, whether more posts exist, and loading/error status. Resets whenever filters change.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can navigate to the community feed and see the first page of posts within 2 seconds on a standard connection.
- **SC-002**: Selecting a category tab or entering a search term updates the displayed posts within 1 second (network-fetch time excluded from local state transitions).
- **SC-003**: 100% of published posts matching active filters are reachable via infinite scroll with no posts skipped or duplicated across pages.
- **SC-004**: The create post entry point is visible without scrolling on both desktop (≥768px) and mobile (<768px) viewports.
- **SC-005**: The page passes Core Web Vitals thresholds: LCP < 2.5s, CLS < 0.1, FID < 100ms.
- **SC-006**: All visible text renders correctly in both English (LTR) and Arabic (RTL) layouts with no overlapping or clipped elements.
- **SC-007**: The active filters (category + search) survive a browser refresh — the feed re-renders with the same filters applied.

## Assumptions

- The shared infinite scroll hook (Phase 1), community feed server actions (Phase 2), and PostCard component (Phase 3) are fully implemented before this phase begins.
- The `nuqs` library is already installed in the project for URL search param management.
- The feed page is only accessible to authenticated (registered) users; middleware handles unauthenticated redirects automatically.
- Search matches against post titles only for V1; full-text content search is a future enhancement.
- The "All" tab represents the absence of a category filter, not a distinct category value.
- Default page size for the feed is 10 posts per page, consistent with other feed contexts in the project.
- No real-time updates (e.g., new posts appearing live while browsing) are required for V1.
- FAB corner positioning (bottom-right for LTR, bottom-left for RTL) follows the existing RTL conventions in the project.
