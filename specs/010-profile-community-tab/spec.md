# Feature Specification: Profile Community Posts Tab

**Feature Branch**: `010-profile-community-tab`
**Created**: 2026-04-11
**Status**: Draft
**Input**: User description: "Read CHAT.md and create specification for PHASE6 profile-community-tab — Add a My Posts tab to the user's profile page showing their community posts with edit and delete actions for the owner"

## Clarifications

### Session 2026-04-11

- Q: Are drafts/unpublished posts visible in the "My Posts" tab, and to whom? → A: Only published posts are shown to everyone, including the owner.
- Q: What happens when a viewer clicks a post card (outside the Edit/Delete controls) in the "My Posts" tab? → A: Opens the full post detail modal (same modal used on the community feed).
- Q: How many posts should appear per page in the "My Posts" tab? → A: 10 per page, matching the existing profile Listings tab if it already defines a size.
- Q: What does the empty state look like for the owner vs. a non-owner? → A: Owner sees empty state text plus a "Create your first post" CTA linking to the create-post flow; non-owner sees empty state text only (no CTA).
- Q: What happens if a successful delete leaves the current pagination page empty (e.g., the only post on page 3 is deleted)? → A: Auto-navigate to the previous page, clamped at page 1.

## User Scenarios & Testing

### User Story 1 - View a user's community posts on their profile (Priority: P1)

Any visitor on a user's profile page can open a new "My Posts" tab and browse the community posts authored by that profile's owner. The tab sits alongside the existing Listings tab (and the owner-only Bookmarks tab) and shows a paginated list of posts with title, category, content preview, publish date, and engagement counts (likes, comments).

**Why this priority**: This is the core visibility of a user's community presence. Without it, the profile only reflects marketplace activity and the feature delivers zero value. It is the MVP slice — everything else (edit, delete, pagination polish) builds on top of it.

**Independent Test**: Visit the profile of any user who has published at least one community post; confirm a "My Posts" tab appears, opens without errors, and renders that user's posts in reverse chronological order with correct metadata. Can be validated even before owner-only actions are wired up.

**Acceptance Scenarios**:

1. **Given** a signed-out visitor on a user profile that has 5 community posts, **When** they click the "My Posts" tab, **Then** they see all 5 posts ordered newest first with title, category, snippet, date, like count, and comment count.
2. **Given** a profile owner viewing their own profile, **When** they open the "My Posts" tab, **Then** they see the same list any visitor sees plus owner-only action controls on each post.
3. **Given** a profile whose owner has never published a community post, **When** any viewer opens the "My Posts" tab, **Then** an empty state is shown explaining there are no posts yet.

---

### User Story 2 - Owner edits one of their community posts from their profile (Priority: P2)

A signed-in user viewing their own profile can trigger an "Edit" action on any of their community posts from the "My Posts" tab and be taken to that post's edit screen.

**Why this priority**: Owners need a direct, discoverable path to update their content without hunting through the community feed. It is second because viewing must exist first for the action to be meaningful.

**Independent Test**: Log in as the profile owner, open "My Posts", click the Edit control on a post, and confirm the application navigates to that post's edit screen.

**Acceptance Scenarios**:

1. **Given** the owner is viewing their own "My Posts" tab, **When** they activate the Edit control on a post, **Then** they are taken to that post's edit screen.
2. **Given** a visitor who is not the profile owner, **When** they view the "My Posts" tab, **Then** no Edit control is visible on any post.

---

### User Story 3 - Owner deletes one of their community posts from their profile (Priority: P2)

A signed-in user viewing their own profile can delete any of their community posts from the "My Posts" tab after explicit confirmation.

**Why this priority**: Content removal is a common housekeeping task owners expect; without confirmation, accidental loss is a real risk, so it must be guarded. Same priority tier as Edit — both are owner tools built on top of viewing.

**Independent Test**: Log in as the owner, open "My Posts", delete a post, confirm the dialog, and verify the post disappears from the list and is no longer retrievable from the community feed.

**Acceptance Scenarios**:

