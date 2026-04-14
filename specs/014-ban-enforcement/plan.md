# Implementation Plan: Ban Enforcement (Auth Layer)

**Branch**: `014-ban-enforcement` | **Date**: 2026-04-14 | **Spec**: [specs/014-ban-enforcement/spec.md](spec.md)
**Input**: Feature specification from `/specs/014-ban-enforcement/spec.md`

## Summary

Implement a robust ban enforcement layer using Next.js Middleware and Server Actions. Banned users (`is_active: false`) will be blocked from accessing protected and public routes (except the banned page) and redirected to a multi-locale `/[locale]/banned` page. To optimize performance, the `is_active` status will be cached for 5 minutes.

## Technical Context

**Language/Version**: Next.js 15+, TypeScript 5+  
**Primary Dependencies**: Supabase Auth/PostgreSQL, next-intl, zod, react-hook-form  
**Storage**: PostgreSQL (public.users table: is_active, ban_reason)  
**Testing**: `npm run check` (Lint, Type-check, Format)  
**Target Platform**: Web (Vercel/Node.js)
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: Core Web Vitals > 95%, Middleware check latency < 50ms (cached)  
**Constraints**: 5-minute cache for `is_active` status in cookies/session; multi-locale routing support.  
**Scale/Scope**: Auth layer, Middleware (`proxy.ts`), Login Server Action, Banned Page.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Gate                          | Status | Logic                                                                                               |
| :---------------------------- | :----- | :-------------------------------------------------------------------------------------------------- |
| **Module-First Architecture** | PASS   | Banned page logic/UI will reside in a module (likely `modules/user/banned-page`).                   |
| **Server-First Rendering**    | PASS   | Middleware is server-side; Banned page will be a Server Component to fetch `ban_reason` securely.   |
| **Incremental Development**   | PASS   | Plan follows Design -> Frontend Logic -> Enhancement phases.                                        |
| **Performance Standards**     | PASS   | 5-minute caching in Middleware prevents excessive DB hits; no heavy client components on `/banned`. |
| **Accessibility (WCAG AA)**   | PASS   | `/banned` page will use semantic HTML and meet contrast requirements.                               |
| **Consistent Error Handling** | PASS   | `signIn` action and profile fetching will use `errorHandler` and `CustomError`.                     |

## Project Structure

### Documentation (this feature)

```text
specs/014-ban-enforcement/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A for internal auth)
└── tasks.md             # Phase 2 output (speckit.tasks)
```

### Source Code (repository root)

```text
app/
└── [locale]/
    └── banned/
        └── page.tsx        # Route connector

modules/
└── user/
    └── banned-page/
        ├── components/
        ├── types/
        ├── BannedPage.tsx  # Module page
        └── index.ts

lib/
└── supabase/
    └── proxy.ts            # Middleware logic update

modules/auth/login/components/LoginForm/actions/
└── index.ts                # signIn action update
```

**Structure Decision**: Standard Next.js + Module-First architecture. The `/banned` page is a user-state-related page, placed in the `user` module.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
| :-------- | :--------- | :----------------------------------- |
| None      | -          | -                                    |
