# Implementation Plan: Admin User Management — Secure Server Operations

**Branch**: `013-admin-user-rpcs` | **Date**: 2026-04-14 | **Spec**: [./spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-admin-user-rpcs/spec.md`

## Summary

Deliver the server-side contract that the future admin-dashboard User Management screen will call. Six operations — `admin_list_users`, `admin_change_user_role`, `admin_ban_user`, `admin_unban_user`, `admin_edit_user`, `admin_change_user_email` — plus the supporting data-model changes (add `banned_at`, `user_role` CHECK, `admin_action_rate_log`) and the cross-cutting rule that public-facing listing queries must honor the owner's active status.

All mutating operations are implemented as Supabase `SECURITY DEFINER` PL/pgSQL functions so safety invariants (admin-only, no self-targeting, last-admin guard, rate limit, atomicity) are enforced at the database boundary and cannot be bypassed by a permissive call site. A Next.js `modules/admin-users/` module wraps each RPC in a thin server action with `errorHandler()` and Zod validation. No UI in this phase.

## Technical Context

**Language/Version**: TypeScript 5.x + Next.js 16 (App Router), React 19
**Primary Dependencies**: `@supabase/supabase-js` ^2.86.0, `zod` ^4.2.1, existing project utilities (`utils/error-handler.ts`, `utils/rbac-handler.ts`, `utils/auth-handler.ts`, `utils/CustomError.ts`, `lib/supabase/server.ts`, `config/rbac.ts`)
**Storage**: Supabase PostgreSQL — `public.users` (existing, augmented), `public.admin_action_rate_log` (new), Supabase RPC functions (new, `SECURITY DEFINER`). Read path uses `public.users_with_email` view (already exists) for name+email search.
**Testing**: Manual SQL verification of each RPC against the live Supabase project; typed server-action smoke tests colocated with the module; quickstart walkthrough documented in `quickstart.md`.
**Target Platform**: Next.js Server Components + Supabase (managed Postgres).
**Project Type**: Web application (Next.js 16 + Supabase).
**Performance Goals**: Listing page under 1 second at 100k users (SC-001). Mutating RPCs complete in under 200ms p95. Rate limit default: 60 mutating ops per minute per admin (FR-065 tunable).
**Constraints**:

- No client-side data fetching for admin operations; all server-side (Constitution II).
- No RLS bypass except through `SECURITY DEFINER` with enforced admin check inside.
- Every RPC returns structured errors compatible with `errorHandler()` and carries a `code` so the UI can branch on the specific failure kind (FR-060, FR-061).
- Atomic checks (last-admin guard, rate-limit read-and-insert) must be inside the RPC's transaction to survive concurrent invocations (FR-024, FR-025).

**Scale/Scope**: ~100k user records expected at scale; admin population < 20; mutating call volume per admin dominated by human action cadence, not automation.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                                            | Status | Notes                                                                                                                                                                                                                                                                                          |
| ---------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Module-First Architecture                         | ✅     | New `modules/admin-users/` with `queries.ts`, `actions.ts`, `types/index.ts`, `constants.ts`. No duplication of global structure. No page folder this phase (UI deferred).                                                                                                                     |
| II. Server-First Rendering                           | ✅     | All work is server-side (RPCs + server actions). No client components produced or required in Phase 1.                                                                                                                                                                                         |
| III. Incremental Staged Development (NON-NEGOTIABLE) | ✅     | Plan is explicitly staged: (1) schema migration, (2) RPCs one at a time, (3) server actions one at a time, (4) cross-feature integration (public listing queries honor owner active status), (5) wire rate-limit config. Each stage is an independent commit; no stage is merged into another. |
| IV. Performance Standards                            | ✅     | Server-side pagination + filtering + secondary-sort tiebreaker (FR-014a) + appropriate indexes (see data-model.md) keep listing under 1s at 100k rows. No UI changes this phase.                                                                                                               |
| V. Accessibility (WCAG AA)                           | N/A    | No UI in Phase 1. Accessibility re-checked when the consuming dashboard UI phase lands.                                                                                                                                                                                                        |
| VI. Consistent Error Handling                        | ✅     | Every server action wrapped with `errorHandler()`. Business errors use `CustomError` with `code` so the UI can localize and branch. RPC errors raise named PostgreSQL exceptions that `errorHandler()` maps via `handlePostgrestError`.                                                        |

**Gate result**: PASS. No violations, no complexity table needed.

## Project Structure

### Documentation (this feature)

```text
specs/013-admin-user-rpcs/
├── plan.md               # This file
├── research.md           # Phase 0 — decisions & rationale
├── data-model.md         # Phase 1 — schema changes + entity definitions
├── quickstart.md         # Phase 1 — how to verify Phase 1 end-to-end
├── contracts/            # Phase 1 — one file per RPC + cross-feature integration
│   ├── admin_list_users.md
│   ├── admin_change_user_role.md
│   ├── admin_ban_user.md
│   ├── admin_unban_user.md
│   ├── admin_edit_user.md
│   ├── admin_change_user_email.md
│   └── public_listing_ban_visibility.md
└── tasks.md              # Phase 2 output (created by /speckit.tasks, not this command)
```

### Source Code (repository root)

```text
modules/
└── admin-users/                # NEW module for Phase 1
    ├── queries.ts              # Calls each Supabase RPC via createClient().rpc(...)
    ├── actions.ts              # errorHandler-wrapped server actions (one per RPC)
    ├── types/
    │   └── index.ts            # AdminUserRow, ListParams, ListResult, action input types
    └── constants.ts            # MAX_PAGE_SIZE, MAX_BAN_REASON, ADMIN_RATE_LIMIT_DEFAULT

modules/
└── listings/                   # EXISTING — one targeted change
    └── queries.ts              # Public-listing queries extended to filter by owner.is_active = true

types/
└── supabase.ts                 # Regenerate after SQL changes (Supabase CLI / MCP)

config/
└── rbac.ts                     # No change — existing ROLES + UserRole union already match spec

# SQL migrations for the new DB objects (applied via Supabase MCP or the project's
# existing migration workflow — no `supabase/migrations/` directory currently exists
# in the repo; see research.md for the decision on where to persist the SQL).
```

**Structure Decision**: Admin user management is a distinct domain (aligned with the `users` entity but _admin-only_ capabilities), so it gets its own `modules/admin-users/` per Constitution Principle I. It does **not** merge into `modules/user/` because that module is the _owner-facing_ profile domain (my profile, my bookmarks) and will need different RLS/auth shapes than admin operations. The existing `modules/content-moderation/` `banUserQuery` is left in place for now (see research.md → "Relationship to existing moderation ban") and may later be refactored to call the new `admin_ban_user` RPC once Phase 2 enforcement lands; that refactor is out of scope for this phase.

## Complexity Tracking

> No violations to justify. Table intentionally empty.