1. **Given** the owner is viewing their own "My Posts" tab, **When** they activate the Delete control on a post, **Then** a confirmation dialog appears asking them to confirm the deletion.
2. **Given** the confirmation dialog is open, **When** the owner confirms deletion, **Then** the post is removed, the list refreshes to no longer show it, and the owner sees feedback that the deletion succeeded.
3. **Given** the confirmation dialog is open, **When** the owner cancels, **Then** the post remains in the list unchanged.
4. **Given** a visitor who is not the profile owner, **When** they view the "My Posts" tab, **Then** no Delete control is visible on any post.

---

### User Story 4 - Paginate through a long post history (Priority: P3)

A viewer can browse a user's entire community post history across multiple pages using the same pagination pattern already used by the profile's Listings tab.

**Why this priority**: Important for profiles with many posts, but not required to deliver initial value — the first page alone already provides utility.

**Independent Test**: Visit a profile with more than one page of posts, use the pagination control to move between pages, and confirm the URL reflects the current page and the list updates accordingly.

**Acceptance Scenarios**:

1. **Given** a profile with more posts than fit on one page, **When** the viewer changes the page, **Then** the list shows the next set of posts and the current page is reflected in the URL so it can be shared or reloaded.
2. **Given** the viewer reloads the page on a specific pagination page, **When** the tab re-renders, **Then** it restores the same page of results.

---

### Edge Cases

- **Profile owner has zero community posts**: show a friendly empty state with a clear message. For the owner viewing their own profile, the empty state MUST also include a "Create your first post" CTA that links to the create-post flow. For any non-owner viewer, the empty state MUST show text only with no CTA.
- **Loading state**: show a skeleton placeholder while the posts list is being fetched so the tab never appears blank.
- **Fetch failure**: show a localized error state with a retry affordance instead of a broken tab.
- **Delete failure**: keep the post in the list and show an error notification; do not silently swallow the failure.
- **Post deleted elsewhere (e.g., from the feed in another tab)**: on the next load or retry, the stale post is no longer shown.
- **Rapid repeated Delete clicks**: prevent double-submission while a delete is in flight.
- **Long titles or content previews**: truncate gracefully without breaking the card layout.
- **Signed-out viewer opening "My Posts"**: the tab is still visible and functional for browsing; no owner-only controls appear.
- **Switching tabs**: preserving or resetting pagination state must behave consistently with the existing profile tabs' pattern.
- **Posts across categories**: each post's category is shown clearly so viewers can distinguish question/tip/news/troubleshooting content at a glance.

## Requirements

### Functional Requirements

- **FR-001**: The profile page MUST expose a new tab labeled "My Posts" (with a localized Arabic equivalent) alongside the existing Listings tab and the owner-only Bookmarks tab.
- **FR-002**: The "My Posts" tab MUST be visible to all viewers of the profile, regardless of whether they are signed in or whether they are the profile owner.
- **FR-003**: The tab MUST display only the **published** community posts authored by the profile owner, in reverse chronological order (newest first). Drafts and any other non-published states MUST NOT appear in this tab for any viewer, including the owner.
- **FR-004**: Each post entry MUST show at minimum: post title, category indicator, a content preview, the publish date, the like count, and the comment count.
- **FR-005**: The tab MUST support paginated browsing of the post history using the same pagination pattern and URL-parameter behavior as the existing profile Listings tab (not infinite scroll). The default page size MUST be **10 posts per page**; if the existing profile Listings tab already defines a canonical page size, the new tab MUST adopt that same size for consistency.
- **FR-006**: The current pagination page MUST be reflected in the URL so it is shareable, reloadable, and preserved on back/forward navigation.
- **FR-007**: When the profile owner is viewing their own profile, each post entry MUST show an Edit control and a Delete control; these controls MUST be hidden for any other viewer.
- **FR-008**: The Edit control MUST navigate the owner to that post's dedicated edit screen.
- **FR-009**: The Delete control MUST require explicit confirmation via a modal confirmation dialog before any deletion is performed.
- **FR-010**: On confirmed deletion, the system MUST remove the post and update the list so that the deleted post is no longer displayed.
- **FR-011**: On cancelled confirmation, the system MUST make no changes to the post or the list.
- **FR-012**: The tab MUST show a loading placeholder while posts are being fetched.
- **FR-013**: The tab MUST show a localized error state when post retrieval fails, and the error state MUST NOT break the rest of the profile page.
- **FR-014**: The tab MUST show a localized empty state when the profile owner has no community posts. When the current viewer is the profile owner, the empty state MUST also include a "Create your first post" call-to-action linking to the create-post flow; for any non-owner viewer, the empty state MUST show text only (no call-to-action).
- **FR-015**: Successful deletions MUST provide visible feedback to the owner (e.g., a confirmation toast) and failed deletions MUST surface a visible error.
- **FR-016**: All visible text in the tab (labels, empty state, error state, confirmation dialog, action controls) MUST be available in both English and Arabic and MUST render correctly in both LTR and RTL layouts.
- **FR-017**: All interactive elements (tab trigger, pagination controls, edit, delete, confirmation buttons) MUST be keyboard-accessible and have accessible labels.
- **FR-018**: While a delete request is in flight, repeated Delete activations on the same post MUST be ignored to prevent duplicate submissions.
- **FR-019**: Clicking a post card (anywhere outside the Edit/Delete controls) MUST open the full post detail view in the same modal pattern used by the community feed, so viewers can read the post and interact with comments without leaving the profile page. Activating the Edit or Delete controls MUST NOT also trigger the detail modal.
- **FR-020**: If a successful deletion leaves the current pagination page with zero posts, the tab MUST automatically navigate the viewer to the previous page, clamped at page 1 (so page 1 never auto-navigates anywhere). The URL pagination parameter MUST be updated to reflect the new page.

