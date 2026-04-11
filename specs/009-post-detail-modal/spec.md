# Feature Specification: Post Detail Modal

**Feature Branch**: `009-post-detail-modal`  
**Created**: 2026-04-07  
**Status**: Draft  
**Input**: User description: "PHASE 5 - post-detail-modal: Modal with full post, comments system (add/edit/delete), like comments"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Full Post in Modal (Priority: P1)

A community member browsing the feed wants to read a full post without leaving the feed page. They click on a post card (or its comment icon) and a modal opens showing the complete post content (untruncated), author details, category, publication date, and any attached images or files.

**Why this priority**: This is the foundation — without viewing the full post, no other modal interactions (comments, likes) are possible.

**Independent Test**: Can be tested by clicking any post card in the feed and verifying the modal displays the complete post content, author info, category badge, timestamp, and attachments.

**Acceptance Scenarios**:

1. **Given** a user is on the community feed, **When** they click a post card or its comment icon, **Then** a modal opens displaying the full post title, untruncated content, author avatar/name, category badge, publication date, and attachments (if any).
2. **Given** the modal is open, **When** the user clicks the close button or presses Escape, **Then** the modal closes and they return to the feed in its previous scroll position.
3. **Given** a post has image attachments, **When** the modal opens, **Then** images are displayed in a gallery/grid format within the modal.
4. **Given** a post has no attachments, **When** the modal opens, **Then** no attachment section is rendered.
5. **Given** the modal is open, **When** the user likes, bookmarks, or shares the post via the modal action bar, **Then** the action takes effect and the corresponding post card in the feed reflects the updated state.

---

### User Story 2 - Add a Comment (Priority: P1)

A logged-in user viewing a post in the modal wants to contribute to the discussion by adding a comment. They type their comment in a sticky input at the bottom of the modal and submit it.

**Why this priority**: Adding comments is the core interaction — it drives engagement and is required before edit/delete/reply features make sense.

**Independent Test**: Can be tested by opening a post modal, typing a comment in the input field, submitting, and verifying the comment appears in the list immediately.

**Acceptance Scenarios**:

1. **Given** a logged-in user has the post modal open, **When** they type text in the comment input and press send, **Then** the comment appears at the bottom of the comment list immediately (optimistic update) and persists after page refresh.
2. **Given** a user submits an empty comment, **When** they press send, **Then** the form shows a validation error and no comment is submitted.
3. **Given** a comment is successfully added, **When** the modal is still open, **Then** the comment count displayed on the post updates accordingly.
4. **Given** the comment submission fails (network error), **When** the optimistic update was shown, **Then** the comment is removed from the list and an error notification is displayed.

---

### User Story 3 - View Comments List (Priority: P1)

A user opens the post modal and sees all existing comments loaded below the post content. Comments display the author's avatar, name, relative timestamp, and content. Replies to other comments are visually indicated.

**Why this priority**: Viewing comments is essential for the post detail experience and is tightly coupled with the modal view itself.

**Independent Test**: Can be tested by opening a post with existing comments and verifying all comments render with correct author info, timestamps, and reply indicators.

**Acceptance Scenarios**:

1. **Given** a post has comments, **When** the modal opens, **Then** all comments load and display with author avatar, name, relative time, and content.
2. **Given** a post has no comments, **When** the modal opens, **Then** an empty state message is shown ("No comments yet - be the first!").
3. **Given** a comment is a reply to another comment, **When** it is displayed, **Then** it shows a visual indicator (e.g., "replying to [name]") to indicate the threading relationship.
4. **Given** a comment has been edited, **When** it is displayed, **Then** an "(edited)" label appears next to the timestamp.

---

### User Story 4 - Edit Own Comment (Priority: P2)

A logged-in user who authored a comment wants to correct or update it. They access an options menu on their own comment, select "Edit", and the comment text transforms into an editable input pre-filled with the current content.

**Why this priority**: Editing is important for user autonomy and content quality, but secondary to adding and viewing comments.

**Independent Test**: Can be tested by finding a comment authored by the current user, selecting Edit from the options menu, modifying text, saving, and verifying the updated text and "(edited)" indicator appear.

**Acceptance Scenarios**:

