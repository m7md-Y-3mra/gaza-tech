# Quickstart — Manual Verification: User Management Data Table (015)

Use this script to verify the feature end-to-end on a dev environment. Target: 015 spec's acceptance scenarios + edge cases.

## Prerequisites

- Supabase dev project has Phase 1 RPCs deployed (013-admin-user-rpcs).
- Phase 2 ban enforcement is active (014-ban-enforcement).
- Local env has at least: one `admin` account, one `moderator`, and 50+ `registered` users (some banned).
- `npm run dev` running on `http://localhost:3000`.

## 1. Access control

1. Sign in as a `registered` user. Visit `/en/dashboard/users`.
   - Expect: redirected away from `/dashboard`.
2. Sign in as `moderator`. Visit `/en/dashboard/users`.
   - Expect: redirected to `/dashboard` (moderator gated out of admin-only page; FR-029).
3. Sign in as `admin`. Visit `/en/dashboard/users`.
   - Expect: page renders; first 20 users listed, newest first (default sort). Skeletons briefly visible on first paint.

## 2. Browse, search, filter, sort (User Story 1)

1. Confirm columns present: selection, avatar, name, role, status, verified, joined, last active, actions.
2. Type an existing user's last name in the search box → results narrow after ~300ms; pagination resets to page 1.
3. Type an email fragment → matching users appear (FR-009 includes email).
4. Clear search; open Role filter → pick `admin` + `moderator` → only those roles appear; filter button shows "2".
5. Open Status filter → pick `Banned` → only banned users appear.
6. Click "Joined" header → sort asc; click again → desc.
7. Copy URL; open in new tab → same filters/sort/page/page-size applied (FR-014).
8. Apply a filter that returns 0 users → empty state with "Reset filters" button → clicking it clears everything.

## 3. Change role (User Story 2)

1. Open row actions on any user (not your own) → "Change Role" → pick a different role → confirm.
2. Expect: row re-renders with new badge, success toast.
3. On your own row → row actions menu: "Change Role" and "Ban" are disabled (FR-018).
4. Force an error (e.g., disconnect network) → error toast, row unchanged (FR-020).

## 4. Ban / unban (User Story 3)

1. Pick an active user → row actions → "Ban User".
2. Leave reason empty → submit → inline validation error, dialog does not submit.
3. Type a reason → submit → status flips to Banned, toast.
4. Pick the same user → "Unban User" → confirm → status flips to Active.

## 5. Bulk actions (User Story 4)

1. Select 3 users via checkboxes → floating action bar appears with count.
2. "Bulk change role" → pick `verified_seller` → confirm → toast: "Updated 3 of 3 users."
3. Include your own row in the selection → bulk ban → your own row is excluded automatically (FR-024); toast reports count accordingly.
4. Select rows → change page → selection clears (FR-025).
5. Simulate partial failure (temporarily revoke one user) → toast reports "Updated 2 of 3 users. 1 failed." (FR-026).

## 6. View customization (User Story 5)

1. Open column visibility menu → hide "Last Active" → column disappears.
2. Navigate pages / change sort → "Last Active" stays hidden.
3. Copy URL → open → column still hidden (URL-persisted).
4. "Reset filters" → clears search, role, status — column visibility is unaffected by reset.

## 7. Accessibility & responsiveness

1. Keyboard-only: tab through headers, filter buttons, row actions, dialogs. Everything reachable; visible focus states.
2. Screen reader: badges announce "Role: admin", "Status: banned", not just color.
3. Resize to ~390px wide → table horizontally scrolls, row actions still reachable.

## 8. Performance

1. DevTools → Performance → record a filter change on 100k-user dataset.
   - Expect: server response < 1s p95 (SC-003).
2. Lighthouse → Admin Users page:
   - LCP < 2.5s, CLS < 0.1 (SC-008).
