# Tasks: Ban Enforcement (Auth Layer)

**Feature Branch**: `014-ban-enforcement`  
**Spec**: [specs/014-ban-enforcement/spec.md](spec.md)  
**Plan**: [specs/014-ban-enforcement/plan.md](plan.md)

## Implementation Strategy
We will implement the ban enforcement incrementally, starting with translations and foundational types, then moving to the critical Middleware and Login blocking (P1 stories), and finishing with the UI for the banned page (P2).

## Phase 1: Setup
Initialize localizations and types.

- [X] T001 Add ban-related translation keys to `messages/en.json` (e.g., `Auth.errors.banned`, `User.banned.title`, `User.banned.description`)
- [X] T002 Add ban-related translation keys to `messages/ar.json`

## Phase 2: Foundational
Prerequisites for all user stories.

- [X] T003 Update `types/supabase.ts` (or relevant schema file) to include `is_active` and `ban_reason` in the `users` table if not already present
- [X] T004 [P] Create status cookie types and constants in `constants/auth.ts` (or create new file)

## Phase 3: [US1] Block Access for Banned Users (Priority: P1)
**Goal**: Middleware blocks restricted access and redirects to `/banned`.

- [X] T005 Implement `getUserStatus` utility in `lib/supabase/proxy.ts` to fetch `is_active` and handle the 5-minute cookie cache
- [X] T006 Update `proxy.ts` middleware to call `getUserStatus` for authenticated users and perform a locale-aware redirect to `/[locale]/banned`
- [X] T007 [P] [US1] Add restricted session logic to `proxy.ts` to allow access ONLY to the `/[locale]/banned` route when `is_active` is false

## Phase 4: [US2] Prevent Login for Banned Users (Priority: P1)
**Goal**: Block the login flow if the account is banned.

- [X] T008 Update `signIn` server action in `modules/auth/login/components/LoginForm/actions/index.ts` to perform a fresh `is_active` check after authentication but before returning success
- [X] T009 [US2] Implement specific error handling in the `signIn` action to throw a `CustomError` with the "Account Banned" message

## Phase 5: [US3] View Ban Reason (Priority: P2)
**Goal**: Create a page to show why the user was banned.

- [X] T010 Create module structure for `modules/user/banned-page` (types, components, index)
- [X] T011 Create the route entry point in `app/[locale]/banned/page.tsx`
- [X] T012 [US3] Implement `BannedPage` Server Component in `modules/user/banned-page/BannedPage.tsx` that fetches and displays `ban_reason` from the database

## Phase 6: Polish
Final checks and cleanup.

- [X] T013 Verify 100% of banned users are redirected correctly per SC-001
- [X] T014 Run `npm run check` to ensure code quality across all modified files

## Dependencies
US1 (Middleware) must be functional before US3 (Banned Page) can be fully tested, as US1 handles the redirect and US3 depends on the restricted session.

## Parallel Execution
- Setup tasks (T001, T002) can be done in parallel.
- Cookie constants (T004) can be done in parallel with T003.
- US1 (T005-T007) and US2 (T008-T009) have minimal overlap and can be worked on concurrently if needed.
- US3 (T010-T011) can be prepared while US1 is being completed.
