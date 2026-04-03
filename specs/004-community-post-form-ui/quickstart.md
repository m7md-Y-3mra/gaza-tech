# Quickstart: Community Post Form UI

**Feature**: 004-community-post-form-ui

## Prerequisites

- Phase 1 (reusable-file-upload) complete — `components/file-upload/` exists
- Phase 2 (community-post-schema) complete — `modules/community/schema.ts` and `modules/community/types/index.ts` exist
- Phase 3 (community-post-queries) complete — `modules/community/actions.ts` and `modules/community/queries.ts` exist
- Supabase Storage bucket `community-attachments` configured
- Node.js and npm installed, `npm install` run

## Development

```bash
npm run dev          # Start dev server at localhost:3000
npm run check        # Run format + lint + type-check
```

## Key Files to Create

### Route Pages

```
app/[locale]/(main)/community/create/page.tsx
app/[locale]/(main)/community/[postId]/edit/page.tsx
```

### Module Pages

```
modules/community/create-post/CreatePostPage.tsx
modules/community/create-post/index.ts
modules/community/update-post/UpdatePostPage.tsx
modules/community/update-post/index.ts
```

### Post Form Component

```
modules/community/components/post-form/PostForm.tsx          # Server component
modules/community/components/post-form/PostFormClient.tsx     # Client component
modules/community/components/post-form/PostFormSkeleton.tsx   # Loading state
modules/community/components/post-form/PostFormError.tsx      # Error fallback
modules/community/components/post-form/hooks/usePostForm.ts   # Form logic
modules/community/components/post-form/constant.ts            # Default values
modules/community/components/post-form/types/index.ts         # Props types
modules/community/components/post-form/index.ts               # Barrel export
```

### Sub-Components

```
modules/community/components/post-form/components/category-radio-field/CategoryRadioField.tsx
modules/community/components/post-form/components/category-radio-field/index.ts
```

### Shared Component

```
components/text-area-field/TextAreaField.tsx
components/text-area-field/index.ts
```

### Translation Files (update existing)

```
messages/en.json    # Add PostForm namespace
messages/ar.json    # Add PostForm namespace
```

## Existing Patterns to Follow

- **Server → Client pattern**: See `modules/listings/components/listing-form/ListingForm.tsx` → `ListingFormClient.tsx`
- **Form hook pattern**: See `modules/listings/components/listing-form/hooks/useListingForm.ts`
- **Module page pattern**: See `modules/listings/create-listing/CreateListingPage.tsx`
- **Route page pattern**: See `app/[locale]/(main)/listings/create/page.tsx`
- **File upload usage**: See `components/file-upload/` with `FileUploadConfig` type
- **Error handling**: `errorHandler()` from `utils/error-handler.ts`
- **Translations**: Factory schemas with `t` parameter, `useTranslations('PostForm')` in client components

## File Upload Config for Community

```typescript
const communityFileUploadConfig: FileUploadConfig = {
  bucketName: 'community-attachments',
  pathPrefix: 'community/',
  maxFiles: MAX_COMMUNITY_ATTACHMENTS, // 5
  maxSizeBytes: MAX_COMMUNITY_UPLOAD_SIZE, // 5MB
  acceptedTypes: ACCEPTED_COMMUNITY_FILE_TYPES, // images + pdf
  enableCompression: false,
  displayMode: 'file-list',
};
```

## Smoke Test Checklist

1. Navigate to `/community/create` — form renders with all fields
2. Fill title + content + select category → click Publish → post created, redirected
3. Navigate to `/community/[postId]/edit` — form pre-filled with existing data
4. Edit title → click Update → changes persist
5. Add attachments on create → verify files in storage + DB rows
6. Remove attachment on edit → verify deleted from storage + DB
7. Submit with invalid data → inline errors appear
8. Switch language to Arabic → all form labels translated
9. Tab through all form elements → keyboard accessible
