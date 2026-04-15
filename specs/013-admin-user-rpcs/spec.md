# Feature Specification: Admin User Management — Secure Server Operations

**Feature Branch**: `013-admin-user-rpcs`
**Created**: 2026-04-14
**Status**: Draft
**Input**: User description: "read @userChat.md and then create specificatin for phase 1"

## Clarifications

### Session 2026-04-14

- Q: Should the role-change operation prevent demoting the last remaining admin? → A: Yes — reject any role change that would leave zero admins.
- Q: What exactly is the whitelist of fields `admin_edit_user` can modify? → A: `first_name`, `last_name`, `phone`, `social_links`, `is_verified`, `avatar_url` — closed set. Ban/unban remain in their own operations; email changes are handled by a separate dedicated operation, not through edit.
- Q: Should mutating operations record an audit trail in Phase 1? → A: No — defer audit-log storage to a later phase. Operations must still keep their signatures audit-friendly so the log can be added without redesign.
- Q: When the listing status filter is omitted, what is the default? → A: Show all users (active + banned). No status filter = no status restriction; admins explicitly filter to narrow. Same principle for role filter (omitted = all roles).
- Q: How should ban enforcement propagate to sessions that were already active before the ban? → A: Phase 1 also stores a `banned_at` timestamp (set on ban, cleared on unban) so Phase 2 can invalidate sessions issued before the ban without a separate revocation store.
- Q: What fields should the listing's free-text search match against? → A: Name + email. Case-insensitive substring match on concatenated first+last name and on email address.
- Q: How is sort stability guaranteed across pages when the sort column has ties? → A: Always append user `id` ascending as an implicit final tiebreaker behind the admin's chosen sort column.
- Q: How do the `is_verified` flag and the `verified_seller` role relate? → A: Fully independent. No cross-field enforcement in any operation; admins can set them in any combination.
- Q: When a user is banned, what happens to their existing content? → A: Listings are hidden from public surfaces; community posts and comments remain visible. On unban, listings are restored.
- Q: Should mutating operations be rate-limited? → A: Yes — per-admin rate limit on mutating operations only (change role, ban, unban, edit, change email). Read/listing operations are not limited. The numeric cap is a server-side tunable.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Admin Browses the User Directory (Priority: P1)

An administrator opens the user management screen in the admin dashboard and needs to quickly find, sort, and filter through the platform's users so they can take action (change a role, ban, edit a profile). The directory must be usable even when the platform has tens of thousands of users.

**Why this priority**: Every other admin action starts from locating a user. Without a reliable, performant, and secure listing, the dashboard is non-functional. This is the foundation all other stories depend on.

**Independent Test**: Sign in as an administrator, open the directory, and verify that paged results load, that sorting by any visible column reorders the data correctly, that a keyword search narrows the results, and that role and status filters can be combined. Verify that total count and current page match reality.

**Acceptance Scenarios**:

1. **Given** an administrator is authenticated, **When** they request page 1 of the user list with page size 25, **Then** the system returns up to 25 users along with the total number of users matching the current filters.
2. **Given** an administrator filters by role "moderator" and status "active", **When** the results load, **Then** only active moderators appear and the total count reflects only that subset.
3. **Given** an administrator searches by a partial name or a partial email, **When** the query runs, **Then** users whose first name, last name, or email address matches the query are returned, respecting any active role/status filters. Matching is case-insensitive.
4. **Given** an administrator sorts by "Joined" descending, **When** they page forward, **Then** sort order is preserved across pages and no user appears on two different pages of the same result set.
5. **Given** a non-administrator (registered user, verified seller, or moderator) is authenticated, **When** they attempt the same listing operation, **Then** the request is refused with an authorization error and no user data is returned.

---

### User Story 2 - Admin Changes Another User's Role (Priority: P1)

An administrator needs to promote or demote another user between the four platform roles (`registered`, `verified_seller`, `moderator`, `admin`) so that permissions and capabilities on the platform reflect the user's current standing.

**Why this priority**: Role transitions are the primary reason admins use this screen. They unlock seller capabilities, grant moderation power, and revoke elevated access. The change must be atomic, auditable, and self-protective.

**Independent Test**: As an admin, pick a target user with role "registered", change them to "verified_seller", and verify their role is updated on subsequent reads. Attempt to change your own role and verify the system rejects the request. Attempt the change as a non-admin and verify rejection.

**Acceptance Scenarios**:

