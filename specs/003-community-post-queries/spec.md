# Feature Specification: Community Post Queries & Server Actions

**Feature Branch**: `003-community-post-queries`  
**Created**: 2026-04-02  
**Status**: Draft  
**Input**: User description: "Read @CHAT.md and create a specification for the Phase 3 community-post-queries ONLY"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a Community Post (Priority: P1)

An authenticated user wants to publish a new community post with a title, category, content, and optional file attachments. When they submit the form, the system persists the post data and any attachment references, sets the post as published, and confirms success.

**Why this priority**: This is the core write operation — without it, no community content can exist. Every other operation depends on posts being created first.

**Independent Test**: Can be fully tested by submitting a valid post payload and verifying the post row and attachment rows appear in the database with the correct values.

**Acceptance Scenarios**:

1. **Given** an authenticated user with valid post data (title, content, category) and no attachments, **When** they submit the create action, **Then** a new row is inserted into `community_posts` with `content_status = 'published'` and `published_at` set to the current timestamp, and a success response containing `postId` (the new post's identifier, in camelCase) is returned.
2. **Given** an authenticated user with valid post data and 3 attachment URLs, **When** they submit the create action, **Then** the post is created and 3 corresponding rows are inserted into `community_posts_attachments` linked to the new `post_id`.
3. **Given** an authenticated user with valid post data and attachments, **When** the post is created successfully but attachment insertion fails, **Then** the created post is rolled back (deleted) and an error is returned.
4. **Given** an unauthenticated user, **When** they attempt to create a post, **Then** the system returns an authentication error.

---

### User Story 2 - Update an Existing Community Post (Priority: P2)

An authenticated user who authored a post wants to edit its title, content, category, or attachments. The system updates the post data and handles the difference between existing and new attachments (adding new ones, removing deleted ones).

**Why this priority**: Editing is the second most important write operation — authors need to correct mistakes or add information after initial publication.

**Independent Test**: Can be fully tested by creating a post, then calling the update action with modified data and verifying the database reflects the changes.

**Acceptance Scenarios**:

1. **Given** an authenticated author with a valid post ID and updated title/content/category, **When** they submit the update action, **Then** the `community_posts` row is updated with the new values and `updated_at` is refreshed.
2. **Given** an authenticated author with a post that has 2 existing attachments, **When** they submit an update that removes 1 attachment and adds 2 new ones, **Then** the removed attachment row is deleted from `community_posts_attachments`, 2 new rows are inserted, and the remaining original attachment is unchanged.
3. **Given** an authenticated user who is NOT the author of the post, **When** they attempt to update the post, **Then** the system returns an authorization error and no changes are made.
4. **Given** an authenticated author with an invalid post ID, **When** they attempt to update, **Then** the system returns a not-found error.

---

### User Story 3 - Fetch Community Post Details for Editing (Priority: P3)

An authenticated user navigates to the edit page for a community post they authored. The system fetches the full post data including all attachments so the form can be pre-populated.

**Why this priority**: This is a read operation that supports the update flow. It is necessary for the edit form but less critical than the write operations.

**Independent Test**: Can be fully tested by creating a post with attachments, then calling the details query and verifying the returned data matches what was inserted.

**Acceptance Scenarios**:

1. **Given** a valid post ID for an existing post with 3 attachments, **When** the details are fetched, **Then** the response includes the complete post data (title, content, category, status, timestamps) and all 3 attachment records with their file URLs.
2. **Given** a valid post ID for an existing post with no attachments, **When** the details are fetched, **Then** the response includes the complete post data and an empty attachments array.
3. **Given** an invalid or non-existent post ID, **When** the details are fetched, **Then** the system returns null or a not-found error.

---

### Edge Cases

- What happens when a post is created with the maximum allowed attachments (5)?
- How does the system handle a concurrent update where another request modifies the same post?
- What happens when an attachment URL references a file that was deleted from storage?
- What happens when the database is temporarily unavailable during a create or update operation?
- How does the system handle a post update that changes zero fields (no-op update)? → **Resolved**: The update query returns early with a success response and makes no DB call when no content fields and no attachments are provided.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST authenticate the user before any create or update operation using the existing authentication pattern.
- **FR-002**: System MUST validate all input data against the community post schemas on the server side before database operations.
- **FR-003**: System MUST insert a new community post record with `content_status = 'published'` and `published_at` set to the current timestamp when creating a post.
- **FR-004**: System MUST insert corresponding attachment records when attachments are provided during post creation.
- **FR-005**: System MUST roll back the created post if attachment insertion fails during the create operation.
- **FR-006**: System MUST verify that the authenticated user is the author of the post before allowing an update (ownership check via `author_id`).
- **FR-007**: System MUST handle attachment differences during updates: insert new attachment URLs and delete removed attachment rows.
- **FR-008**: System MUST fetch a single post with all its attachments for the edit-mode details query.
- **FR-009**: All server actions MUST be wrapped with the standard error handler to provide consistent error response formatting.
- **FR-010**: Create and update actions MUST trigger page revalidation for relevant community pages after successful operations.
- **FR-011**: All query and action functions MUST follow the existing module pattern: raw queries in a queries file, wrapped actions in an actions file.

### Key Entities

- **Community Post**: The primary content unit — contains title, content, category, publication status, and timestamps. Linked to an author (user) via `author_id`.
- **Community Post Attachment**: A file reference associated with a post — contains the storage URL of the uploaded file. Linked to a post via `post_id`. Multiple attachments per post (up to 5).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new community post (with or without attachments) can be created and persisted in under 3 seconds from action invocation to success response.
- **SC-002**: An existing community post can be updated (including attachment changes) in under 3 seconds from action invocation to success response.
- **SC-003**: Post details (including all attachments) can be fetched for edit-mode display in under 1 second.
- **SC-004**: 100% of create and update operations enforce authentication — unauthenticated requests never reach the database.
- **SC-005**: 100% of update operations enforce author ownership — non-authors cannot modify another user's post.
- **SC-006**: Failed attachment insertion during creation results in full rollback with zero orphaned post rows.
- **SC-007**: All server actions return responses in the standardized success/error format with consistent structure.

## Assumptions

- The `community_posts` and `community_posts_attachments` database tables already exist with the schema defined in the project plan (created via migration).
- The `community-attachments` storage bucket exists with appropriate access policies. File upload to storage is handled client-side — the queries only store the resulting URLs.
- Database-level access policies are configured to allow authenticated users to insert their own posts and only update posts they authored.
- Server-side validation schemas will accept attachment URLs (strings) rather than File objects, since file uploads happen on the client before the server action is called.
- The existing authentication utility is used for all auth checks, consistent with the listings module pattern.
- Page revalidation targets `/community` and `/community/[postId]` — these routes may not exist yet but will be created in a later phase.
- Attachment deletion from file storage during updates (removing orphaned files) is out of scope for this phase — only database records are managed. Storage cleanup can be addressed in a later phase or via a background job.