### Key Entities

- **Community Post (as displayed on profile)**: Represents one post authored by the profile owner. Visible attributes in this view: title, category, content preview, publish date, like count, comment count, and the identifier needed for edit/delete actions.
- **Profile Owner**: The user whose profile is being viewed. Determines whether owner-only controls are shown.
- **Viewer**: The current user (possibly anonymous) browsing the profile. Determines visibility of owner-only controls.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% of profiles show a "My Posts" tab, regardless of whether the profile owner has any community posts.
- **SC-002**: On profiles with at least one post, a viewer can see the first page of posts within 2 seconds of opening the tab on a typical broadband connection.
- **SC-003**: Owners can complete the edit-navigation flow (open tab → click Edit → land on edit screen) in 3 interactions or fewer.
- **SC-004**: Owners can complete the delete flow (open tab → click Delete → confirm) in 3 interactions or fewer, and the deleted post disappears from the list within 1 second of confirmation under normal conditions.
- **SC-005**: Non-owners never see Edit or Delete controls — verified across signed-out, signed-in-as-different-user, and owner viewing states.
- **SC-006**: 0 untranslated strings in the tab UI across English and Arabic locales.
- **SC-007**: The tab passes keyboard-only navigation: a user with no mouse can open the tab, paginate, and (as owner) edit or delete a post end-to-end.
- **SC-008**: Accidental deletion rate is zero by design — no deletion path exists that skips the confirmation dialog.

## Assumptions

- The existing profile page and profile tabs infrastructure (tab switcher, Listings tab, Bookmarks tab) are already in place and extensible to accept a third tab.
- A server action for fetching a user's community posts (paginated, by user id) already exists or will be provided by earlier phases and can be consumed by this feature without new database work.
- A server action for deleting a community post already exists and enforces ownership/authorization on the server side; the UI only needs to call it and react to the result.
- The dedicated post edit screen already exists at a stable route and can be linked to directly by post identifier.
- The pagination behavior (URL query parameter for the current page) used by the existing profile Listings tab is the canonical pattern and will be reused verbatim for consistency.
- The confirmation dialog pattern used by the existing profile Listings tab's delete action is the canonical pattern and will be reused.
- Owner identification (is the current viewer the profile owner?) is already resolved upstream in the profile page and can be passed down to the new tab as a boolean.
- Translation infrastructure and RTL support are already in place; this feature only adds new keys and does not change the i18n system.
- The "My Posts" tab is visible to all viewers (authenticated or not); only the owner action controls (Edit/Delete) are gated by ownership.
- This feature introduces no new data storage, no new database tables, and no new server-side queries beyond those already exposed by earlier phases.
