# Feature Specification: Community Post Form UI

**Feature Branch**: `004-community-post-form-ui`  
**Created**: 2026-04-02  
**Status**: Draft  
**Input**: User description: "Build the Create / Update Community Post form page — Phase 4 of the community post feature, including route pages, server component, client form component, form logic hook, and category radio field."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Create a New Community Post (Priority: P1)

An authenticated community member navigates to the "Create Post" page. They see a single-column, centered form with fields for title, category, content, and optional attachments. They fill in a title, select a category from a visual radio grid (questions, tips, news, troubleshooting), write their content, and click "Publish." The post is saved and they are redirected to the community page with a success notification.

**Why this priority**: This is the core value — users cannot participate in the community without the ability to create posts.

**Independent Test**: Can be fully tested by navigating to the create page, filling all fields, and submitting. Delivers a published community post.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the create post page, **When** they fill in title (5+ chars), select a category, write content (10+ chars), and click "Publish", **Then** the post is created with status "published", a success toast appears, and the user is redirected to the community page.
2. **Given** an authenticated user on the create post page, **When** they submit with an empty title, **Then** an inline validation error appears on the title field and the form is not submitted.
3. **Given** an authenticated user on the create post page, **When** they submit without selecting a category, **Then** the default category "questions" is used and the form submits successfully.

---

### User Story 2 - Edit an Existing Community Post (Priority: P2)

A post author navigates to the edit page for one of their posts. The form loads pre-filled with the existing title, category, content, and attachments. They modify any fields, then click "Update." The post is updated and they are redirected with a success notification.

**Why this priority**: Editing is essential for correcting mistakes and keeping content current, but depends on create working first.

**Independent Test**: Can be tested by creating a post, navigating to its edit page, changing the title, and verifying the update persists.

**Acceptance Scenarios**:

1. **Given** a post author on the edit page for their post, **When** the page loads, **Then** all form fields are pre-filled with the current post data (title, category, content, existing attachments).
2. **Given** a post author editing their post, **When** they change the title and click "Update", **Then** the post is updated in the database, a success toast appears, and the user is redirected.
3. **Given** a user who is NOT the post author, **When** they attempt to access the edit page, **Then** they are shown an error or redirected (they cannot edit another user's post).

---

### User Story 3 - Attach Files to a Community Post (Priority: P3)

While creating or editing a post, a user optionally adds file attachments (images or PDFs). They can add up to 5 files, each up to 5 MB. They can also remove attachments before submitting. On edit, existing attachments are shown with a remove option, and new ones can be added.

**Why this priority**: Attachments enrich posts but the core post functionality works without them.

**Independent Test**: Can be tested by creating a post with 2 image attachments, verifying they appear in the database, then editing the post to remove one and add a new one.

**Acceptance Scenarios**:

1. **Given** a user on the create post page, **When** they add 3 image attachments and submit, **Then** all 3 files are uploaded and linked to the post.
2. **Given** a user on the create post page, **When** they try to add a 6th attachment, **Then** they are prevented from doing so with a clear message about the 5-file limit.
3. **Given** a user editing a post with 2 existing attachments, **When** they remove one and add a new one, **Then** the removed attachment is deleted and the new one is uploaded and linked.
4. **Given** a user on the form, **When** they attach a file larger than 5 MB, **Then** a validation error is shown and the file is rejected.

---

### User Story 4 - Form Validation and Error Feedback (Priority: P2)

When a user submits the form with invalid data, they see clear, localized inline error messages next to the offending fields. If a server error occurs during submission, a prominent error banner appears within the form with a user-friendly message. During submission, the form shows a loading state and all fields are disabled.

**Why this priority**: Validation and error feedback are essential for usability and tie into both create and update flows.

**Independent Test**: Can be tested by submitting the form with various invalid inputs (empty title, too-short content) and verifying error messages appear.

**Acceptance Scenarios**:

1. **Given** a user on the form, **When** they blur the title field with only 3 characters, **Then** a validation error message appears indicating the minimum length requirement.
2. **Given** a user who clicks "Publish", **When** the submission is in progress, **Then** the button shows a loading spinner, the button text changes to reflect the submitting state, and all form fields are disabled.
3. **Given** a user who submitted the form, **When** the server returns an error, **Then** an error alert is displayed in the form with a user-friendly message, and any uploaded files are cleaned up.

---

### Edge Cases

- What happens when the user's session expires mid-form? The server action fails with an auth error and the user sees an error message.
- What happens if file upload succeeds but post creation fails? Uploaded files are cleaned up (deleted from storage) before showing the error.
- What happens when the user navigates away from a partially filled form? No draft saving — the data is lost (acceptable for v1).
- What happens if the post being edited has been deleted by an admin? The server component throws an error and an error page is shown.

## Clarifications

### Session 2026-04-02

- Q: Does the content field accept plain text only or rich text (bold, links, etc.)? → A: Plain text only (standard textarea, no formatting).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a create post page accessible via a dedicated URL path under the community section.
- **FR-002**: System MUST provide an edit post page accessible via a URL path that includes the post identifier.
- **FR-003**: The form MUST include fields for: title (text input), category (radio selection), content (plain-text textarea, no rich-text formatting), and attachments (optional file upload area).
- **FR-004**: The category field MUST display four options (questions, tips, news, troubleshooting) as a visual radio grid, defaulting to "questions."
- **FR-005**: The form MUST validate all inputs against the defined schema (title: 5–100 chars, content: 10–5,000 chars, attachments: max 5 files, max 5 MB each, images and PDF only).
- **FR-006**: Validation errors MUST appear inline next to the relevant field and all validation messages MUST be translatable (English and Arabic).
- **FR-007**: The form MUST use a single-column centered layout with no sidebar.
- **FR-008**: On successful create, the system MUST publish the post (status = published), show a success notification, and redirect the user to the community page.
- **FR-009**: On successful update, the system MUST save changes, show a success notification, and redirect the user.
- **FR-010**: During submission, the form MUST disable all fields and show a loading indicator on the submit button.
- **FR-011**: If a server error occurs, the system MUST display an error alert within the form and clean up any files that were uploaded during the failed attempt.
- **FR-012**: In edit mode, the server component MUST fetch existing post data and pre-fill the form with current values including existing attachments.
- **FR-013**: In edit mode, the system MUST handle attachment diffs — uploading new attachments, removing deleted ones from storage, and updating the database accordingly.
- **FR-014**: All form labels, placeholders, button text, validation messages, and toast notifications MUST be available in both English and Arabic.
- **FR-015**: The form MUST be fully keyboard-accessible with visible focus states and proper semantic HTML labels.

### Key Entities

- **Community Post**: A user-authored piece of content with a title, category, content body, and publication status. Belongs to one author. May have zero or more attachments.
- **Post Attachment**: A file (image or PDF) linked to a community post. Stored externally and referenced by URL.
- **Post Category**: One of four predefined categories (questions, tips, news, troubleshooting) that classify the post's purpose.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can create a community post with title, category, and content in under 2 minutes.
- **SC-002**: Users can edit an existing post and see their changes reflected immediately after submission.
- **SC-003**: 100% of form validation messages display in the user's selected language (English or Arabic).
- **SC-004**: File attachment upload and post creation complete within 5 seconds for posts with up to 5 attachments (under normal network conditions).
- **SC-005**: The form renders correctly and is fully usable on both desktop (1024px+) and mobile (320px+) viewports.
- **SC-006**: All interactive elements (inputs, radio buttons, file upload, submit button) are reachable and operable via keyboard alone.
- **SC-007**: Form submission errors are displayed within 1 second of the server response, and any orphaned uploaded files are cleaned up automatically.

## Assumptions

- The reusable file upload component (Phase 1) is complete and available for use with community-specific configuration.
- The community post schema and types (Phase 2) are complete and exported for use in form validation.
- The community post server actions and queries (Phase 3) are complete and functional for create, update, and get-details operations.
- The Supabase Storage bucket for community attachments exists and has appropriate access policies configured.
- No draft saving is required for this version — posts go directly to "published" on submit.
- The form does not include a sidebar, tags, scheduling, or SEO fields — only title, category, content, and attachments.
- Authentication is handled at the server component level — unauthenticated users will be redirected by existing middleware.
