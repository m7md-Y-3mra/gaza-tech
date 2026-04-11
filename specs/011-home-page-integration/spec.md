# Feature Specification: Home Page Integration

**Feature Branch**: `011-home-page-integration`  
**Created**: 2026-04-11  
**Status**: Draft  
**Input**: User description: "Transform the home page from a listings-only page into a mixed landing page that connects both marketplace and community sections."

## Clarifications

### Session 2026-04-11

- Q: What is the preferred caching/rendering strategy for the home page data to balance freshness and performance (LCP)? → A: Time-based Revalidation (ISR, e.g., 60 seconds) to maximize caching and LCP performance.
- Q: How should empty sections (e.g., 0 listings available) be displayed on the home page? → A: Show the section heading with a friendly "No items yet" empty message.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Explore marketplace and community from the home page (Priority: P1)

As a user, I want to see a mix of the latest marketplace listings and community highlights as soon as I open the app so I can quickly access recent content or navigate to dedicated sections.

**Why this priority**: Opening the app to a unified home page is the critical first impression and main navigation hub for the user, bridging both major product sections (marketplace and community).

**Independent Test**: Identify if navigating to the root URL (`/`) successfully renders two distinct sections (Listings and Community) with independent loading states.

**Acceptance Scenarios**:

1. **Given** a new or returning user visits the root page `/`, **When** the homepage finishes loading, **Then** they see a "Latest Listings" section (up to 4 items) and a "Community Highlights" section (up to 3 items).
2. **Given** a user is on the home page, **When** they click the "View All" link for the listings section, **Then** they are navigated to the full listings page (`/listings`).
3. **Given** a user is on the home page, **When** they click the "View All" link for the community section, **Then** they are navigated to the full community page (`/community`).

---

### Edge Cases

- When there are exactly 0 listings or community posts published, the system MUST display the section heading with a friendly "No items yet" empty message, rather than hiding the section entirely.
- How does the system handle temporary database unavailability for one of the sections? Does one failing component crash the entire home page? (A: No, strict isolation via independent ErrorBoundaries is required).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST render a home page module that integrates the two core sections: Latest Listings and Community Highlights.
- **FR-002**: System MUST fetch and display exactly 4 of the most recently published listings in the Latest Listings section.
- **FR-003**: System MUST fetch and display exactly 3 of the most recently published community posts in the Community Highlights section.
- **FR-004**: System MUST provide distinct "View All" links routing to `/listings` and `/community`.
- **FR-005**: System MUST wrap both the Latest Listings and Community Highlights sections in their own Error Boundary and Suspense components to ensure independent loading and failure isolation.
- **FR-006**: System MUST persist bilingual support (translated section titles and link texts) for English and Arabic.
- **FR-007**: System MUST use Time-based Revalidation (ISR, e.g. 60 seconds) for the home page queries to maximize caching and LCP performance.

### Key Entities

- **Listing**: Existing marketplace items represented primarily by titles, summaries, and pricing.
- **CommunityPost**: New community posts represented by authors, titles, brief content previews, and category badges.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Home page loads successfully with components from both module domains seamlessly displaying the correct record counts (4 and 3 respectively).
- **SC-002**: Users can navigate to the dedicated full-page routes (`/listings` and `/community`) in 1 click via the generated section headers.
- **SC-003**: Crashing the data fetching of the Listings section does not break the layout or prevent the Community Highlights section from loading (and vice-versa).

## Assumptions

- Assumes existing UI components (`ListingsGrid` and `PostCard`) are isolated and reusable enough to render inside the new `HomePage` context.
- Assumes the server actions (`getListingsAction` and `getCommunityPostsAction`) have already been implemented or parameterized adequately to accept custom page limit and filter parameters.