1. **Given** a logged-in user sees their own comment, **When** they open the options menu, **Then** "Edit" and "Delete" options are visible.
2. **Given** a user selects "Edit" on their comment, **When** the inline editor appears, **Then** it is pre-filled with the current comment text and shows Save/Cancel buttons.
3. **Given** a user modifies the text and clicks Save, **When** the update succeeds, **Then** the comment displays the new text with an "(edited)" indicator.
4. **Given** a user clicks Cancel during editing, **When** the inline editor closes, **Then** the original comment text is restored unchanged.
5. **Given** a user views a comment authored by someone else, **When** they look at that comment, **Then** no options menu is visible.

---

### User Story 5 - Delete Own Comment (Priority: P2)

A logged-in user who authored a comment wants to remove it. They select "Delete" from the options menu and confirm via a dialog before the comment is removed.

**Why this priority**: Deletion is a necessary counterpart to creation for user control, but lower priority than creating and editing.

**Independent Test**: Can be tested by selecting Delete on an owned comment, confirming in the dialog, and verifying the comment is removed from the list.

**Acceptance Scenarios**:

1. **Given** a user selects "Delete" on their own comment, **When** the confirmation dialog appears, **Then** it asks "Are you sure you want to delete this comment?" with Confirm and Cancel options.
2. **Given** a user confirms deletion, **When** the action completes, **Then** the comment is removed from the list and the comment count on the post decreases.
3. **Given** a user deletes a comment that has replies, **When** the deletion is confirmed, **Then** the parent comment and all its replies are removed from the list and the comment count decreases accordingly.
4. **Given** a user cancels deletion, **When** they click Cancel, **Then** the comment remains unchanged.

---

### User Story 6 - Like a Comment (Priority: P2)

A logged-in user wants to show appreciation for a comment by liking it. They click a small heart/like button on the comment, which toggles the like state with an optimistic update.

**Why this priority**: Comment likes add engagement depth but are not essential for the core comment functionality.

**Independent Test**: Can be tested by clicking the like button on a comment and verifying the like count increments and the button state changes immediately.

**Acceptance Scenarios**:

1. **Given** a logged-in user sees a comment they haven't liked, **When** they click the like button, **Then** the like count increments by 1 and the button shows a "liked" state immediately.
2. **Given** a user has already liked a comment, **When** they click the like button again, **Then** the like is removed, the count decrements, and the button returns to the default state.
3. **Given** the like toggle fails on the server, **When** the optimistic update was shown, **Then** the state reverts and an error notification is displayed.

---

### User Story 7 - Reply to a Comment (Priority: P3)

A logged-in user wants to reply to a specific comment. They trigger a reply action which shows a "Replying to [name]" indicator in the comment input, and the submitted comment is linked to the parent comment.

**Why this priority**: Threaded replies improve discussion quality but the feature works without them (flat comments are sufficient for V1).

**Independent Test**: Can be tested by clicking reply on a comment, verifying the "Replying to" indicator appears, submitting, and seeing the reply linked to the parent.

**Acceptance Scenarios**:

1. **Given** a user clicks reply on a comment, **When** the comment input is focused, **Then** a "Replying to [author name]" indicator appears above the input.
2. **Given** a user submits a reply, **When** it appears in the list, **Then** it shows a visual indicator linking it to the parent comment.
3. **Given** a user is in reply mode, **When** they dismiss the reply indicator, **Then** the input reverts to a standard top-level comment mode.

---

### Edge Cases

- What happens when the modal is opened but comments fail to load? — An error state is shown with a retry option within the comments section; the post content remains visible.
- What happens when a user tries to interact (like, comment) while not logged in? — Actions are hidden or disabled for unauthenticated users; no crash or broken state occurs.
- What happens when a comment's author has deleted their account? — The comment displays "Deleted User" with a default avatar.
- What happens when the user rapidly clicks the like button on a comment? — Subsequent clicks are ignored while the previous action is pending.
- What happens when the modal content is very long (many comments)? — The modal content area scrolls independently while the comment input remains sticky at the bottom.
- What happens when a comment exceeds the maximum length (2000 characters)? — The form validates and shows an error before submission.

## Clarifications

### Session 2026-04-07