1. **Given** an administrator has selected a target user whose role is `registered`, **When** they change the target's role to `verified_seller`, **Then** subsequent reads show the new role and the change takes effect immediately for the target on their next authenticated request.
2. **Given** an administrator is acting on their own account, **When** they attempt to change their own role, **Then** the system rejects the request with a clear "cannot modify own role" error.
3. **Given** a non-admin user is authenticated, **When** they attempt to change any user's role, **Then** the request is refused with an authorization error.
4. **Given** an administrator supplies a value that is not one of the four supported roles, **When** they submit the change, **Then** the system rejects the request with a validation error and the target user's role is unchanged.
5. **Given** an administrator supplies an identifier for a user that does not exist, **When** they submit the change, **Then** the system returns a "user not found" error and no data is mutated.

---

### User Story 3 - Admin Bans a User (Priority: P1)

An administrator needs to immediately remove a violating user's ability to access the platform. Banning must capture a reason (for audit and for showing the banned user on their next sign-in attempt) and must block the banned user from continuing to use any authenticated feature.

**Why this priority**: Ban is the most consequential enforcement action. It must be available from day one, must record _why_, and must never be usable against the acting admin themselves.

**Independent Test**: Ban a target user with a reason. Verify their status flips to "banned" and the reason is stored. Attempt to ban yourself and verify the system refuses. Attempt to ban as a non-admin and verify rejection.

**Acceptance Scenarios**:

1. **Given** an administrator has selected an active user and provided a non-empty reason, **When** they submit the ban, **Then** the target user is marked inactive, the reason is stored against the user, the user's listings are no longer visible on public-facing surfaces, the user's community posts and comments remain visible, and subsequent reads show the user as banned with the reason visible.
2. **Given** an administrator submits a ban without a reason or with only whitespace, **When** the system validates the input, **Then** the request is rejected with a "reason required" validation error and the target user's status is unchanged.
3. **Given** an administrator attempts to ban their own account, **When** they submit the request, **Then** the system rejects it with a clear "cannot ban yourself" error.
4. **Given** a non-admin is authenticated, **When** they attempt to ban any user, **Then** the request is refused with an authorization error.
5. **Given** a user is already banned, **When** the administrator issues another ban on the same user, **Then** the system updates the stored reason to the most recent value without error.

---

### User Story 4 - Admin Unbans a User (Priority: P2)

An administrator needs to reverse a previous ban so a user can regain access to the platform. When unbanning, the stored ban reason should be cleared so historical reasons do not leak into a clean account state.

**Why this priority**: Unban is a correction mechanism for mistaken or expired bans. It is essential but used less often than banning and cannot happen until banning exists.

**Independent Test**: Ban a user, then unban them, and confirm their status returns to active and any stored ban reason is cleared. Attempt as a non-admin and verify rejection.

**Acceptance Scenarios**:

1. **Given** a target user is currently banned, **When** the administrator unbans them, **Then** the user's status becomes active, the stored ban reason is cleared, and the user's listings become visible again on public-facing surfaces.
2. **Given** a target user is already active, **When** the administrator submits an unban, **Then** the system completes without error and the user's state remains active with no ban reason.
3. **Given** a non-admin is authenticated, **When** they attempt to unban a user, **Then** the request is refused with an authorization error.
4. **Given** an administrator supplies an identifier for a user that does not exist, **When** they submit the unban, **Then** the system returns a "user not found" error.

---

### User Story 5 - Admin Edits a User's Profile (Priority: P2)

An administrator needs to correct or update another user's profile information — for example, fixing a misspelled name, updating a phone number, adjusting social links, or flipping the "verified" flag — without the user needing to do it themselves.

**Why this priority**: Profile corrections are a common support task but secondary to role and enforcement actions. It unblocks support workflows without being on the critical path for platform safety.

**Independent Test**: As an admin, change a target user's first name and phone number; verify the changes persist. Submit an update with a field that is not permitted and verify the request is rejected.

**Acceptance Scenarios**:

