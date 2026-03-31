# Feature Specification: Reusable File Upload Component

**Feature Branch**: `001-reusable-file-upload`
**Created**: 2026-03-25
**Status**: Draft
**Input**: User description: "Extract a reusable file upload component from the listings image upload so both Listings and Community Post modules can share it"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Listings Image Upload Continues Working (Priority: P1)

A seller creating or editing a listing uploads images exactly as they do today. The drag-and-drop area, image grid with thumbnails, reorder capability, file validation, and upload-to-storage flow all behave identically after the extraction.

**Why this priority**: This is the highest-risk change. Extracting shared code must not break the existing, production-grade listings upload. Any regression here directly impacts sellers.

**Independent Test**: Can be fully tested by creating and editing a listing with images, verifying that all current upload behaviors (drag-drop, file picker, thumbnail selection, remove, validation errors) still work identically.

**Acceptance Scenarios**:

1. **Given** a seller is on the create listing form, **When** they drag and drop images into the upload area, **Then** the images appear in the grid with previews, the first image is auto-marked as thumbnail, and the count badge updates.
2. **Given** a seller has uploaded 3 images, **When** they click the thumbnail button on image #2, **Then** image #2 becomes the thumbnail and image #1 loses its thumbnail badge.
3. **Given** a seller is editing a listing with existing images, **When** the edit form loads, **Then** all existing images display in the grid and can be removed or replaced.
4. **Given** a seller uploads a file that exceeds the size limit or is an unsupported format, **When** the file is rejected, **Then** a user-friendly error message appears naming the specific file and the reason.

---

### User Story 2 - Community Post Author Attaches Files (Priority: P2)

A community member creating a post can optionally attach files (images and PDFs) to their post. The upload area supports drag-and-drop and file selection, displays file previews (image thumbnails for images, file name/icon for non-images), validates file types and sizes, and uploads to storage.

**Why this priority**: This is the primary new consumer of the shared component. It validates that the extraction is genuinely reusable with a different configuration (different bucket, different accepted types, no thumbnail/reorder features).

**Independent Test**: Can be tested by using the shared upload component in a simple page with community-specific configuration (images + PDFs, no thumbnail selection, file-list display mode) and confirming files upload to the correct storage bucket.

**Acceptance Scenarios**:

1. **Given** a user is on the create community post form, **When** they drag and drop a PDF and an image, **Then** both files appear in the attachment list with appropriate previews.
2. **Given** a user has attached 5 files (the maximum), **When** they try to add another, **Then** the upload area is hidden or disabled and an error message indicates the limit.
3. **Given** a user is editing a community post with existing attachments, **When** the edit form loads, **Then** existing attachments display with a remove option.

---

### User Story 3 - Developer Integrates Upload in a New Module (Priority: P3)

A developer building a future module (e.g., marketplace reviews, support tickets) can import the shared file upload component and configure it for their needs without duplicating upload logic.

**Why this priority**: Demonstrates the component's extensibility and validates the configuration-driven design. Not blocking for the immediate community post feature but ensures long-term value.

**Independent Test**: Can be tested by importing the shared component with a custom configuration (e.g., different bucket, single file only, custom accepted types) and confirming it works without modification.

**Acceptance Scenarios**:

1. **Given** a developer imports the shared upload component, **When** they pass a configuration object specifying bucket name, path prefix, max files, accepted types, and display mode, **Then** the component behaves according to that configuration.
2. **Given** a developer does not enable compression, **When** files are uploaded, **Then** they are stored in their original format without compression.

---

### Edge Cases

- What happens when a user drops files that are a mix of valid and invalid types? Only valid files should be accepted; invalid files should show individual error toasts with the file name and reason.
- What happens when an upload fails mid-batch (e.g., network error after 2 of 4 files)? Successfully uploaded files should be cleaned up from storage, and the user should see a clear error message.
- What happens when a user removes a file that was just uploaded but not yet saved? The file should be removed from the local preview state. Since uploads happen on form submit (not on selection), no storage cleanup is needed for local removals.
- What happens if the user closes the browser mid-upload? No client-side cleanup is attempted. Orphaned files from interrupted uploads are handled by server-side cleanup (TTL/cron policy), not `beforeunload`.
- What happens when the component is in disabled state (e.g., during form submission)? The drop zone, file picker, and all action buttons (remove, set thumbnail) should be non-interactive.
- What happens when an image file is technically valid but corrupted and cannot generate a preview? The file should still appear in the list with a fallback placeholder icon.

