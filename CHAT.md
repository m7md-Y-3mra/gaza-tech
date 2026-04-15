# Content Moderation & Reporting System — Full Spec Kit Plan

**Project**: Gaza Tech Market
**Created**: 2026-04-12
**Status**: Draft
**Input**: User description: "Create a content moderation system with report/flag functionality on listings, posts, comments, replies, and user profiles, plus a dashboard moderator review panel."

---

## Table of Contents

1. [Overview & Architecture](#overview--architecture)
2. [Existing Infrastructure Analysis](#existing-infrastructure-analysis)
3. [Phase Breakdown (Spec Kit)](#phase-breakdown-spec-kit)
4. [Phase 1 — Database & Report Submission](#phase-1--012-report-submission-backend)
5. [Phase 2 — Report Flag UI (User-Facing)](#phase-2--013-report-flag-ui)
6. [Phase 3 — Content Moderation Dashboard](#phase-3--014-content-moderation-dashboard)
7. [Phase 4 — Moderation Actions & Enforcement](#phase-4--015-moderation-actions--enforcement)
8. [Phase 5 — Notifications & Polish](#phase-5--016-notifications--polish)

---

## Overview & Architecture

### What We're Building

A two-sided content moderation system:

**User side** — Any authenticated user can flag/report content (listings, posts, comments/replies, user profiles) via a bottom-sheet modal with predefined reasons and optional description. Bilingual (EN/AR).

**Admin side** — A new dashboard section (`/dashboard/content-moderation`) where admins/moderators review incoming reports, view reported content in context, and take actions (dismiss, warn, hide content, ban user). Follows the same parallel-slot layout pattern used in `/dashboard/verification-review`.

### Report Reasons (from screenshots)

| Key             | English               | Arabic         |
| --------------- | --------------------- | -------------- |
| `spam`          | Spam                  | محتوى مزعج     |
| `inappropriate` | Inappropriate Content | محتوى غير لائق |
| `harassment`    | Harassment            | تحرش           |
| `misleading`    | Misleading            | مضلل           |
| `fraud`         | Fraud / Scam          | احتيال         |
| `hate_speech`   | Hate Speech           | خطاب كراهية    |
| `other`         | Other                 | أخرى           |

### Reportable Content Types

| Type    | Target Table              | FK Column in `reports` |
| ------- | ------------------------- | ---------------------- |
| Listing | `marketplace_listings`    | `reported_listing_id`  |
| Post    | `community_posts`         | `reported_post_id`     |
| Comment | `community_post_comments` | `reported_comment_id`  |
| User    | `users`                   | `reported_user_id`     |

> **Note**: Replies are comments with a `parent_comment_id` — they use the same `reported_comment_id` FK.

---

## Existing Infrastructure Analysis

### `reports` Table (Already Exists)

The `reports` table is already defined in the Supabase schema with all the columns we need:

```
reports
├── report_id          (uuid, PK)
├── reporter_id        (uuid, FK → users.user_id)
├── reported_listing_id (uuid?, FK → marketplace_listings)
├── reported_post_id    (uuid?, FK → community_posts)
├── reported_comment_id (uuid?, FK → community_post_comments)
├── reported_user_id    (uuid?, FK → users)
├── reason             (text, required)
├── description        (text?, optional details)
├── report_status      (text?, default 'pending')
├── action_taken       (text?)
├── resolution_notes   (text?)
├── reviewed_by        (uuid?, FK → users)
├── reviewed_at        (timestamp?)
├── created_at         (timestamp)
└── updated_at         (timestamp)
```

### Existing Patterns to Follow

| Pattern                        | Reference File                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------- |
| Server actions + errorHandler  | `modules/verification-review/actions.ts`                                                    |
| Query pattern (requireRole)    | `modules/verification-review/queries.ts`                                                    |
| Parallel-slot dashboard layout | `app/[locale]/dashboard/verification-review/layout.tsx`                                     |
| Queue list + pagination        | `modules/verification-review/components/queue-list/`                                        |
| Search params (nuqs)           | `modules/verification-review/search-params.ts`                                              |
| Dashboard sidebar items        | `modules/dashboard/components/dashboard-sidebar/`                                           |
| RBAC config                    | `config/rbac.ts` — dashboard routes require `['admin', 'moderator']`                        |
| Type derivation from DB        | `modules/verification-review/types/index.ts`                                                |
| i18n bilingual keys            | `messages/en.json` / `messages/ar.json`                                                     |
| `content_status` field         | `marketplace_listings` and `community_posts` both have it (`draft`, `published`, `removed`) |

### Key Observations

- The `reports` table already has FKs for all four content types — **no migration needed for the base table**.
- `content_status` already exists on `marketplace_listings` and `community_posts` — we can set it to `'removed'` for hiding content.
- `users.is_active` and `users.ban_reason` / `users.banned_expires_at` already exist for user bans.
- `community_post_comments.is_deleted` already exists for soft-deleting comments.
- The RBAC system already gates `/dashboard/*` to `['admin', 'moderator']`.

---

## Phase Breakdown (Spec Kit)

Each phase maps to a Spec Kit spec folder (`specs/012-*`, `013-*`, etc.). Phases are designed so each can be independently implemented and tested.

| Phase | Spec ID | Name                             | Depends On | Deliverable                                                   |
| ----- | ------- | -------------------------------- | ---------- | ------------------------------------------------------------- |
| 1     | `012`   | Report Submission Backend        | —          | Server actions, queries, Zod schema, RLS policies             |
| 2     | `013`   | Report Flag UI                   | Phase 1    | Report modal component, flag buttons in all content types     |
| 3     | `014`   | Content Moderation Dashboard     | Phase 1    | Dashboard parallel-slot page, queue, display, filters         |
| 4     | `015`   | Moderation Actions & Enforcement | Phase 3    | Action buttons, content hiding, user warnings/bans            |
| 5     | `016`   | Notifications & Polish           | Phase 4    | Email notifications, report count badges, duplicate detection |

---

## Phase 1 — `012-report-submission-backend`

**Feature Branch**: `012-report-submission-backend`
**Goal**: Backend infrastructure to accept and store reports from any authenticated user.

### User Story 1 — Submit a Report (Priority: P1)

An authenticated user encounters problematic content (a listing, post, comment, or user profile). They submit a report by selecting a reason from a predefined list and optionally adding a text description. The report is saved and they see a success confirmation.

**Why this priority**: Nothing else works without the ability to create reports.

**Independent Test**: Call the server action with valid data and verify a row appears in the `reports` table with correct FKs and `report_status = 'pending'`.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they submit a report with reason `spam` and `reported_post_id = <valid-id>`, **Then** a new row is created in `reports` with `reporter_id` = current user, `report_status = 'pending'`, and the report ID is returned.
2. **Given** an authenticated user, **When** they submit a report without selecting a reason, **Then** a Zod validation error is returned.
3. **Given** an authenticated user, **When** they submit a report with a `reported_listing_id` that doesn't exist, **Then** a `CustomError` with code `CONTENT_NOT_FOUND` is returned.
4. **Given** an unauthenticated visitor, **When** they attempt to submit a report, **Then** the server action fails with an auth error.

### User Story 2 — Prevent Duplicate Reports (Priority: P2)

The system prevents a user from submitting multiple reports against the same piece of content. If they try, they see a message saying they've already reported it.

**Acceptance Scenarios**:

1. **Given** user A has already reported post X, **When** user A tries to report post X again, **Then** a `CustomError` with code `ALREADY_REPORTED` is returned.
2. **Given** user A has reported post X, **When** user B reports post X, **Then** the report is accepted (different reporter).

### Data Model

No new tables needed. We use the existing `reports` table as-is.

**RLS Policies needed**:

- `INSERT`: Authenticated users can insert rows where `reporter_id = auth.uid()`.
- `SELECT`: Users can read their own reports (`reporter_id = auth.uid()`). Admins/moderators can read all.
- `UPDATE`: Only admins/moderators can update (for status changes).

**Zod Schema** (`modules/reports/schema.ts`):

```ts
import { z } from 'zod';

export const REPORT_REASONS = [
  'spam',
  'inappropriate',
  'harassment',
  'misleading',
  'fraud',
  'hate_speech',
  'other',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export const createReportSchema = z
  .object({
    reason: z.enum(REPORT_REASONS),
    description: z.string().max(1000).optional(),
    reported_listing_id: z.string().uuid().optional(),
    reported_post_id: z.string().uuid().optional(),
    reported_comment_id: z.string().uuid().optional(),
    reported_user_id: z.string().uuid().optional(),
  })
  .refine(
    (data) =>
      [
        data.reported_listing_id,
        data.reported_post_id,
        data.reported_comment_id,
        data.reported_user_id,
      ].filter(Boolean).length === 1,
    { message: 'Exactly one reported content ID must be provided' }
  );
```

### Source Code Structure

```
modules/reports/
├── types/
│   └── index.ts           # ReportRow, ReportReason, CreateReportInput
├── schema.ts              # Zod validation schema
├── queries.ts             # createReportQuery, checkDuplicateReportQuery
└── actions.ts             # createReportAction (wrapped with errorHandler)
```

### Tasks

```
Phase 1: Setup

- [ ] T001 [P] Create `modules/reports/types/index.ts` — derive types from `Database['public']['Tables']['reports']`, export `ReportRow`, `ReportReason`, `REPORT_REASONS`, `REPORT_STATUSES`
- [ ] T002 [P] Create `modules/reports/schema.ts` — Zod `createReportSchema` with refine (exactly one FK must be set)

Phase 2: Queries & Actions

- [ ] T003 Create `modules/reports/queries.ts`:
       - `checkDuplicateReportQuery(reporterId, targetType, targetId)` — returns boolean
       - `createReportQuery(input: CreateReportInput)` — inserts row, returns report_id
       - Both gated with `requireAuth()` (not requireRole — any authenticated user)
- [ ] T004 Create `modules/reports/actions.ts` — wrap queries with `errorHandler()`
- [ ] T005 Create RLS policies on `reports` table via Supabase migration:
       - INSERT: `auth.uid() = reporter_id`
       - SELECT own: `auth.uid() = reporter_id`
       - SELECT all: `is_moderator_or_admin()`
       - UPDATE: `is_moderator_or_admin()`

Phase 3: i18n

- [ ] T006 [P] Add translation keys to `messages/en.json` under `Report` namespace:
       reasons (spam, inappropriate, harassment, misleading, fraud, hate_speech, other),
       labels (title, subtitle, description placeholder, submit, success, alreadyReported)
- [ ] T007 [P] Add Arabic translations to `messages/ar.json` under `Report` namespace
```

---

## Phase 2 — `013-report-flag-ui`

**Feature Branch**: `013-report-flag-ui`
**Goal**: User-facing report modal and flag buttons integrated into listings, posts, comments, and profiles.

### User Story 1 — Report a Post (Priority: P1)

A user viewing a post sees a flag icon (🚩) in the post header or action bar. They tap it, a bottom-sheet modal slides up showing the report reasons as radio options, an optional description textarea, and a "Submit Report" button. On success, a toast confirms the report was submitted.

**Why this priority**: Posts are the highest-traffic content type and the reference implementation for the modal.

**Independent Test**: Navigate to a post detail, click the flag icon, select "Spam", click Submit. Verify toast appears and report exists in DB.

**Acceptance Scenarios**:

1. **Given** an authenticated user on a post detail page, **When** they click the flag icon, **Then** a report modal slides up with the 7 reason options, a description textarea, and a submit button.
2. **Given** the report modal is open, **When** the user selects "Harassment" and clicks Submit, **Then** the modal closes, a success toast appears, and a report is created in the DB.
3. **Given** the user is the post author, **When** they view the post, **Then** the flag icon is NOT shown (users cannot report their own content).
4. **Given** an unauthenticated visitor, **When** they click the flag icon, **Then** they are redirected to the login page.
5. **Given** the user already reported this post, **When** they click the flag icon, **Then** the modal shows "You've already reported this" with the submit button disabled.
6. **Given** Arabic locale, **When** the modal opens, **Then** all text, reason labels, and layout direction are RTL Arabic.

### User Story 2 — Report a Listing (Priority: P1)

Same modal behavior, triggered from the listing detail page. The flag icon appears near the share button in the `ProductGallery` header area.

**Acceptance Scenarios**:

1. **Given** a user on a listing detail page, **When** they click the flag icon, **Then** the report modal opens with `reported_listing_id` pre-set.
2. **Given** the user is the listing seller, **Then** the flag icon is NOT shown.

### User Story 3 — Report a Comment/Reply (Priority: P2)

The flag option appears in the comment action row (next to the like/reply/edit/delete buttons). For replies, same behavior — they share the `reported_comment_id` FK.

**Acceptance Scenarios**:

1. **Given** a user viewing comments on a post, **When** they click the flag on a comment, **Then** the report modal opens with `reported_comment_id` pre-set.
2. **Given** a user viewing a nested reply, **When** they click the flag, **Then** `reported_comment_id` is set to the reply's `comment_id`.
3. **Given** the user is the comment author, **Then** the flag icon is NOT shown.

### User Story 4 — Report a User Profile (Priority: P3)

On the profile page, a "Report User" option appears (three-dot menu or flag icon near the hero section). Only visible when viewing another user's profile.

**Acceptance Scenarios**:

1. **Given** user A viewing user B's profile, **When** they click "Report User", **Then** the modal opens with `reported_user_id = B`.
2. **Given** user A viewing their own profile, **Then** the report option is NOT shown.

### Source Code Structure

```
modules/reports/
├── components/
│   ├── report-modal/
│   │   ├── hooks/
│   │   │   └── useReportModal.ts     # form state, submit logic, duplicate check
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── constant.ts               # REPORT_REASONS array for radio options
│   │   ├── index.ts
│   │   ├── ReportModal.tsx           # Sheet/Dialog with radio group + textarea
│   │   └── ReportModalClient.tsx     # 'use client' wrapper
│   └── report-button/
│       ├── types/
│       │   └── index.ts
│       ├── index.ts
│       └── ReportButton.tsx          # Flag icon button that opens the modal
├── types/
│   └── index.ts
├── schema.ts
├── queries.ts
└── actions.ts
```

### Integration Points (where to add ReportButton)

| Content Type | File to Modify                                                                                        | Placement                                                 |
| ------------ | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Post Card    | `modules/community/components/post-card/PostCard.tsx`                                                 | In action bar, after bookmark button                      |
| Post Detail  | `modules/community/components/post-detail-modal/components/post-detail-header/PostDetailHeader.tsx`   | Top-right, next to category badge                         |
| Post Actions | `modules/community/components/post-detail-modal/components/post-detail-actions/PostDetailActions.tsx` | After share button                                        |
| Comment      | `modules/community/components/comments/components/comment-item/CommentItem.tsx`                       | After existing action buttons (like, reply, edit, delete) |
| Listing      | `modules/listings/listing-details/components/product-gallery/ProductGallery.tsx`                      | Near share/bookmark buttons                               |
| Profile      | `modules/user/profile/components/profile-hero/ProfileHero.tsx`                                        | Three-dot menu or flag icon near name                     |

### Tasks

```
Phase 1: Shared Report Modal Component

- [ ] T001 Create `modules/reports/components/report-modal/types/index.ts` — `ReportModalProps` (contentType, contentId, contentOwnerId)
- [ ] T002 Create `modules/reports/components/report-modal/constant.ts` — reason options array
- [ ] T003 Create `modules/reports/components/report-modal/hooks/useReportModal.ts`:
       - Manages open/close state
       - Tracks selected reason + description
       - Calls `createReportAction` on submit
       - Handles duplicate check, loading, success/error toasts
- [ ] T004 Create `modules/reports/components/report-modal/ReportModal.tsx`:
       - Uses Sheet (bottom-sheet) from shadcn/ui
       - Radio group for reasons (mapped from REPORT_REASONS)
       - TextArea for optional description
       - Submit button with loading spinner
       - All text via useTranslations('Report')
- [ ] T005 Create `modules/reports/components/report-modal/index.ts`

Phase 2: Report Button Component

- [ ] T006 Create `modules/reports/components/report-button/ReportButton.tsx`:
       - Renders Flag icon (lucide-react)
       - Accepts contentType, contentId, contentOwnerId
       - Hides if currentUser === contentOwnerId
       - Redirects to login if not authenticated
       - Opens ReportModal on click
- [ ] T007 Create barrel exports

Phase 3: Integration — Posts

- [ ] T008 Add ReportButton to `PostCard.tsx` action bar (after bookmark)
- [ ] T009 Add ReportButton to `PostDetailActions.tsx` (after share)
- [ ] T010 Add ReportButton to `PostDetailHeader.tsx` (top-right area, visible on post detail page)

Phase 4: Integration — Comments

- [ ] T011 Add ReportButton to `CommentItem.tsx` (after existing action buttons, hidden for own comments)

Phase 5: Integration — Listings

- [ ] T012 Add ReportButton to listing detail page (near share/bookmark in ProductGallery)

Phase 6: Integration — User Profile

- [ ] T013 Add ReportButton to `ProfileHero.tsx` (visible when viewing another user's profile)
```

---

## Phase 3 — `014-content-moderation-dashboard`

**Feature Branch**: `014-content-moderation-dashboard`
**Goal**: Dashboard page for admins/moderators to view and manage reports. Follows the same parallel-slot pattern as verification-review.

### User Story 1 — Browse Report Queue (Priority: P1)

A moderator navigates to `/dashboard/content-moderation`. They see a three-panel layout: a report queue list on the left, the reported content preview in the center, and actions panel on the right. The queue shows pending reports ordered by creation date (oldest first), with report count badges.

**Why this priority**: Moderators need a way to see what's been reported.

**Independent Test**: Navigate to `/dashboard/content-moderation`. With reports in the DB, verify the queue populates and clicking a report shows its details.

**Acceptance Scenarios**:

1. **Given** a moderator navigates to the content moderation page, **When** there are pending reports, **Then** a list of reports is shown sorted oldest-first, each showing: reporter name, content type icon, reason, and time ago.
2. **Given** the queue has 25+ reports, **When** the moderator scrolls, **Then** pagination controls appear (same pattern as verification-review).
3. **Given** no pending reports, **When** the page loads, **Then** an empty state message is shown.

### User Story 2 — Filter & Search Reports (Priority: P2)

Moderators can filter the queue by content type (listing, post, comment, user), by reason, and by status (pending, resolved, dismissed). They can also search by reporter name or reported content title.

**Acceptance Scenarios**:

1. **Given** a moderator on the queue page, **When** they select "Posts" filter, **Then** only reports where `reported_post_id IS NOT NULL` are shown.
2. **Given** a moderator types a search term, **When** results load, **Then** reports matching the reporter's name or reported content are shown.

### User Story 3 — View Reported Content in Context (Priority: P1)

When a moderator clicks a report in the queue, the center panel shows the reported content in full context: the post content, listing details, comment thread, or user profile info. It also shows all other reports against the same content (report history).

**Acceptance Scenarios**:

1. **Given** a moderator clicks a post report, **Then** the center panel shows: post title, full content, author info, attachments, and a list of all reports against that post.
2. **Given** a moderator clicks a comment report, **Then** the center panel shows: the comment text, the parent post title, the comment author, and report history.
3. **Given** a moderator clicks a user report, **Then** the center panel shows: user profile info (name, avatar, bio, join date, verification status) and all reports against that user.

### Source Code Structure

```
app/[locale]/dashboard/
├── content-moderation/
│   ├── @queue/
│   │   ├── [id]/
│   │   │   └── page.tsx              # Selected report highlight
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   └── page.tsx                  # Queue list with filters
│   ├── @display/
│   │   ├── [id]/
│   │   │   ├── error.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx              # Reported content preview
│   │   ├── default.tsx
│   │   └── page.tsx
│   ├── @actions/
│   │   ├── [id]/
│   │   │   ├── error.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx              # Action buttons panel
│   │   ├── default.tsx
│   │   └── page.tsx
│   ├── default.tsx
│   ├── layout.tsx                    # 3-column grid (same as verification-review)
│   └── page.tsx

modules/content-moderation/
├── components/
│   ├── report-queue-list/
│   │   ├── index.ts
│   │   └── ReportQueueList.tsx
│   ├── report-queue-search/
│   │   ├── index.ts
│   │   └── ReportQueueSearch.tsx
│   ├── report-queue-filters/
│   │   ├── index.ts
│   │   └── ReportQueueFilters.tsx
│   ├── report-queue-pagination/
│   │   ├── index.ts
│   │   └── ReportQueuePagination.tsx
│   ├── report-item-row/
│   │   ├── index.ts
│   │   └── ReportItemRow.tsx
│   ├── reported-content-display/
│   │   ├── components/
│   │   │   ├── reported-post/
│   │   │   ├── reported-listing/
│   │   │   ├── reported-comment/
│   │   │   └── reported-user/
│   │   ├── index.ts
│   │   └── ReportedContentDisplay.tsx
│   └── report-history/
│       ├── index.ts
│       └── ReportHistory.tsx
├── types/
│   └── index.ts
├── queries.ts
├── actions.ts
└── search-params.ts
```

### Tasks

```
Phase 1: Setup & Types

- [ ] T001 Create `modules/content-moderation/types/index.ts`:
       - `ReportQueueItem` (slim type for list: report_id, reason, content_type, reporter name, created_at, status)
       - `ReportDetail` (full report + joined reported content + reporter info)
       - `REPORT_STATUSES`, `CONTENT_TYPES` constants
- [ ] T002 Create `modules/content-moderation/search-params.ts`:
       - nuqs parsers for query, page, contentType filter, reason filter, status filter
- [ ] T003 Add "Content Moderation" item to `DashboardSidebar.tsx` with `Flag` icon from lucide-react

Phase 2: Queries & Actions

- [ ] T004 Create `modules/content-moderation/queries.ts`:
       - `getReportQueueQuery({ query, page, contentType, reason, status })` — paginated, filterable
       - `getReportByIdQuery(reportId)` — full detail with joined content + reporter
       - `getReportHistoryForContentQuery(contentType, contentId)` — all reports for same content
       - All gated with `requireRole(['admin', 'moderator'])`
- [ ] T005 Create `modules/content-moderation/actions.ts` — wrap with errorHandler

Phase 3: Route Pages (Parallel Slots)

- [ ] T006 Create `app/[locale]/dashboard/content-moderation/layout.tsx` — 3-column grid
- [ ] T007 Create `app/[locale]/dashboard/content-moderation/page.tsx` — returns null
- [ ] T008 Create `app/[locale]/dashboard/content-moderation/default.tsx`
- [ ] T009 [P] Create @queue slot: page.tsx (list), [id]/page.tsx (highlight), layout.tsx, loading.tsx
- [ ] T010 [P] Create @display slot: page.tsx (empty), [id]/page.tsx (content preview), default.tsx, loading.tsx, error.tsx
- [ ] T011 [P] Create @actions slot: page.tsx (empty), [id]/page.tsx (action panel), default.tsx, loading.tsx, error.tsx

Phase 4: Queue Components

- [ ] T012 Create `ReportQueueList.tsx` — maps reports to ReportItemRow
- [ ] T013 Create `ReportItemRow.tsx` — shows content type icon, reason badge, reporter name, time ago
- [ ] T014 Create `ReportQueueSearch.tsx` — search input with nuqs
- [ ] T015 Create `ReportQueueFilters.tsx` — content type + reason + status dropdowns
- [ ] T016 Create `ReportQueuePagination.tsx` — page controls

Phase 5: Display Components

- [ ] T017 Create `ReportedContentDisplay.tsx` — switches on content type, renders sub-component
- [ ] T018 [P] Create `ReportedPost.tsx` — shows post title, content, author, attachments
- [ ] T019 [P] Create `ReportedListing.tsx` — shows listing title, images, price, seller
- [ ] T020 [P] Create `ReportedComment.tsx` — shows comment content, parent post, author
- [ ] T021 [P] Create `ReportedUser.tsx` — shows user profile info
- [ ] T022 Create `ReportHistory.tsx` — list of all reports against the same content

Phase 6: i18n

- [ ] T023 [P] Add EN translations for `ContentModeration` namespace
- [ ] T024 [P] Add AR translations for `ContentModeration` namespace
```

---

## Phase 4 — `015-moderation-actions--enforcement`

**Feature Branch**: `015-moderation-actions-enforcement`
**Goal**: Enable moderators to take action on reports — dismiss, hide content, warn users, or ban users.

### User Story 1 — Dismiss a Report (Priority: P1)

A moderator reviews a report and determines it's not valid. They click "Dismiss" and optionally add resolution notes. The report status changes to `'dismissed'`.

**Acceptance Scenarios**:

1. **Given** a moderator viewing a pending report, **When** they click Dismiss, **Then** `report_status = 'dismissed'`, `reviewed_by = moderator.id`, `reviewed_at = now()`.
2. **Given** a moderator dismisses with notes, **Then** `resolution_notes` is saved.

### User Story 2 — Hide/Remove Content (Priority: P1)

A moderator decides the reported content violates guidelines. They click "Remove Content":

- **Posts**: `content_status` → `'removed'`
- **Listings**: `content_status` → `'removed'`
- **Comments**: `is_deleted` → `true`, `content` → `'[Removed by moderator]'`

The report status changes to `'resolved'` with `action_taken = 'content_removed'`.

**Acceptance Scenarios**:

1. **Given** a moderator viewing a valid post report, **When** they click "Remove Content", **Then** the post's `content_status` is set to `'removed'` and the report is resolved.
2. **Given** a removed post, **When** any user tries to view it, **Then** they see a "Content has been removed" message or 404.
3. **Given** a moderator viewing a comment report, **When** they remove it, **Then** `is_deleted = true` and the comment shows `[Removed by moderator]`.

### User Story 3 — Warn a User (Priority: P2)

A moderator can send a warning to the content author. This creates a notification for the user. The report is resolved with `action_taken = 'user_warned'`.

**Acceptance Scenarios**:

1. **Given** a moderator clicks "Warn User", **Then** a notification is created in the `notifications` table for the content author.
2. **Given** a warning is sent, **Then** the report is resolved with `action_taken = 'user_warned'`.

### User Story 4 — Ban a User (Priority: P2)

For severe violations, a moderator can ban the reported user. This sets `users.is_active = false` and populates `ban_reason` and optionally `banned_expires_at` (for temporary bans).

**Acceptance Scenarios**:

1. **Given** a moderator clicks "Ban User", **When** they select "Permanent", **Then** `is_active = false`, `ban_reason` is set, `banned_expires_at = null`.
2. **Given** a moderator selects "Temporary (7 days)", **Then** `banned_expires_at` = now + 7 days.
3. **Given** a banned user, **When** they try to log in, **Then** they see a "Your account has been suspended" message with the reason.

### Source Code Structure

```
modules/content-moderation/
├── components/
│   ├── action-buttons/
│   │   ├── index.ts
│   │   └── ActionButtons.tsx         # Dismiss, Remove, Warn, Ban buttons
│   ├── resolution-notes/
│   │   ├── index.ts
│   │   └── ResolutionNotes.tsx       # Textarea for moderator notes
│   └── ban-dialog/
│       ├── hooks/
│       │   └── useBanDialog.ts
│       ├── index.ts
│       └── BanDialog.tsx             # Ban type selection (permanent/temporary) + reason
├── queries.ts                        # Add: resolveReportQuery, hideContentQuery, warnUserQuery, banUserQuery
└── actions.ts                        # Add: wrapped action functions
```

### Tasks

```
Phase 1: Resolve/Dismiss Queries

- [ ] T001 Add `resolveReportQuery` to `modules/content-moderation/queries.ts`:
       - Updates report_status, action_taken, resolution_notes, reviewed_by, reviewed_at
       - Gated with requireRole(['admin', 'moderator'])
- [ ] T002 Add `dismissReportQuery` — same as resolve but status = 'dismissed'

Phase 2: Content Removal Queries

- [ ] T003 Add `hidePostQuery` — sets `content_status = 'removed'` on community_posts
- [ ] T004 Add `hideListingQuery` — sets `content_status = 'removed'` on marketplace_listings
- [ ] T005 Add `hideCommentQuery` — sets `is_deleted = true`, content = '[Removed by moderator]'
- [ ] T006 Wrap all in errorHandler in actions.ts

Phase 3: User Actions

- [ ] T007 Add `warnUserQuery` — creates notification + resolves report
- [ ] T008 Add `banUserQuery` — sets `is_active = false`, `ban_reason`, `banned_expires_at`
- [ ] T009 Create `BanDialog.tsx` — permanent/temporary selector, reason input, confirmation

Phase 4: Action Panel UI

- [ ] T010 Create `ActionButtons.tsx`:
       - "Dismiss" (secondary), "Remove Content" (destructive), "Warn User" (warning), "Ban User" (destructive)
       - Confirmation dialogs using AlertDialog from shadcn
- [ ] T011 Create `ResolutionNotes.tsx` — textarea for moderator notes
- [ ] T012 Wire action panel into @actions/[id]/page.tsx

Phase 5: i18n

- [ ] T013 [P] Add EN translations for action buttons, dialogs, confirmations
- [ ] T014 [P] Add AR translations
```

---

## Phase 5 — `016-notifications--polish`

**Feature Branch**: `016-notifications-polish`
**Goal**: Email notifications for moderation actions, report count indicators, and UX polish.

### User Story 1 — Notify Content Author of Action (Priority: P1)

When a moderator removes content or warns/bans a user, the affected user receives an in-app notification (via `notifications` table) and optionally an email.

**Acceptance Scenarios**:

1. **Given** a moderator removes a post, **Then** the post author receives a notification: "Your post '[title]' has been removed for violating community guidelines."
2. **Given** a moderator bans a user, **Then** the user receives a notification with the ban reason.

### User Story 2 — Report Count Badges in Dashboard Sidebar (Priority: P2)

The "Content Moderation" sidebar item shows a badge with the count of pending reports.

**Acceptance Scenarios**:

1. **Given** 5 pending reports, **Then** the sidebar shows "Content Moderation (5)".
2. **Given** 0 pending reports, **Then** no badge is shown.

### User Story 3 — Bulk Actions (Priority: P3)

Moderators can select multiple reports and dismiss them in bulk.

### Tasks

```
- [ ] T001 Create edge function `send-moderation-email` (follows pattern of `send-verification-email`)
- [ ] T002 Add notification creation to hideContentQuery, warnUserQuery, banUserQuery
- [ ] T003 Add pending report count query for sidebar badge
- [ ] T004 Update DashboardSidebar to show badge count
- [ ] T005 [P] Add bulk dismiss UI (checkboxes on queue items + "Dismiss Selected" button)
- [ ] T006 [P] Add bulk dismiss query
- [ ] T007 Add EN/AR translations for notification messages
```

---

## Summary: How to Execute with Spec Kit

For each phase, run the Spec Kit workflow:

```bash
# 1. Create spec branch and write spec
/speckit.specify <paste the phase description>

# 2. Build the technical plan
/speckit.plan

# 3. Generate task list
/speckit.tasks

# 4. Implement tasks
/speckit.implement

# 5. Review implementation
/spec-review
```

### Execution Order

```
Phase 1 (012) ──→ Phase 2 (013) ──→ Phase 3 (014) ──→ Phase 4 (015) ──→ Phase 5 (016)
   Backend           Flag UI           Dashboard         Actions           Polish
   ~1 day            ~2 days           ~3 days           ~2 days           ~1 day
```

### Key Design Decisions

| Decision                                   | Rationale                                                        |
| ------------------------------------------ | ---------------------------------------------------------------- |
| Reuse existing `reports` table             | All FKs already defined — no migration needed for base structure |
| Follow verification-review pattern exactly | Proven 3-panel dashboard pattern, same RBAC, same slot structure |
| `content_status = 'removed'` for hiding    | Already used in community posts; consistent soft-delete pattern  |
| `is_deleted` for comments                  | Existing tombstone pattern preserves thread structure            |
| `users.is_active` for bans                 | Already exists with `ban_reason` and `banned_expires_at`         |
| Sheet (bottom-sheet) for report modal      | Matches screenshot design; mobile-friendly on the existing app   |
| Report reasons as enum in Zod              | Type-safe, maps 1:1 to i18n keys, easy to extend                 |
| No new tables                              | The existing schema already supports everything needed           |
