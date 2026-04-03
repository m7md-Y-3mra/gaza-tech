# Feature Specification: Community Post Schema

**Feature Branch**: `002-community-post-schema`
**Created**: 2026-03-31
**Status**: Draft
**Input**: User description: "Zod schemas and TypeScript types for community post create/update forms, including validation for title, content, category, and attachments"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Create a New Community Post (Priority: P1)

A community member fills out the post creation form with a title, selects a category, writes content, and optionally attaches files. The system validates all inputs before submission, providing clear error messages for any invalid fields. Upon successful validation, the form data is ready for server submission.

**Why this priority**: This is the core flow. Without validated create data, no posts can be created.

**Independent Test**: Can be fully tested by submitting a create form with various valid and invalid inputs and verifying that validation passes or returns appropriate error messages.

**Acceptance Scenarios**:

1. **Given** a user is on the create post form, **When** they submit with a valid title (5-100 chars), valid content (10-5000 chars), a selected category, and no attachments, **Then** the form data passes validation successfully.
2. **Given** a user is on the create post form, **When** they submit with a title shorter than 5 characters, **Then** a translated validation error is shown for the title field.
3. **Given** a user is on the create post form, **When** they submit with content shorter than 10 characters, **Then** a translated validation error is shown for the content field.
4. **Given** a user is on the create post form, **When** they attach up to 5 files (each under 5MB, images or PDFs), **Then** the attachments pass validation.
5. **Given** a user is on the create post form, **When** they attach more than 5 files or a file exceeding 5MB, **Then** a translated validation error is shown for attachments.

---

### User Story 2 - Update an Existing Community Post (Priority: P2)

A community member edits their existing post. The form is pre-filled with current values. The update schema validates the same fields as create but also allows existing attachment URLs alongside new file uploads.

**Why this priority**: Update functionality is essential but secondary to creation. It extends the create schema with additional handling for existing attachments.

**Independent Test**: Can be tested by loading an existing post into the form, modifying fields, and verifying that validation handles both new file uploads and existing attachment URLs.

**Acceptance Scenarios**:

1. **Given** a user is editing an existing post, **When** they modify the title and submit, **Then** validation passes with the updated title if it meets length requirements.
2. **Given** a user is editing a post with existing attachments, **When** they keep some existing attachments and add new files, **Then** validation accepts both existing URLs and new File objects in the attachments array.
3. **Given** a user is editing a post, **When** they remove all attachments, **Then** validation passes since attachments are optional.

---

### User Story 3 - Receive Translated Validation Messages (Priority: P3)

Users interacting with the form in Arabic or English see validation error messages in their active language. Schema factories accept a translation function to produce localized messages.

**Why this priority**: Internationalization is a project requirement but the schema structure works independently of translations.

**Independent Test**: Can be tested by instantiating schemas with different translation functions and verifying that error messages match the expected locale strings.

**Acceptance Scenarios**:

1. **Given** the form is rendered in Arabic, **When** a validation error occurs, **Then** the error message is displayed in Arabic.
2. **Given** the form is rendered in English, **When** a validation error occurs, **Then** the error message is displayed in English.

---

### Edge Cases

- What happens when a user submits a title with exactly 5 or exactly 100 characters? (boundary values should pass)
- What happens when content is exactly 10 or exactly 5000 characters? (boundary values should pass)
- What happens when a user attaches a file of an unsupported type (e.g., .exe)? (validation rejects it)
- What happens when a user attaches a file that is exactly 5MB? (should pass)
- What happens when the category field is missing or contains an invalid value? (validation rejects it)
- How does the update schema handle a mix of existing URL strings and new File objects in the attachments array?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a schema factory function for creating community posts that accepts a translation function and returns a validation schema.
- **FR-002**: System MUST validate the `title` field as a required string with a minimum length of 5 and maximum length of 100 characters.
- **FR-003**: System MUST validate the `content` field as a required string with a minimum length of 10 and maximum length of 5000 characters.
- **FR-004**: System MUST validate the `post_category` field as a required value restricted to: `questions`, `tips`, `news`, `troubleshooting`, with a schema-level default of `questions`.
- **FR-005**: System MUST validate the `attachments` field as an optional array of files, with a maximum of 5 files, each not exceeding 5MB, and accepting only image files and PDFs.
- **FR-006**: System MUST provide a separate schema factory for updating community posts where the attachments array can contain both new file uploads and existing attachment URL strings (validated as valid URL format via `z.string().url()`).
- **FR-007**: All validation error messages MUST be translatable via the translation function passed to the schema factory.
- **FR-008**: System MUST export inferred types from both create and update schemas for use in form components and server actions.
- **FR-009**: System MUST export types derived from the database schema for community posts and community post attachments (Row, Insert, Update variants).
- **FR-010**: System MUST export a post category type representing the allowed category values.
- **FR-011**: System MUST export a form mode type with values `create` and `update`.

### Key Entities

- **Community Post**: Represents a user-authored post with title, content, category, and publication status (server-managed, not part of form schemas). Related to an author (user) and optionally to attachments.
- **Community Post Attachment**: Represents a file attached to a community post, identified by a URL. Related to exactly one community post.
- **Post Category**: A constrained set of values (questions, tips, news, troubleshooting) classifying the post topic.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All form submissions with valid data pass schema validation with zero false rejections.
- **SC-002**: All form submissions with invalid data are rejected with field-specific, translated error messages.
- **SC-003**: Boundary values (min/max lengths, max file count, max file size) are correctly enforced — values at the boundary pass, values beyond fail.
- **SC-004**: Both create and update schemas integrate with the project's form library without additional adapters or workarounds.
- **SC-005**: Type inference from schemas produces complete types that match the expected form data structure, enabling autocomplete and compile-time safety.

## Clarifications

### Session 2026-04-01

- Q: Should the schema include a `published` or `status` field for publication status? → A: Exclude from form schemas — server manages publication status automatically.
- Q: How should existing attachment URLs be validated in the update schema? → A: Validate as valid URL format (`z.string().url()`).
- Q: Where should the default post category (`questions`) be applied? → A: Schema-level default via Zod `.default('questions')`.

## Assumptions

- The existing project pattern of schema factories accepting a translation function (as seen in the listings module) will be followed.
- The database schema for `community_posts` and `community_posts_attachments` tables is stable and matches the documented structure.
- Accepted attachment file types for community posts are: JPEG, PNG, GIF, WebP (images) and PDF.
- Phase 1 (reusable file upload) provides file handling infrastructure but the schema itself does not depend on it — schemas define validation rules only.
- The community module will follow the project's established module structure conventions under `modules/community/`.
- Default post category is `questions` if not explicitly selected by the user.