## Clarifications

### Session 2026-03-29

- Q: In file-list display mode, should image files show inline thumbnail previews or uniform file-type icons? → A: Inline thumbnail previews for image files, file-type icons for non-image files.
- Q: Should the shared component support per-file upload progress indication? → A: No. Binary loading state only (spinner/disabled), matching current behavior. Progress can be added later if needed.
- Q: How should cleanup work if the user closes the browser mid-upload? → A: No client-side cleanup for tab close. Rely on server-side orphan cleanup (TTL/cron). `beforeunload` is unreliable for async operations.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a shared file upload component that accepts a configuration object controlling: storage bucket name, path prefix, maximum number of files, maximum file size per file, accepted MIME types, whether image compression is enabled, and display mode (image grid or file list).
- **FR-002**: System MUST support drag-and-drop file selection and click-to-browse file selection.
- **FR-003**: System MUST validate each selected file against the configured accepted types and maximum size, rejecting invalid files with per-file error messages.
- **FR-004**: System MUST upload files to the configured storage bucket under the configured path prefix, generating unique file names to avoid collisions.
- **FR-005**: System MUST support an image-grid display mode with: image previews, thumbnail designation, thumbnail selection, and empty-slot placeholders (for the listings use case). Drag-to-reorder is a follow-up enhancement and is not required in the initial extraction.
- **FR-006**: System MUST support a file-list display mode with: file name, file size, a remove button, and inline thumbnail previews for image files with file-type icons for non-image files (for the community post use case).
- **FR-007**: System MUST integrate with the existing form library so that the file state is synced to the form field and participates in form validation.
- **FR-008**: System MUST support both "create" mode (empty initial state) and "update" mode (pre-populated with existing file URLs).
- **FR-009**: System MUST clean up successfully uploaded files from storage if the batch upload fails partway through.
- **FR-010**: System MUST optionally compress image files before upload when compression is enabled in the configuration.
- **FR-011**: The existing listings image upload MUST continue to function identically after the extraction — zero behavioral or visual change.
- **FR-012**: System MUST enforce the configured maximum file count, preventing additional files from being added once the limit is reached.

### Key Entities

- **File Upload Item**: Represents a single file in the upload queue. Has an identifier, a preview (image URL or file icon), the raw file (for new uploads), an existing-file flag (for update mode), and optional metadata (thumbnail designation).
- **File Upload Configuration**: Defines the behavior of a specific upload instance. Includes bucket name, path prefix, max files, max size, accepted types, compression flag, and display mode.
- **Upload Result**: Represents a successfully uploaded file. Contains the storage path and the public URL.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Listings image upload behaves identically after refactor — all existing acceptance scenarios pass with zero changes to the listings form code beyond import paths.
- **SC-002**: A new module (community posts) can integrate the upload component by providing only a configuration object, requiring no duplication of upload, validation, or storage logic.
- **SC-003**: Users can upload files via drag-and-drop or file picker within 2 interactions (drop or click + select).
- **SC-004**: Invalid files are rejected with a specific, user-visible error message within 1 second of selection.
- **SC-005**: The shared component supports at least two distinct display modes (image grid, file list) without conditional code in the consuming module.

## Assumptions

- The existing listings image upload is the sole source of truth for current upload behavior; the extraction preserves all of its functionality.
- Image compression (via the existing `compressImage` utility) is only applied when explicitly enabled in the configuration — non-image files and community attachments default to no compression.
- The community posts storage bucket, its access policies, and the community post form page are all created separately (out of scope for this spec); this spec only requires the shared component to support `file-list` display mode with a configurable bucket name. US2 acceptance scenarios validate the shared component's capability, not the community form integration.
- The shared component lives in the global `components/` directory, not inside any module, since it is shared across modules.
- Thumbnail designation and image reordering are features only relevant to the image-grid display mode; the file-list mode does not expose these controls.
- The existing form library integration pattern (syncing state via `setValue`) is preserved in the shared component.
- The spec uses the term "thumbnail" for the technical concept of selecting a primary/cover image. In the user-facing UI, this is displayed as "Cover" / "Set as Cover" (English) and the equivalent in Arabic. Both terms refer to the same feature.
