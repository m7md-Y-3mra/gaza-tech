# Feature Specification: Admin Statistics Dashboard

**Feature Branch**: `016-admin-statistics-dashboard`  
**Created**: 2026-04-15  
**Status**: Draft  
**Input**: User description: "I need to make statistics page in dashboard in @app/\[locale\]/dashboard/page.tsx, in top card and then charts, only admains can show this page"

## Clarifications

### Session 2026-04-15

- Q: How frequently should the dashboard data be updated? → A: Near Real-time (refresh on page load)
- Q: What level of time-range filtering is required for the charts? → A: Preset ranges (e.g., last 7, 30, or 90 days)
- Q: How should the statistical data be aggregated? → A: Frontend aggregation (calculate in Component/Hook)
- Q: Are export capabilities required for the dashboard data? → A: Download CSV/Excel
- Q: Where should the dashboard-specific components be located? → A: `@modules/dashboard/components/**`
- Q: How should the statistical data be retrieved from Supabase? → A: Single Supabase RPC (returns all metrics in one JSON)
- Q: Which chart type is preferred for Growth Trends? → A: Line Chart
- Q: Should summary cards include a percentage change comparison? → A: Totals + % Change (e.g., "+5% vs last month")
- Q: Which React chart library should be used? → A: Recharts
- Q: What is the grid layout for summary cards? → A: 4 (Desktop) / 2 (Tablet) / 1 (Mobile)

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Admin Views Key Metrics Summary (Priority: P1)

As an administrator, I want to see a high-level summary of system activity through cards at the top of the dashboard so that I can quickly assess the current state of the platform.

**Why this priority**: Essential for immediate situational awareness and the primary "at-a-glance" value of the dashboard.

**Independent Test**: Can be fully tested by an admin user logging in and navigating to the dashboard, verifying that the summary cards are visible and contain data.

**Acceptance Scenarios**:

1. **Given** I am logged in as an administrator, **When** I navigate to the dashboard page, **Then** I should see a set of cards at the top displaying key summary metrics.
2. **Given** the summary cards are visible, **When** the underlying system data changes, **Then** the cards should reflect the updated totals upon page refresh or periodic update.

---

### User Story 2 - Admin Analyzes Trends via Visual Charts (Priority: P2)

As an administrator, I want to view data trends through interactive charts below the summary cards so that I can identify patterns and changes over time.

**Why this priority**: Provides deeper insight into system health and growth beyond simple totals.

**Independent Test**: Can be tested by verifying that charts render correctly with data and respond to user interactions (like hovering for details).

**Acceptance Scenarios**:

1. **Given** I am on the dashboard page, **When** I scroll below the top cards, **Then** I should see charts visualizing system trends.
2. **Given** a chart is displayed, **When** I interact with the chart elements (e.g., hover over a data point), **Then** detailed information for that specific point should be shown.

---

### User Story 3 - Restrict Access to Administrators Only (Priority: P1)

As a security-conscious system owner, I want to ensure that only authorized administrators can access the statistics dashboard so that sensitive platform metrics remain private.

**Why this priority**: Critical for security and data privacy.

**Independent Test**: Can be tested by attempting to access the dashboard URL with a non-admin account and verifying the user is blocked.

**Acceptance Scenarios**:

1. **Given** I am logged in as a regular user (non-admin), **When** I attempt to navigate to the dashboard page, **Then** I should be redirected or shown an "Access Denied" message.
2. **Given** I am not logged in, **When** I attempt to access the dashboard URL, **Then** I should be redirected to the login page.

---

### User Story 4 - Admin Exports Data for Offline Analysis (Priority: P3)

As an administrator, I want to download the statistical data as a CSV or Excel file so that I can perform further analysis or share reports with stakeholders.

**Why this priority**: Supports operational reporting and deeper data processing needs.

**Independent Test**: Can be tested by clicking an export button and verifying that a file is downloaded with the correct data.

**Acceptance Scenarios**:

1. **Given** I am on the dashboard page, **When** I click the "Export" button, **Then** a CSV/Excel file containing the current metrics and trend data should be downloaded to my device.

---

### Edge Cases

- **No Data Available**: If there is no data to display for a specific metric or chart, the system should show a "No data available" placeholder instead of an error or empty space.
- **Slow Data Loading**: While statistics are being calculated or fetched, a loading state should be displayed to the admin.
- **Unauthorized Role Change**: If an admin's role is revoked while they are on the page, the next navigation or data refresh should trigger an access check.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST restrict access to the `/dashboard` route to users with the "admin" role.
- **FR-002**: System MUST display a "Top Cards" section containing summary metrics for: Total Users, New Listings/Posts, and Pending Reports/Verification Requests. Each card MUST include a percentage change comparison to the previous equivalent period.
- **FR-003**: System MUST display a "Charts" section below the cards using Line Charts to visualize Growth Trends for Daily New Users and Listing growth.
- **FR-004**: System MUST support full localization for all text, labels, and date formats on the dashboard.
- **FR-005**: System MUST provide a responsive grid layout for summary cards: 4 columns on desktop, 2 on tablet, and 1 on mobile.
- **FR-006**: Data in cards and charts MUST refresh automatically upon page load/navigation to ensure near real-time accuracy.
- **FR-007**: System MUST allow administrators to filter chart data using preset time ranges (e.g., 7 days, 30 days, 90 days).
- **FR-008**: System MUST aggregate statistical data on the frontend within the dashboard components or specialized hooks to calculate totals and trends.
- **FR-009**: System MUST provide a feature to download displayed dashboard data in CSV or Excel format.
- **FR-010**: Dashboard components MUST be located within the `@modules/dashboard/components/` directory.
- **FR-011**: System MUST fetch all dashboard metrics using a single Supabase RPC call for optimal performance.
- **FR-012**: System MUST use the `recharts` library for implementing all dashboard charts.

### Key Entities _(include if feature involves data)_

- **System Statistics**: A collection of aggregated data points representing platform activity (users, content, interactions).
- **Admin User**: An authenticated user with elevated permissions allowing access to restricted administrative views.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Administrative users can view the dashboard page with statistics loaded within 3 seconds on a standard connection.
- **SC-002**: 100% of non-admin access attempts to the dashboard are successfully blocked.
- **SC-003**: All charts and cards display labels in the user's selected language.
- **SC-004**: Data shown in cards and charts matches the actual database state at the time of the last refresh (page load).
- **SC-005**: Switching between preset time ranges updates the charts in under 1 second.
- **SC-006**: Export files are generated and start downloading within 2 seconds of the user request.

## Assumptions

- **Existing Role System**: The platform already has a robust role-based access control (RBAC) system that can distinguish between "admin" and other user types.
- **Metric Definitions**: Standard definitions for "Active User" or "Active Listing" are already established in the business logic.
- **Navigation**: The dashboard is accessible via a link in the main navigation for admin users.
- **Data Source**: The system has access to the necessary databases to aggregate the required statistics.