- Q: What happens to replies when a parent comment is deleted? → A: Cascade delete — deleting a parent comment also removes all its replies.
- Q: Should the modal include post-level like, bookmark, and share actions? → A: Yes — include post like, bookmark, and share actions in the modal, mirroring the post card action bar.
- Q: Should the post detail modal support URL deep linking for shareability? → A: Yes — use Next.js intercepting routes so clicking a post opens a modal with URL update; direct navigation shows a full page fallback.
- Q: Can users reply to replies (nested threading), or only to top-level comments? → A: Single-level only — replies are allowed on top-level comments only (max depth = 1).
- Q: How should comments be loaded for posts with many comments? → A: Paginated with "Load more" button — load initial batch (e.g., 20), user clicks to load more.
- Q: How should comments be sorted in the modal? → A: Oldest first (chronological) — natural conversation order, new comments appear at the bottom near the input.
- Q: Should new comments from other users appear in real-time while the modal is open? → A: No real-time — comments only refresh when the modal is reopened or the user manually triggers a refresh.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display a modal overlay when a user clicks on a post card or its comment icon from the community feed. The modal MUST use Next.js intercepting routes so the URL updates to `/community/[postId]`; direct navigation to that URL MUST render a full post detail page.
- **FR-002**: The modal MUST show the full post content including title, untruncated body text, author information (avatar, name), category badge, publication date, and attachments.
- **FR-016**: The modal MUST include post-level like, bookmark, and share actions, mirroring the post card action bar. Toggling these actions in the modal MUST sync the state with the corresponding post card in the feed.
- **FR-003**: The modal MUST load an initial batch of 20 comments when opened, sorted oldest-first (chronological). Additional comments MUST be loadable via a "Load more" button at the top of the comment list. Replies are grouped under their parent comment.
- **FR-004**: Logged-in users MUST be able to add a new comment with text content between 1 and 2000 characters.
- **FR-005**: The comment input MUST remain visible (sticky) at the bottom of the modal while the content scrolls.
- **FR-006**: Comment authors MUST be able to edit their own comments via an inline editing interface.
- **FR-007**: Comment authors MUST be able to delete their own comments after confirming via a dialog. Deleting a parent comment MUST cascade-delete all its replies.
- **FR-008**: Edited comments MUST display an "(edited)" indicator next to the timestamp.
- **FR-009**: Logged-in users MUST be able to toggle a like on any comment, with the change reflected immediately (optimistic update).
- **FR-010**: The options menu (edit/delete) MUST only be visible on comments authored by the current user.
- **FR-011**: Users MUST be able to reply to a top-level comment only (max depth = 1), with the reply visually associated with the parent comment. Reply buttons MUST NOT appear on replies themselves.
- **FR-012**: The modal MUST be closable via a close button, pressing Escape, or clicking outside the modal.
- **FR-013**: The modal MUST support both LTR (English) and RTL (Arabic) layouts.
- **FR-014**: Adding or deleting a comment MUST update the comment count shown on the corresponding post card in the feed.
- **FR-015**: The modal state MUST be accessible from any post card in the feed via a shared context provider.

### Key Entities

- **Post Detail**: The full representation of a community post shown in the modal — includes title, content, author, category, publication date, attachments, and aggregate counts (likes, comments, bookmarks).
- **Comment**: A user-contributed text response to a post — has an author, content, creation timestamp, edit status, like count, and optional parent comment reference for threading.
- **Comment Like**: A user's like on a specific comment — togglable, one per user per comment.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can open a post detail modal and read the full post content within 1 second of clicking.
- **SC-002**: Users can add a comment and see it appear in the list within 1 second (optimistic update before server confirmation).
- **SC-003**: Comment edit and delete operations complete with visual feedback within 2 seconds.
- **SC-004**: The modal maintains full usability with up to 100 comments without scrolling performance degradation.
- **SC-005**: All interactive elements in the modal are keyboard-accessible and screen-reader compatible.
- **SC-006**: The modal displays correctly in both English (LTR) and Arabic (RTL) layouts with no visual or functional regressions.
- **SC-007**: 100% of visible text in the modal is translatable and available in both supported languages.

## Assumptions

- The community feed page (Phase 4) and post card component (Phase 3) are already implemented and functional.
- Server actions for fetching comments, adding comments (via `add_comment` RPC), editing, deleting, and liking comments are already available from Phase 2.
- The post detail query (returning full post with author, attachments, counts) is already available from Phase 2.
- Users must be authenticated to add, edit, delete, or like comments. Unauthenticated users can view but not interact.
- V1 comment threading uses a flat display with "replying to [name]" indicators rather than nested/indented threading. Full visual threading may be added in a future iteration.
- The shadcn Dialog component will be installed if not already present in the UI component library.
- The modal is rendered at the provider level (portal) and is triggered via React context from any post card.