1. **Given** an administrator submits updates for a subset of allowed profile fields, **When** they save, **Then** only the provided fields are updated and untouched fields remain as they were.
2. **Given** an administrator submits an update that includes a field that is not allowed to be edited by admins (for example, the user's email or primary identifier), **When** the system validates the request, **Then** the request is rejected and no fields are changed.
3. **Given** an administrator submits an empty update, **When** the system processes the request, **Then** it completes without error and no fields are changed.
4. **Given** a non-admin is authenticated, **When** they attempt to edit any user's profile through the admin operation, **Then** the request is refused with an authorization error.
5. **Given** an administrator supplies an identifier for a user that does not exist, **When** they submit the edit, **Then** the system returns a "user not found" error.

---

### Edge Cases

- **Concurrent admin actions**: Two administrators acting on the same target user at nearly the same time must both complete deterministically; the last write wins and neither produces a corrupt intermediate state.
- **Target user is also an admin**: An administrator may change another admin's role or ban another admin; only self-actions are blocked.
- **Acting admin was demoted mid-session**: If an admin loses admin privileges between opening the page and submitting an action, the submitted action must be refused by the server regardless of what the client believes.
- **Very large directories**: The listing must remain responsive when the platform has hundreds of thousands of users; paging and filtering must not require scanning the full dataset on the client.
- **Unicode and casing in search**: Search by name must match across common casing variants so administrators don't miss users due to capitalization.
- **Banning a user with active sessions**: Once banned, the user's existing sessions must not continue to authorize new actions — the ban takes effect at the next authenticated request, not only at next sign-in. (Enforcement of this belongs to a later phase, but the data state produced here must support it.)
- **Invalid role value**: Any role value not in the supported set is rejected at the server, even if the client UI offered it.
- **Last remaining admin**: Any role change that would leave the platform with zero administrators is rejected, even when the acting admin is not the target (e.g., Admin A attempting to demote Admin B when A and B are the only two admins).
- **Empty, whitespace-only, or overly long ban reason**: Empty/whitespace is rejected; unreasonably long free-form text is truncated or rejected to prevent storage abuse.

## Requirements _(mandatory)_

### Functional Requirements

#### Authorization (applies to every operation in this phase)

- **FR-001**: The system MUST verify on the server that the caller holds the `admin` role for every operation in this feature. Client-side role checks MUST NOT be trusted.
- **FR-002**: The system MUST refuse every operation from callers who are not authenticated, returning an authentication error distinct from the authorization error.
- **FR-003**: The system MUST refuse every operation from authenticated callers who are not admins, returning a clear authorization error and revealing no information about the requested target.

#### User Listing

- **FR-010**: The system MUST provide a single server-side listing operation that returns a page of users along with the total count of users matching the active filters.
- **FR-011**: The listing operation MUST accept inputs for: page index, page size, sort column, sort direction (ascending/descending), a free-text name search, a role filter, and a status filter (active/banned).
- **FR-012**: The listing operation MUST return, for each user: identifier, first and last name, avatar reference, role, active/banned status, verified flag, join date, and last-activity timestamp. It MUST also return the ban reason for users whose status is banned.
- **FR-013**: The listing operation MUST perform pagination, sorting, and filtering on the server so that clients never receive more than one page of data at a time.
- **FR-014**: The listing operation MUST support sorting by at least: name, role, status, verified flag, join date, and last-activity timestamp.
- **FR-014a**: Every sort MUST be extended with the user identifier (`id`) in ascending order as an implicit final tiebreaker. The tiebreaker is invisible to the caller and guarantees deterministic ordering across pages even when the admin-chosen sort column contains ties. This implicit tiebreaker applies regardless of the chosen sort direction on the primary column.
- **FR-015**: The free-text search MUST perform a case-insensitive substring match against two fields: (a) the concatenated first and last name, and (b) the email address. A user is included in the result if the search term matches either field. Phone and identifier are NOT in scope for search in this phase.
- **FR-016**: Role and status filters MUST each accept either a single value or a set of values (multi-select) and MUST combine with the search input using logical AND.
- **FR-017**: The listing operation MUST reject a page size above a defined safe maximum to prevent unbounded result payloads.
- **FR-018**: When the status filter is omitted (or explicitly set to "all"), the listing operation MUST return both active and banned users without restriction. Admins must explicitly select `active` or `banned` to narrow. The same principle applies to the role filter: an omitted role filter returns users across all four roles.

#### Change Role

- **FR-020**: The system MUST provide an operation that changes a specified target user's role to one of the four supported values: `registered`, `verified_seller`, `moderator`, `admin`.
- **FR-021**: The operation MUST reject any role value that is not one of the four supported values with a validation error.
- **FR-022**: The operation MUST reject any attempt by an administrator to change their own role, returning a "cannot modify own role" error.
- **FR-023**: The operation MUST return a "user not found" error when the target identifier does not correspond to an existing user.
- **FR-024**: The operation MUST be atomic: either the role is updated and the change is visible to subsequent reads, or nothing is changed and an error is returned.
- **FR-025**: The operation MUST reject any role change that would leave the platform with zero administrators (i.e., demoting the last remaining admin), returning a clear "cannot remove the last administrator" error. The check MUST be performed atomically with the update so two concurrent demotions cannot both succeed and jointly remove the last admin.
- **FR-026**: The `is_verified` flag (editable via the edit operation) and the `verified_seller` role (editable via the role-change operation) are fully independent. No operation in this feature MUST enforce any relationship between them; administrators may set any combination. Consequently the role-change and edit operations MUST NOT implicitly modify the other field as a side effect.

#### Ban User

- **FR-030**: The system MUST provide an operation that bans a target user by marking them inactive and storing a reason.
- **FR-031**: The operation MUST require a non-empty, non-whitespace reason and reject requests that fail this check with a validation error.
- **FR-032**: The operation MUST enforce a maximum reason length and reject requests that exceed it.
- **FR-033**: The operation MUST reject any attempt by an administrator to ban their own account, returning a "cannot ban yourself" error.
- **FR-034**: The operation MUST return a "user not found" error when the target identifier does not correspond to an existing user.
- **FR-035**: When the target user is already banned, the operation MUST succeed and overwrite the stored reason with the newly supplied reason. The stored ban timestamp (see FR-036) MUST also be refreshed to the time of the latest successful ban call so session enforcement reflects the most recent action.
- **FR-036**: On every successful ban, the system MUST record a ban timestamp (`banned_at`) on the target user, set to the server time at which the ban took effect. This timestamp exists so a later phase can invalidate sessions that were issued before the ban without needing a separate revocation store.
- **FR-037**: Banning a user MUST cause that user's existing listings to be hidden from all public-facing surfaces (search, detail pages, feeds). The listings themselves MUST NOT be deleted or mutated; hiding MUST be achieved by public-listing queries honoring the owner's active/banned status, so that unbanning restores visibility automatically.
- **FR-038**: Banning a user MUST NOT affect that user's existing community posts or comments. They remain visible to the public as they were before the ban. (Rationale: community content moderation has its own reporting pipeline; the ban operation is about the user's future actions, not content takedown.)

