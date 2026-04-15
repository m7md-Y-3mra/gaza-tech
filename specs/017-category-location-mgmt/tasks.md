# Tasks: Category and Location Management

**Feature**: Category and Location Management  
**Branch**: `017-category-location-mgmt`  
**Status**: Complete  
**Spec**: `/specs/017-category-location-mgmt/spec.md`  
**Plan**: `/specs/017-category-location-mgmt/plan.md`

## Phase 1: Setup

Initial project configuration and module structure.

- [x] T001 Create directory structure for the module in `modules/category-location/` (types, components, management-page)
- [x] T002 [P] Add translation keys for Categories and Locations to `messages/en.json` (Labels, forms, success/error messages, deletion warnings)
- [x] T003 [P] Add translation keys for Categories and Locations to `messages/ar.json` (Labels, forms, success/error messages, deletion warnings)
- [x] T004 [P] Define TypeScript types in `modules/category-location/types/index.ts` (`MarketplaceCategory`, `Location`, `CreateCategoryInput`, `UpdateCategoryInput`, etc.)

## Phase 2: Foundational

Blocking prerequisites for data operations and validation.

- [x] T005 Implement Zod validation schemas in `modules/category-location/schema.ts` for categories and locations (name, name_ar, slug uniqueness)
- [x] T006 Implement database queries in `modules/category-location/queries.ts` (`getCategories`, `getLocations`, `checkCategoryInUse`, `checkLocationInUse`)
- [x] T007 [P] Implement Category server actions in `modules/category-location/actions.ts` (`createCategory`, `updateCategory`, `deleteCategory`) wrapped with `errorHandler()`
- [x] T008 [P] Implement Location server actions in `modules/category-location/actions.ts` (`createLocation`, `updateLocation`, `deleteLocation`) wrapped with `errorHandler()`

## Phase 3: User Story 1 - Product Category Management (P1)

**Goal**: Enable administrators to perform CRUD on product categories.  
**Test**: Admin can create, edit, view, and delete (if not in use) categories in the dashboard.

- [x] T009 [US1] Create Category creation/edit form in `modules/category-location/components/forms/CategoryForm.tsx` using `react-hook-form`
- [x] T010 [US1] Create Category data table component in `modules/category-location/components/categories-table/CategoriesTable.tsx` using `@tanstack/react-table`
- [x] T011 [US1] Implement Category management page shell in `modules/category-location/management-page/CategoryLocationPage.tsx`
- [x] T012 [US1] Create page entry point in `app/[locale]/dashboard/management/page.tsx` as a Server Component with metadata and SSR support

## Phase 4: User Story 2 - Location Entry Management (P2)

**Goal**: Enable administrators to perform CRUD on location entries.  
**Test**: Admin can manage locations via a separate tab in the management interface.

- [x] T013 [US2] Create Location creation/edit form in `modules/category-location/components/forms/LocationForm.tsx`
- [x] T014 [US2] Create Location data table component in `modules/category-location/components/locations-table/LocationsTable.tsx`
- [x] T015 [US2] Integrate "Locations" tab and table into `modules/category-location/management-page/CategoryLocationPage.tsx` using Shadcn/UI `Tabs`

## Phase 5: User Story 3 - Search and Filter Management (P3)

**Goal**: Provide efficient lookup for categories and locations.  
**Test**: Searching for a name in the data table filters the list in under 500ms.

- [x] T016 [P] [US3] Implement search input and filtering logic in `CategoriesTable.tsx`
- [x] T017 [P] [US3] Implement search input and filtering logic in `LocationsTable.tsx`
- [x] T018 [US3] Add "Clear Filters" button to both tables for improved UX

## Phase 6: Polish & Cross-Cutting Concerns

Final refinements, accessibility, and performance checks.

- [x] T019 Implement deletion protection warning dialog in `modules/category-location/components/` (specifically showing why a delete failed)
- [x] T020 [P] Add accessibility attributes (Aria labels, keyboard navigation for tabs and table actions)
- [x] T021 [P] Implement skeleton loaders for initial table states in `modules/category-location/components/loading/`
- [x] T022 [P] Verify data integrity (SC-004) by testing server action failure modes (invalid inputs, linked deletion attempts)
- [x] T023 [P] Verify standard audit logging is triggered for all CRUD operations
- [x] T024 Run `npm run check` and perform Lighthouse audit to verify Core Web Vitals (LCP < 2.5s, CLS < 0.1)

## Implementation Strategy

1. **Foundational (Phase 1-2)**: Set up the module structure and server-side logic first.
2. **MVP (US1)**: Build the Category management interface. This establishes the pattern for the Location management.
3. **Parity (US2)**: Implement Location management using the established patterns.
4. **Efficiency (US3)**: Add search and filtering capabilities.
5. **Quality (Phase 6)**: Finalize accessibility, performance, and UI polish.

## Dependencies

- Phase 2 (Foundational) is required for all User Stories.
- US1 (Categories) should be implemented before US2 (Locations) to establish UI patterns.
- US3 (Search/Filter) depends on the tables from US1 and US2.

## Parallel Execution Examples

- [P] T002 & T003 (Translation keys for English/Arabic)
- [P] T007 & T008 (Server actions for different entities)
- [P] T016 & T017 (Client-side filtering logic for separate tables)
- [P] T020 & T021 (Accessibility vs Skeleton loaders)
