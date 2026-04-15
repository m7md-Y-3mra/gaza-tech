# Feature Specification: User Management Data Table

**Feature Branch**: `015-users-data-table`
**Created**: 2026-04-14
**Status**: Draft
**Input**: User description: "read the @userChat.md and create specification for PHASE 4 - Frontend: User Management Data Table"

## Clarifications

### Session 2026-04-14

- Q: What fields does the search input match against? → A: Name (first + last) + email
- Q: Default sort on first load (no URL params)? → A: Joined date, descending (newest first)
- Q: Default page size on first load? → A: 20
- Q: How should "View Details" behave in Phase 4, before the Phase 5 side panel ships? → A: Omit from the menu in Phase 4; add in Phase 5
- Q: How is the ban reason collected during a bulk ban? → A: Single shared reason applied to all selected rows

## User Scenarios & Testing

### User Story 1 - Browse and Find Users (Priority: P1)

An administrator opens the user management page and sees a paginated list of all platform users with key information (avatar, name, role, status, verification, joined date, last active). They can search by name, filter by role and status, sort by any column, and paginate through results to quickly locate specific users.

**Why this priority**: Without the ability to view and locate users, no administrative action is possible. This is the foundational MVP — a read-only table already delivers value (visibility into the user base, audit support, directory lookup) even before any mutation action works.

**Independent Test**: Load the user management page as admin; confirm rows render with the right columns, pagination reflects the total count from the server, searching by name narrows results, role/status filters narrow results, and sorting a column reorders rows — all via server-driven requests. Shareable URL reflects the active table state.

**Acceptance Scenarios**:

1. **Given** the admin opens the user management page, **When** data loads, **Then** the table shows the first page of users with avatar, name, role badge, status badge, verified indicator, joined date, and last-active date; pagination shows correct total row count and page count.
2. **Given** the table is displayed, **When** the admin types a name into the search input and waits briefly, **Then** the list refetches with matching users only and resets to page 1.
3. **Given** the table is displayed, **When** the admin opens the Role filter and selects one or more roles, **Then** only users with the selected roles remain and a count badge appears on the filter button.
4. **Given** the table is displayed, **When** the admin clicks a sortable column header and chooses ascending or descending, **Then** rows refetch sorted by that column.
5. **Given** filters or sort are active, **When** the admin copies the URL and opens it in a new tab, **Then** the same filters, sort, page, and page size are applied automatically.
6. **Given** a filter returns no users, **When** results arrive, **Then** the table shows a clear empty state with a "Reset filters" affordance.
7. **Given** the data is still loading, **When** the page first renders, **Then** skeleton rows are shown in place of data.

---

### User Story 2 - Change a User's Role (Priority: P2)

An administrator finds a user and changes their role (registered, verified_seller, moderator, admin) from the per-row actions menu. The change is confirmed, applied, and reflected immediately in the table without a full page reload.

**Why this priority**: Role changes are the most frequent administrative action after browsing. Delivering this next unlocks the primary job-to-be-done for admins beyond read-only visibility.

**Independent Test**: With Story 1 working, open a row action menu, pick a new role, confirm, and verify that the table updates to show the new role badge and that a success notification appears. The admin's own row must not offer this action.

**Acceptance Scenarios**:

1. **Given** a user row, **When** the admin opens the row actions menu, **Then** "Change Role" reveals the four roles with the current role marked.
2. **Given** the admin selects a different role, **When** the confirmation dialog is accepted, **Then** the role updates on the server, the row re-renders with the new badge, and a success toast is shown.
3. **Given** the change fails (server error or insufficient permission), **When** the server returns an error, **Then** the row stays unchanged and an error toast explains the failure.
4. **Given** the admin is viewing their own row, **When** the row actions menu is opened, **Then** the "Change Role" and "Ban" actions are disabled.

---

### User Story 3 - Ban or Unban a User (Priority: P2)

An administrator bans a user with a required reason, or restores a previously banned user. The table immediately reflects the new status.

**Why this priority**: Moderation is a critical responsibility tied to platform safety; it must ship alongside role management, but role changes are slightly more routine.

**Acceptance Scenarios**:

1. **Given** an active user, **When** the admin chooses "Ban User" and submits a non-empty reason, **Then** the status badge flips to Banned and a success toast is shown.
2. **Given** the admin submits the ban dialog with an empty reason, **When** validation runs, **Then** the dialog shows an inline error and does not submit.
3. **Given** a banned user, **When** the admin chooses "Unban User" and confirms, **Then** the status badge flips to Active.
4. **Given** the admin is viewing their own row, **When** the row actions menu is opened, **Then** "Ban User" is disabled.

---

### User Story 4 - Act on Many Users at Once (Priority: P3)

