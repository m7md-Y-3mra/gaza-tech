# Tasks: Admin Statistics Dashboard

**Feature**: Admin Statistics Dashboard  
**Branch**: `016-admin-statistics-dashboard`  
**Status**: Planning  
**Spec**: `/specs/016-admin-statistics-dashboard/spec.md`  
**Plan**: `/specs/016-admin-statistics-dashboard/plan.md`

## Phase 1: Setup

Initial project configuration and dependency management.

- [x] T001 Install Recharts dependency: `npm install recharts`
- [x] T002 Install xlsx dependency for data export: `npm install xlsx`
- [x] T003 Add dashboard translation keys to `messages/en.json` (Summary, Charts, Filters, Export)
- [x] T004 Add dashboard translation keys to `messages/ar.json` (Summary, Charts, Filters, Export)
- [x] T005 [P] Create directory structure for dashboard modules in `modules/dashboard/components/` (summary-cards, growth-charts, export-button, time-range-filter)

## Phase 2: Foundational

Blocking prerequisites for all user stories.

- [x] T006 Define dashboard types in `modules/dashboard/types/index.ts` (MetricComparison, AdminDashboardSummary, AdminTrendPoint, AdminDashboardStatsResponse, TimeRange)
- [x] T007 [P] Create Supabase RPC `get_admin_dashboard_stats` in database (per contract in `/contracts/rpc-get-admin-dashboard-stats.md`)
- [x] T008 Implement database query in `modules/dashboard/queries.ts` to call the `get_admin_dashboard_stats` RPC
- [x] T009 Implement server action in `modules/dashboard/actions.ts` wrapped with `errorHandler()` to expose the statistics query

## Phase 3: User Story 3 - Restrict Access to Administrators Only (P1)

**Goal**: Secure the dashboard route using RBAC.  
**Test**: Non-admins (or unauthenticated users) attempting to access `/dashboard` are redirected or blocked.

- [x] T010 [US3] Create dashboard page entry point in `app/[locale]/dashboard/page.tsx` as a Server Component
- [x] T011 [US3] Implement RBAC check in `app/[locale]/dashboard/page.tsx` using `lib/supabase/server.ts` to ensure only "admin" users can proceed
- [x] T012 [US3] Verify redirection for non-admin users in `app/[locale]/dashboard/page.tsx`

## Phase 4: User Story 1 - Admin Views Key Metrics Summary (P1)

**Goal**: Display summary cards with percentage changes.  
**Test**: Dashboard displays 4 cards (Users, Listings, Posts, Pending) with totals and % change.

- [x] T013 [US1] Create `modules/dashboard/components/summary-cards/SummaryCard.tsx` for individual metric display
- [x] T014 [US1] Create `modules/dashboard/components/summary-cards/SummaryCards.tsx` to render the responsive 4/2/1 grid
- [x] T015 [US1] Implement percentage change calculation logic in `modules/dashboard/components/summary-cards/SummaryCards.tsx`
- [x] T016 [US1] Integrate `SummaryCards` into `app/[locale]/dashboard/page.tsx` and pass fetched summary data

## Phase 5: User Story 2 - Admin Analyzes Trends via Visual Charts (P2)

**Goal**: Display interactive line charts for growth trends.  
**Test**: Dashboard displays Line Charts for New Users and Listing Growth that update on filter change.

- [x] T017 [US2] Create `modules/dashboard/components/time-range-filter/TimeRangeFilter.tsx` with preset options (7d, 30d, 90d)
- [x] T018 [US2] Create `modules/dashboard/components/growth-charts/GrowthChart.tsx` as a client component using Recharts `LineChart`
- [x] T019 [US2] Implement responsive container and tooltips for `GrowthChart`
- [x] T020 [US2] Create `modules/dashboard/components/growth-charts/GrowthCharts.tsx` to coordinate multiple charts
- [x] T021 [US2] Integrate `TimeRangeFilter` and `GrowthCharts` into `app/[locale]/dashboard/page.tsx` with state/URL handling for filters

## Phase 6: User Story 4 - Admin Exports Data for Offline Analysis (P3)

**Goal**: Download statistical data as CSV or Excel.  
**Test**: Clicking export button downloads a valid .xlsx or .csv file with dashboard data.

- [x] T022 [US4] Create `modules/dashboard/components/export-button/ExportButton.tsx`
- [x] T023 [US4] Implement Excel/CSV generation logic using `xlsx` library in `ExportButton.tsx`
- [x] T024 [US4] Integrate `ExportButton` into the dashboard header in `app/[locale]/dashboard/page.tsx`

## Phase 7: Polish & Cross-Cutting Concerns

Final refinements and quality checks.

- [x] T025 Implement skeleton loaders for cards and charts during data fetching in `modules/dashboard/components/`
- [x] T026 Ensure all chart labels and tooltips are localized using `next-intl`
- [x] T027 Verify mobile/tablet responsiveness for charts and grid layout
- [ ] T028 Run `npm run check` to ensure no lint, format, or type errors

## Implementation Strategy

1. **Infrastructure First**: Deploy the Supabase RPC and verify query results.
2. **MVP (US3 + US1)**: Secure the page and display the summary cards. This provides immediate value.
3. **Visualization (US2)**: Add the interactive charts and time filtering.
4. **Utility (US4)**: Add the export functionality.
5. **Polish**: Finalize loaders, responsiveness, and localization.

## Dependencies

- US3 (T010-T012) is the entry point for all other stories.
- Foundational tasks (T006-T009) are required before US1, US2, and US4.
- US1 (Summary) should be completed before US2 (Trends).

## Parallel Execution Examples

- [P] T003 & T004 (Translations)
- [P] T007 & T008 (DB RPC vs DB Query setup)
- [P] T013 (Card UI) can be built while T009 (Server Action) is being implemented.