#### Unban User

- **FR-040**: The system MUST provide an operation that unbans a target user by marking them active, clearing any stored ban reason, and clearing the stored ban timestamp (`banned_at`). Unbanning MUST restore public visibility of the user's listings automatically (as a direct consequence of flipping the active flag — no separate restore step).
- **FR-041**: The operation MUST succeed idempotently when the target user is already active, producing no data changes.
- **FR-042**: The operation MUST return a "user not found" error when the target identifier does not correspond to an existing user.

#### Edit User Profile

- **FR-050**: The system MUST provide an operation that updates a closed whitelist of a target user's profile fields. The whitelist is exactly: `first_name`, `last_name`, `phone`, `social_links`, `is_verified`, `avatar_url`. No other fields may be modified through this operation.
- **FR-051**: The operation MUST reject any attempt to modify fields outside the whitelist — including identifier, email, role, active/banned status, and ban reason — with a validation error naming the disallowed field.
- **FR-052**: The operation MUST apply only the fields provided by the caller and leave other fields unchanged.
- **FR-053**: The operation MUST return a "user not found" error when the target identifier does not correspond to an existing user.
- **FR-054**: The operation MUST validate any supplied value against the expected shape for its field and reject malformed input (for example, a malformed phone or URL) with a field-specific validation error.

#### Change Email (separate operation)

- **FR-055**: The system MUST provide a separate operation, distinct from profile edit, that allows an administrator to change a target user's email address. Email changes MUST NOT be possible through the profile edit operation.
- **FR-056**: The operation MUST validate the new email against standard email-format rules and reject malformed input with a field-specific validation error.
- **FR-057**: The operation MUST reject the change if the new email is already in use by another user, returning a clear conflict error.
- **FR-058**: The operation MUST return a "user not found" error when the target identifier does not correspond to an existing user.
- **FR-059**: The operation MUST reject any attempt by an administrator to change their own email through this operation, returning a "cannot change own email" error. (Admins change their own email via the normal user-facing flow.)

#### Error Reporting & Safety

