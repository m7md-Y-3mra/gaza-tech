# Tasks: Community Post Schema

**Input**: Design documents from `/specs/002-community-post-schema/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Not requested — test tasks omitted.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create module directory structure and shared constants

- [X] T001 Create community module directory structure at `modules/community/types/` and `modules/community/`
- [X] T002 [P] Create community file upload constants (MAX_COMMUNITY_UPLOAD_SIZE=5MB, MAX_COMMUNITY_ATTACHMENTS=5, ACCEPTED_COMMUNITY_FILE_TYPES) in `constants/community-file.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database-derived types and enums that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Export database-derived types (CommunityPost, InsertCommunityPost, UpdateCommunityPost, CommunityPostAttachment, InsertCommunityPostAttachment, UpdateCommunityPostAttachment) from Supabase-generated types in `modules/community/types/index.ts`
- [X] T004 Export PostCategory enum type (`questions | tips | news | troubleshooting`) and POST_CATEGORIES constant object in `modules/community/types/index.ts`
- [X] T005 Export FormMode type (`'create' | 'update'`) in `modules/community/types/index.ts`

**Checkpoint**: Foundation ready — types and constants available for schema factories

---

## Phase 3: User Story 1 — Create a New Community Post (Priority: P1) 🎯 MVP

**Goal**: Schema factory for creating community posts with translated validation, including title, content, category, and optional file attachments

**Independent Test**: Instantiate `createCreateCommunityPostClientSchema(t)` with a mock translation function, then validate various valid/invalid payloads (boundary values, missing fields, wrong MIME types, oversized files)

### Implementation for User Story 1

- [X] T006 [US1] Add English translation keys under `CommunityForm.validation` namespace (titleRequired, titleMin, titleMax, contentRequired, contentMin, contentMax, categoryRequired, attachmentMaxSize, attachmentInvalidType, attachmentsMaxCount) in `messages/en.json`
- [X] T007 [P] [US1] Add Arabic translation keys under `CommunityForm.validation` namespace (same keys as English) in `messages/ar.json`
- [X] T008 [US1] Implement `createCommunityFileSchema(t)` factory (z.file(), max 5MB, MIME from community-file constants) in `modules/community/schema.ts`
- [X] T009 [US1] Implement `createCreateCommunityPostClientSchema(t)` factory (title: min 5/max 100, content: min 10/max 5000, post_category: enum with default `questions`, attachments: optional array max 5 of file schema) in `modules/community/schema.ts`
- [X] T010 [US1] Export static `createCommunityPostClientSchema` (with identity translation function) for type inference in `modules/community/schema.ts`
- [X] T011 [US1] Export inferred `CreateCommunityPostFormData` type from create schema in `modules/community/types/index.ts`

**Checkpoint**: Create schema fully functional — can validate new post form submissions with translated errors

---

## Phase 4: User Story 2 — Update an Existing Community Post (Priority: P2)

**Goal**: Schema factory for updating posts that accepts both new File uploads and existing attachment URL strings in the attachments array

**Independent Test**: Instantiate `createUpdateCommunityPostClientSchema(t)`, then validate payloads with mixed arrays of File objects and URL strings, as well as empty attachments

### Implementation for User Story 2

- [X] T012 [US2] Implement `createUpdateCommunityPostClientSchema(t)` factory (same fields as create schema but replaces attachments with `z.array(z.union([fileSchema, z.string().url()])).max(5).optional()`) in `modules/community/schema.ts`
- [X] T013 [US2] Export static `updateCommunityPostClientSchema` (with identity translation function) for type inference in `modules/community/schema.ts`
- [X] T014 [US2] Export inferred `UpdateCommunityPostFormData` type from update schema in `modules/community/types/index.ts`

**Checkpoint**: Both create and update schemas functional — forms can validate for both modes

---

## Phase 5: User Story 3 — Receive Translated Validation Messages (Priority: P3)

**Goal**: Verify that schema factories produce locale-specific error messages when instantiated with `useTranslations('CommunityForm.validation')`

**Independent Test**: Instantiate schemas with Arabic and English translation functions, trigger validation errors, and confirm messages match expected locale strings

### Implementation for User Story 3

- [X] T015 [US3] Review and verify all translation keys in `messages/en.json` and `messages/ar.json` match every `t('...')` call in schema factories in `modules/community/schema.ts`
- [X] T016 [US3] Run `npm run type-check` to verify all schema exports, type exports, and translation key usage compile without errors

**Checkpoint**: All three user stories independently functional — schemas produce translated errors in both locales

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [X] T017 Run `npm run check` (format, lint, type-check) to verify all new files pass project quality gates
- [X] T018 Run quickstart.md validation — verify the usage example from `specs/002-community-post-schema/quickstart.md` compiles and works with the implemented schemas

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (module directory must exist) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 (needs types + constants)
- **US2 (Phase 4)**: Depends on Phase 3 (extends create schema)
- **US3 (Phase 5)**: Depends on Phases 3 + 4 (validates translations across both schemas)
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 — no dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 (extends the create schema with union type for attachments)
- **User Story 3 (P3)**: Depends on US1 + US2 (verifies translations across both schemas)

### Within Each User Story

- Translation keys before schema implementation (schemas reference translation keys)
- Schema factories before static exports
- Static exports before inferred type exports

### Parallel Opportunities

- T001 and T002 can run in parallel (different files)
- T003, T004, T005 can be done in a single pass (same file, but logically grouped)
- T006 and T007 can run in parallel (different locale files)
- T008 and T009 are sequential (T009 uses the file schema from T008)

---

## Parallel Example: User Story 1

```bash
# Launch translation tasks in parallel (different files):
Task T006: "Add English translation keys in messages/en.json"
Task T007: "Add Arabic translation keys in messages/ar.json"

# Then sequential schema implementation:
Task T008: "Create file schema factory in modules/community/schema.ts"
Task T009: "Create post schema factory in modules/community/schema.ts"
Task T010: "Export static schema in modules/community/schema.ts"
Task T011: "Export inferred form type in modules/community/types/index.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (directory + constants)
2. Complete Phase 2: Foundational (DB types + enums)
3. Complete Phase 3: User Story 1 (create schema + translations)
4. **STOP and VALIDATE**: `npm run type-check` passes, create schema validates correctly
5. Commit MVP increment

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Create schema works → Commit (MVP!)
3. Add User Story 2 → Update schema works → Commit
4. Add User Story 3 → Translation verification → Commit
5. Polish → All checks pass → Final commit

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- All schemas follow the existing listings module pattern (factory functions + TranslationFunction)
- Constants are in global `constants/` directory (may be shared with file upload component)
- Commit after each phase checkpoint