An administrator selects multiple rows (or the whole current page) and performs a bulk action — change role or ban — with a single confirmation. This saves time when handling batches such as onboarding waves or mass moderation.

**Why this priority**: A quality-of-life accelerator. Single-row actions (Stories 2 & 3) cover all functional needs; bulk is optimization.

**Acceptance Scenarios**:

1. **Given** rows are selected via checkboxes, **When** at least one is selected, **Then** a floating action bar appears showing the selected count and bulk action buttons.
2. **Given** the admin triggers a bulk action, **When** the confirmation dialog is accepted, **Then** the action is applied to every selected row, success/failure is summarized, and selection clears.
3. **Given** rows are selected, **When** the admin changes page or applies a new filter, **Then** the selection clears to prevent acting on rows no longer visible.
4. **Given** the admin's own row is among the selection, **When** a bulk action is executed, **Then** the admin's own row is excluded automatically.

---

### User Story 5 - Customize the View (Priority: P3)

An administrator toggles which columns are visible, resets filters, and changes page size to suit their workflow.

**Acceptance Scenarios**:

1. **Given** the column visibility menu, **When** the admin hides a column, **Then** that column disappears and stays hidden across pagination and sorting changes in the same session.
2. **Given** active filters, **When** the admin clicks "Reset filters", **Then** all filters and the search input clear and results return to the default view.
3. **Given** the pagination controls, **When** the admin picks a new page size, **Then** the table refetches at the new size and resets to page 1.

---

### Edge Cases

- Server returns an error while fetching — show an inline error state with a retry action; existing rows from a previous successful fetch remain visible until retry succeeds.
- User's session loses admin privileges mid-session — subsequent actions return an authorization error; the table shows a clear message and redirects out of the admin area.
- The last user on a page is banned/unbanned and the current filter no longer matches any row on the current page — the table automatically steps back to the previous non-empty page.
- Search input changes rapidly — only the latest request result is rendered; stale responses are discarded.
- A bulk action partially fails — success toast summarizes successes and failures; failing rows retain their previous values.
- URL is opened with invalid filter or page params — invalid params are ignored and defaults apply silently.
- Very long names, emails, or ban reasons — cells truncate with tooltip revealing full content on hover/focus.
- Mobile/narrow screens — the table scrolls horizontally; row actions remain reachable.

## Requirements

### Functional Requirements

**Display & data**

- **FR-001**: The system MUST display users in a paginated table with columns: selection checkbox, avatar, name (first + last), role, status (active/banned), verified indicator, joined date, last active date, and row actions.
- **FR-002**: The system MUST render role as a color-coded badge (registered = gray, verified_seller = blue, moderator = amber, admin = red) and status as a badge (Active = green, Banned = red).
- **FR-003**: The system MUST format joined and last-active dates as human-readable relative dates (e.g., "3 days ago").
- **FR-004**: While data is loading, the system MUST render skeleton rows instead of empty space.
- **FR-005**: When no users match the current query, the system MUST display an empty state with a "Reset filters" affordance.

**Server-driven table operations**

- **FR-006**: Pagination, sorting, filtering, and search MUST be executed on the server; the client MUST NOT paginate, sort, or filter in memory across pages.
- **FR-007**: The system MUST request a specific page, page size, sort column and direction, search term, role filter, and status filter, and MUST receive both the matching rows and the total row count sufficient to drive pagination controls.
- **FR-008**: The system MUST support page sizes of 10, 20, 50, and 100 rows; the default page size on first load (when not specified in the URL) MUST be 20.
- **FR-009**: Search input MUST match against user name (first + last) and email; it MUST be debounced (≈300ms) and MUST reset pagination to page 1 when the search term changes.
- **FR-010**: Role and status filters MUST support multi-select; selecting multiple values MUST return users matching any of the selected values (OR semantics within a filter).
- **FR-011**: Combining search, role filter, and status filter MUST narrow results (AND semantics across filters).
- **FR-012**: Each sortable column MUST support ascending and descending order; only one active sort column at a time is required.
- **FR-012a**: When the admin opens the page with no sort specified in the URL, the system MUST default to sorting by joined date descending (newest users first).

**URL state**

- **FR-013**: The current page, page size, sort column, sort direction, search term, role filter, status filter, and column visibility MUST be reflected in the URL so that the view is shareable and bookmarkable.
- **FR-014**: Opening a URL with valid table-state parameters MUST restore the exact same view on load.

**Row actions**

