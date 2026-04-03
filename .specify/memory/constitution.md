# Gaza Tech Frontend Constitution

## Core Principles

### I. Module-First Architecture (NON-NEGOTIABLE)

Every domain lives in `modules/<module-name>/` with a mandatory internal structure: `types/`, `components/`, and page folders. Routes exist only to wire URLs to module pages — all real logic and UI live inside the module. The global project structure (`app/`, `components/`, `lib/`, `utils/`, `i18n/`, `messages/`, `config/`, `types/`) must not be duplicated, overridden, or have its responsibilities moved into modules.

- Modules align with database entities or business domains (listings, orders, users)
- Components split by responsibility: UI (`<Component>.tsx`), logic (`hooks/`), constants, types
- No mixed responsibilities in a single file; only create what is needed
- Server logic lives in `queries.ts` (database queries) and `actions.ts` (wrapped with `errorHandler()`)

### II. Server-First Rendering

Server Components are the default. Client Components (`'use client'`) are permitted only for client-side state, user interaction, or browser APIs. When a component tree mixes server and client needs, use a provider pattern to keep server components as server components.

- No client-side data fetching for initial render
- No hooks for server data
- Prefer Static/ISR/PPR; isolate dynamic parts instead of making entire pages dynamic
- Minimize purely client-side rendering for critical content

### III. Incremental Staged Development (NON-NEGOTIABLE)

Never implement a full feature in one step. Every task is split into small, isolated, reviewable stages. Each stage produces one clean Git commit following Conventional Commits.

- **Design Phase** first (UI / layout / structure, progressively)
- **Frontend Logic Phase** second (incremental, isolated changes)
- **Enhancement Phase** last (i18n, accessibility, performance — each its own stage)
- Top-down construction: page/container first, then components one by one
- Small diffs even within the same file; every step must clearly show what changed and why
- After each stage: stop, ask for explicit approval, do not continue until approved

### IV. Performance Standards (MANDATORY)

No feature may degrade performance below 95% on Core Web Vitals (Lighthouse/PageSpeed).

- **LCP**: < 2.5s — use `priority` on hero images, `next/image` with `sizes`
- **FID**: < 100ms
- **CLS**: < 0.1 — always define `width`/`height` for images; reserve space for dynamic content
- Use `next/dynamic` for heavy client components or below-the-fold content
- Use `next/font` for automatic font optimization (IBM Plex Sans Arabic loaded in locale layout)

### V. Accessibility (WCAG AA, MANDATORY)

All new UI must pass accessibility checks with zero critical errors.

- Semantic HTML required (`<button>`, `<main>`, `<nav>`, proper heading hierarchy); non-semantic interactive elements are forbidden
- ARIA only where semantic HTML is insufficient
- All interactive elements keyboard-reachable with visible focus states
- Color contrast: 4.5:1 minimum for normal text
- Descriptive `alt` text mandatory for all meaningful images

### VI. Consistent Error Handling

All server actions are wrapped with `errorHandler()` from `utils/error-handler.ts`. Forms follow react-hook-form + zod validation with `@hookform/resolvers/zod`. Business logic errors use `CustomError`.

- Server actions return `{ success, data?, message?, errors? }`
- Custom field components (`TextField`, `CheckboxField`) for consistent error display
- Automatic handling of Zod validation errors, CustomError instances, and unexpected errors

## Authentication & Middleware

Three Supabase client variants are used: browser (`client.ts`), server (`server.ts`), and middleware (`proxy.ts`). Middleware is exported from `proxy.ts` (not `middleware.ts`) and handles session refresh, locale routing, and cookie preservation. Auth pages live in `app/[locale]/(auth)/`.

## Quality Gates

### Code Quality

- `npm run check` must pass before any commit (format + lint + type-check)
- ESLint with auto-fix (`npm run lint`) and Prettier (`npm run format`) enforced
- Conventional Commits format for all commit messages

### SEO Readiness

- `metadataBase` defined in root layout
- Dynamic sitemap (`sitemap.ts`) and robots.txt (`robots.ts`) maintained
- JSON-LD structured data in layouts
- Open Graph image generation supported

### Best Practices

- Locale params are async: `params: Promise<{ locale: string }>`
- `setRequestLocale(locale)` used in layouts/pages for static optimization
- Route groups `(auth)` and `(main)` organize pages without affecting URLs
- Translation keys are dot-nested (e.g., `Auth.common.email`)

## Governance

This constitution supersedes all other development practices within this project. Any amendment requires documentation, team approval, and a migration plan for existing code.

- All PRs and code reviews must verify compliance with these principles
- Added complexity must be justified against these standards
- When principles conflict, priority order: Architecture (I) > Performance (IV) > Accessibility (V) > Rendering (II)

**Version**: 1.0.0 | **Ratified**: 2026-03-25 | **Last Amended**: 2026-03-25