- **FR-060**: All operations MUST return structured errors that distinguish at minimum: authentication failure, authorization failure, validation failure, not-found, and unexpected server error.
- **FR-061**: Validation errors MUST identify the specific field or rule that failed so the client can show actionable feedback.
- **FR-062**: No operation MAY leak information about users the caller is not allowed to see beyond what the non-admin is already authorized to read elsewhere on the platform.
- **FR-063**: Persisted audit logging is out of scope for this phase. Every mutating operation (role change, ban, unban, edit, change email) MUST nonetheless keep its signature and internal context "audit-ready" — meaning the acting administrator's identity, the target user, and the before/after values are all available inside the operation — so that a later phase can add an `admin_audit_log` write without changing any operation's public contract.
- **FR-064**: Every mutating operation (change role, ban, unban, edit, change email) MUST enforce a per-admin rate limit. When the acting administrator exceeds the configured cap within the configured window, the operation MUST be refused with a distinct "rate limit exceeded" error that names the operation family and when the limit will reset. The listing operation is explicitly NOT rate-limited.
- **FR-065**: The rate-limit cap and window MUST be a server-side configurable parameter (not hard-coded into each operation) so operators can tune or temporarily relax the limit without a code change. A sensible starting default is 60 mutating operations per minute per admin; this default is a tuning choice, not a contract.

### Key Entities _(include if feature involves data)_

- **User**: A platform account with an identifier, display name (first/last), avatar, contact details, social links, a role drawn from the supported set, an active/banned status, an optional ban reason, a verified flag, a join date, and a last-activity timestamp.
- **Role**: One of four fixed values — `registered`, `verified_seller`, `moderator`, `admin` — representing the user's level of capability on the platform.
- **Ban Record** (conceptually part of the User): The combination of the inactive flag, the stored ban reason, and the ban timestamp (`banned_at`); represents the current enforcement state for that user. The timestamp exists so later session-enforcement logic can distinguish sessions issued before vs. after the ban.
- **Administrator**: The subset of users whose role is `admin`; the only actors authorized to invoke any operation in this feature.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: An administrator can load any page of the user directory (any size up to the defined maximum, any combination of filters, any sort) and see results in under 1 second under normal load, even with 100,000 users on the platform.
- **SC-002**: 100% of mutating operations (change role, ban, unban, edit) are refused when attempted by non-admin accounts, verified by automated authorization tests covering each of the non-admin roles.
- **SC-003**: 100% of self-targeting role changes and self-bans by administrators are refused with a clear, actionable error.
- **SC-004**: 100% of ban actions store a non-empty reason; 0% of successful bans are recorded without a reason.
- **SC-005**: After unbanning, 100% of previously stored ban reasons are cleared on the affected user.
- **SC-006**: The listing operation returns a total count that matches the number of users actually matching the filters, verified with sample filter combinations at 0, 1, a small number, and a large number of matches.
- **SC-007**: Invalid input (unknown role, empty reason, non-existent user, disallowed edit field, malformed phone/URL) produces a structured, field-identifying error in 100% of tested cases with no partial mutation of the target user.
- **SC-008**: An administrator can complete a full common support flow — find a user, change their role, then ban a different user with reason — in under 1 minute on the finished dashboard once this phase's server capabilities are in place.

## Assumptions

- The existing `users` table already contains the columns required to represent role, active/banned status, and ban reason, and the four-role enumeration is already defined in the schema. (Phase 0 of the overall plan verifies this; this phase consumes the verified schema.) If a `banned_at` timestamp column does not yet exist, Phase 1 is responsible for adding it as part of the ban-operation work (see FR-036).
- A server-side helper for "is the current caller an admin?" already exists and is the single source of truth used by every operation in this feature.
- Row-level access controls already permit administrators to read and update user records; this feature tightens _which_ updates are valid via the server-side operations, rather than widening access.
- Ban _enforcement_ on live sessions (blocking subsequent authenticated requests and sign-ins for banned users) is owned by a later phase. This phase is responsible only for producing the data state that later enforcement will consume.
- The dashboard UI that consumes these operations is also out of scope for this phase; this phase defines the server contract the UI phase will call against.
- Audit logging of who did what and when is not required to be fully built in this phase, but mutating operations must be structured so an audit trail can be added without changing their signatures.
- "Informed guess" defaults applied (document-and-move-on): maximum page size capped at 100; maximum ban-reason length capped at 500 characters. These can be tuned later without reshaping the feature.