- **FR-015**: Each row MUST expose an actions menu with: "Change Role" (submenu with the four roles and a check mark on the current role) and "Ban User" / "Unban User" depending on current status. The "View Details" action is deferred to Phase 5 and MUST NOT appear in this feature.
- **FR-016**: Selecting a new role MUST require explicit confirmation before the change is applied.
- **FR-017**: "Ban User" MUST require a non-empty reason before submission; "Unban User" MUST require only a confirmation.
- **FR-018**: The acting administrator MUST NOT be able to change their own role or ban themselves; those actions MUST be disabled on their own row.
- **FR-019**: After a successful row action, the table MUST reflect the new value without a full page reload, and a success notification MUST be shown.
- **FR-020**: After a failed row action, the table MUST NOT change the row's state and MUST show an error notification describing the failure.

**Selection & bulk actions**

- **FR-021**: The system MUST support per-row checkboxes and a header checkbox that selects/deselects all rows on the current page.
- **FR-022**: When one or more rows are selected, the system MUST display a bulk action bar with the selection count and controls for bulk role change and bulk ban.
- **FR-022a**: Bulk ban MUST collect a single shared, non-empty reason in the confirmation dialog and apply that reason to every selected row; per-row reasons are not supported.
- **FR-023**: Bulk actions MUST require explicit confirmation before execution.
- **FR-024**: Bulk actions MUST automatically exclude the acting administrator's own row if it is among the selection.
- **FR-025**: Selection MUST clear on page change, filter change, sort change, or successful bulk action.
- **FR-026**: On partial bulk success, the system MUST inform the administrator of both successful and failed rows.

**View customization**

- **FR-027**: The system MUST allow toggling visibility of non-mandatory columns; selection, avatar, and actions columns MUST remain always visible.
- **FR-028**: The system MUST provide a "Reset filters" control that clears search, all active filters, and returns to defaults.

**Access control & safety**

- **FR-029**: Only administrators MUST be able to access this page; other users MUST be redirected away.
- **FR-030**: All row and bulk mutations MUST be authorized server-side; the client MUST surface server-returned authorization errors as user-friendly messages.

**Accessibility & responsiveness**

- **FR-031**: All interactive elements (checkboxes, menus, sort headers, filter popovers, dialogs) MUST be keyboard operable with visible focus states.
- **FR-032**: Badges and icons conveying status, role, or verification MUST also convey their meaning to assistive technology (not color alone).
- **FR-033**: The table MUST remain usable on narrow viewports via horizontal scroll; row actions MUST remain reachable on mobile.

### Key Entities

- **User row**: Represents one platform user in the table context. Attributes: unique identifier, avatar, first name, last name, role (one of: registered, verified_seller, moderator, admin), active status (active or banned), verified flag, joined date, last-active date, self-flag (whether this row represents the acting administrator).
- **Table state**: The combined view parameters — page index, page size, sort column, sort direction, search term, selected role filter values, selected status filter values, column visibility map, row-selection set. This state is reflected in the URL.
- **Row action request**: A single mutation targeting one user — change role, ban (with reason), or unban.
- **Bulk action request**: A mutation targeting multiple selected users — bulk change role or bulk ban — with per-row outcome reporting.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 95% of admins can locate a specific user by name in under 15 seconds from opening the page.
- **SC-002**: Changing a single user's role takes under 10 seconds end-to-end (open menu → confirm → see updated badge).
- **SC-003**: Applying or clearing a filter returns updated results in under 1 second at the 95th percentile on a dataset of 100,000 users.
- **SC-004**: A shared URL reproduces the exact same filters, sort, page, and page size for the recipient 100% of the time.
- **SC-005**: Bulk actions on up to 100 selected rows complete, with per-row outcomes reported, in under 15 seconds.
- **SC-006**: Admins never succeed in banning or changing the role of their own account from this page (0 incidents in testing and production).
- **SC-007**: Accessibility audit on this page shows zero critical issues (WCAG AA).
- **SC-008**: Page meets the product's Core Web Vitals threshold (LCP < 2.5s, CLS < 0.1) on the admin's typical network and device.

## Assumptions

- The administrator role and authorization checks are already in place; this feature consumes an existing server capability that returns paginated, sorted, filtered user data with a total count, plus existing mutation endpoints for role change, ban, and unban (as defined in Phase 1 of the parent plan).
- Ban enforcement (preventing banned users from using the app) is handled elsewhere (Phase 2); this feature only surfaces and toggles the banned state.
- Reusable table primitives (generic data table, column header, toolbar, pagination, faceted filter, row actions, view options) are delivered by Phase 3 and consumed here.
- The user detail side panel (view/edit details, tabbed panels) is out of scope for this feature and delivered in Phase 5. The "View Details" row action is intentionally omitted in this phase and will be added when Phase 5 ships.
- Column visibility preferences persist for the duration of the session via URL state; cross-session persistence is out of scope.
- The roles enum is fixed at four values (registered, verified_seller, moderator, admin); extending it is out of scope.
- Localization of labels, dates, and badges follows the existing internationalization setup.
- Bulk action size is capped at the current page's selection (no cross-page selection in v1).
