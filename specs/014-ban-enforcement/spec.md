# Feature Specification: Ban Enforcement (Auth Layer)

**Feature Branch**: `014-ban-enforcement`  
**Created**: April 14, 2026  
**Status**: Draft  
**Input**: User description: "Phase 2 — Ban Enforcement (Auth Layer): Add Next.js middleware to check is_active on authenticated routes, Redirect banned users to /banned page and sign them out, Add login-time ban check in auth callback, Create /banned page showing ban reason"

## Clarifications

### Session 2026-04-14

- Q: Frequency of is_active status verification in Middleware → A: Cache for 5 minutes (Balanced).
- Q: Handling users banned while active in multiple sessions → A: Immediate restriction on next request.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Block Access for Banned Users (Priority: P1)

As a banned user, I should not be able to access any part of the application (protected or public) except for the dedicated banned page so that I am aware of my status.

**Why this priority**: Security and compliance. Banned users must be immediately prevented from interacting with the platform.

**Independent Test**: Login with a banned account and verify that any attempt to navigate to `/dashboard`, `/profile`, or even the homepage (if already logged in) redirects to `/banned`.

**Acceptance Scenarios**:

1. **Given** I am a logged-in user whose status was changed to `is_active = false`, **When** I navigate to a dashboard page, **Then** I am redirected to `/banned` and my session is terminated.
2. **Given** I am a logged-in banned user, **When** I try to access the homepage, **Then** I am redirected to `/banned`.

---

### User Story 2 - Prevent Login for Banned Users (Priority: P1)

As a banned user, I should be blocked at the point of login so that I cannot re-establish a session.

**Why this priority**: Critical for security. Prevents malicious or banned actors from entering the system.

**Independent Test**: Attempt to sign in with credentials belonging to a banned user and verify that an error message is shown and no session is created.

**Acceptance Scenarios**:

1. **Given** I have a banned account (`is_active = false`), **When** I enter correct credentials on the login page, **Then** I see an error message stating my account is banned and I am not logged in.

---

### User Story 3 - View Ban Reason (Priority: P2)

As a banned user, I want to see the reason why I was banned so that I understand the system's decision.

**Why this priority**: Improves user experience by providing transparency, even for banned users.

**Independent Test**: Access the `/banned` page and verify that the `ban_reason` stored in the database is displayed.

**Acceptance Scenarios**:

1. **Given** I am on the `/banned` page, **When** the page loads, **Then** I see the specific text stored in the `ban_reason` field of my user profile.

---

### Edge Cases

- What happens when a user is banned while actively browsing in another tab or device? (Status check in Middleware will redirect to `/banned` on the next navigation or data request once the 5-minute cache expires).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Middleware MUST check the `is_active` status of the authenticated user. To optimize performance, this status SHOULD be cached in the session/cookie for a maximum of 5 minutes before re-verifying against the database.
- **FR-002**: Middleware MUST implement a restricted session for banned users, blocking access to all routes except the `/[locale]/banned` page.
- **FR-003**: Server actions for login (`signIn`) MUST verify `is_active` status before completing the authentication flow.
- **FR-004**: The system MUST create a new page `/banned` (multi-locale support: `/[locale]/banned`).
- **FR-005**: The `/banned` page MUST display the `ban_reason` from the user's profile.
- **FR-006**: The `/banned` page MUST be accessible to authenticated users whose `is_active` status is false, retrieving their profile data via the active restricted session.
- **FR-007**: Banned users MUST be redirected to `/banned` even if trying to access the homepage while a session exists.

### Key Entities _(include if feature involves data)_

- **User**: Represents the user profile in `public.users` table, including `is_active` (boolean) and `ban_reason` (text).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of banned users are prevented from accessing restricted areas (Dashboard, Profile, Admin) via Middleware.
- **SC-002**: Banned users are redirected to the `/banned` page within 500ms of a request.
- **SC-003**: The login process fails for 100% of banned users with a specific "Account Banned" error message.
- **SC-004**: 100% of correctly populated `ban_reason` values are displayed accurately on the `/banned` page.

## Assumptions

- The `is_active` (boolean) and `ban_reason` (text) columns exist and are correctly populated in the `public.users` table.
- Authentication is handled via Supabase, and the session is managed in `proxy.ts`.
- The `/banned` page should follow the existing multi-locale routing structure.
- The `is_active` check in middleware requires a database query to the `users` table since the JWT itself might not contain the latest status unless refreshed.
