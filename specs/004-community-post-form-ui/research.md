# Research: Community Post Form UI

**Date**: 2026-04-02 | **Feature**: 004-community-post-form-ui

## R-001: TextAreaField — New Shared Component vs Extending TextField

**Decision**: Create a new `TextAreaField` shared component in `components/text-area-field/`.

**Rationale**: The existing `TextField` component renders an `<input>` element and has no textarea support. The `ListingFormClient` passes `type="textarea"` to `TextField` but this renders `<input type="textarea">` which browsers treat as a plain text input — not a real multi-line textarea. A proper `<textarea>` element is needed for the content field (5,000 char limit). Creating a separate component is cleaner than adding conditional rendering to `TextField`, and follows the project's one-responsibility-per-component rule.

**Alternatives considered**:

- Extend `TextField` with conditional `<textarea>` rendering — rejected because it adds mixed responsibility and complexity to an already-working component.
- Use a shadcn/ui `Textarea` primitive directly — rejected because it lacks the error display, label, and react-hook-form integration that `TextField` provides.

## R-002: CategoryRadioField — Implementation Pattern

**Decision**: Build `CategoryRadioField` as a controlled component using react-hook-form's `Controller` wrapper with native radio buttons styled as a 2×2 card grid.

**Rationale**: The project uses `Controller` from react-hook-form for custom field components. A 2×2 grid of styled radio cards (each showing category name + icon) provides clear visual selection. Using `Controller` integrates naturally with the form's validation and error display patterns.

**Alternatives considered**:

- shadcn/ui `RadioGroup` — viable but adds an extra dependency layer; native radios with Tailwind styling match the project's existing approach better.
- Select dropdown — rejected per spec requirement for a visual radio grid.

## R-003: Post Form Server Component — Data Fetching Pattern

**Decision**: Follow the exact pattern from `ListingForm.tsx` — async server component that fetches data via server actions and passes it to the client component.

**Rationale**: The listing form pattern is established and working. For create mode, no data fetch is needed. For update mode, `getCommunityPostDetailsAction(postId)` fetches the post with attachments. The server component maps the data to `PostFormInitialData` format before passing to `PostFormClient`.

**Alternatives considered**: None — the existing pattern is the documented standard.

## R-004: File Upload Configuration for Community Posts

**Decision**: Use the shared `FileUpload` component with `displayMode: 'file-list'` and community-specific config:

- `bucketName: 'community-attachments'`
- `pathPrefix: 'community/'`
- `maxFiles: 5` (from `MAX_COMMUNITY_ATTACHMENTS`)
- `maxSizeBytes: 5242880` (from `MAX_COMMUNITY_UPLOAD_SIZE`)
- `acceptedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']` (from `ACCEPTED_COMMUNITY_FILE_TYPES`)
- `enableCompression: false` (mixed file types including PDF)

**Rationale**: The shared `FileUpload` component from Phase 1 supports both `image-grid` and `file-list` display modes. Community posts accept mixed file types (images + PDFs), so `file-list` mode is more appropriate than `image-grid`. Constants are already defined in `constants/community-file.ts`.

**Alternatives considered**:

- `image-grid` mode — rejected because community attachments include PDFs, not just images.
- `enableCompression: true` — rejected because PDF files cannot be compressed with browser-image-compression.

## R-005: Redirect After Successful Submit

**Decision**: After create → redirect to `/community`. After update → redirect to `/community` (same as create for v1, since there's no post detail page yet).

**Rationale**: The CHAT.md plan says "redirect to `/community` (or to the post detail page)" and the community detail page doesn't exist yet. Using `router.push('/community')` via `nextjs-toploader/app` follows the listing form's pattern. Can be updated to redirect to the post detail page once it's built.

**Alternatives considered**:

- Redirect to `/community/[postId]` — would be ideal but the detail page doesn't exist yet.

## R-006: Category Icons for Radio Grid

**Decision**: Use lucide-react icons for each category:

- `questions` → `HelpCircle`
- `tips` → `Lightbulb`
- `news` → `Newspaper`
- `troubleshooting` → `Wrench`

**Rationale**: The CHAT.md plan mentions "2×2 grid with icons." lucide-react is already a project dependency and provides appropriate icons for each category. These are semantically meaningful and visually distinct.

**Alternatives considered**: Font Awesome icons — rejected because the project uses lucide-react as the primary icon library.
