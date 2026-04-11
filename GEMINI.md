# Project Rules & Workflows

## 1. Development Commands

```bash
# Development
npm run dev              # Start development server (localhost:3000)

# Code Quality
npm run lint             # Run ESLint with auto-fix
npm run format           # Format code with Prettier
npm run check-format     # Check code formatting
npm run type-check       # Run TypeScript type checking
npm run check            # Run all checks (format, lint, type-check)

# Production
npm run build            # Build for production
npm start                # Start production server
```

## 2. Project Structure (NON-NEGOTIABLE)

Integrate with the existing global structure exactly as defined:

```
app/
├── layout.tsx
├── [locale]/
│   ├── layout.tsx
│   ├── (auth)/
│   └── (main)/
components/
├── ui/
├── text-field/
├── checkbox-field/
└── loading/
lib/
├── supabase/
├── utils.ts
└── zod-error.ts
utils/
├── error-handler.ts
├── CustomError.ts
└── env.utils.ts
i18n/
messages/
config/
types/
```

❌ Do not duplicate shared logic
❌ Do not introduce parallel abstractions
❌ Do not move global responsibilities into modules

## 3. Plan Rule

ALWAYS before making any change. Search on the web for the newest documentation. And only implement if you are 100% sure it will work

### Modules

A module represents a domain/entity (aligned with database entities or business domains). Lives in `modules/<module-name>/`. Any frontend page related to a domain must live inside its module.

### Routing Rule

Routes exist only to connect the URL to the module page:

```tsx
import { ListingPage } from '@/modules/listings/listing';

export default function Page(props) {
  return <ListingPage {...props} />;
}
```

### Mandatory Module Structure

```
modules/<module-name>/
├── types/
│   └── index.ts
├── components/
│   └── <component-name>/
│       ├── constants.ts
│       ├── hooks/use<ComponentName>.ts
│       ├── types/index.ts
│       ├── <Component>.tsx
│       └── index.ts
├── <module-page>/
│   ├── types/index.ts
│   ├── components/
│   ├── <Module>Page.tsx
│   └── index.ts
```

- `components/` → Reusable across the same module
- `<module-page>/` → A single page inside the module (e.g. listing, listing-edit)

### Naming

- Folder name: kebab-case
- Page component: PascalCase (`ListingPage`, `ListingEditPage`)

### Component Internal Organization

- UI → `<Component>.tsx`
- Logic → `hooks/useComponentName.ts`
- Constants → `constants.ts`
- Types → `types/index.ts`

No mixed responsibilities in one file. Only create what is needed.

### Server Logic (queries.ts + actions.ts)

Every module has two server files:

- `queries.ts` — all database queries
- `actions.ts` — wraps queries with `errorHandler()`, exposed to the app

### Server vs Client Components

✅ Server Components by default. For client needs, make a small focused client component. If a parent component has both server and client children, use a provider pattern and keep what can be server as server.

Use `'use client'` only for: client-side state, user interaction, browser APIs.

❌ No client-side data fetching for initial render
❌ No hooks for server data

## 3. Authentication

Three Supabase client variants:

- `lib/supabase/client.ts` — Browser-side client
- `lib/supabase/server.ts` — Server-side client with cookie handling
- `lib/supabase/proxy.ts` — Middleware session refresh

**Middleware**: Exported from `proxy.ts` (not `middleware.ts`). Refreshes Supabase auth sessions + runs next-intl middleware for locale routing + combines responses to preserve auth cookies.

**Auth Pages**: `app/[locale]/(auth)/` — login, signup, email verification. Route group prevents shared layout pollution.

## 4. Forms & Error Handling

### Form Pattern

1. Define zod schema for validation
2. Use `@hookform/resolvers/zod` with `useForm()`
3. Wrap server actions with `errorHandler()` from `utils/error-handler.ts`
4. Server actions return `{ success: boolean, data?: T, message?: string, errors?: Record<string, string> }`
5. Use custom field components (`TextField`, `CheckboxField`) for consistent error display

### Error Handling

Wrap all server actions with `errorHandler()`:

```typescript
import { errorHandler } from '@/utils/error-handler';

export const myAction = errorHandler(async (data) => {
  // Action logic
  return result;
});
```

Handles automatically: Zod validation errors, `CustomError` instances, unexpected errors (logged to console).

Throw `CustomError` for business logic errors:

```typescript
import CustomError from '@/utils/CustomError';

throw new CustomError('Error message', { field: 'error detail' });
```

## 5. Best Practices

1. **Locale Params**: All pages under `[locale]` receive async params:

   ```typescript
   async function Page({ params }: { params: Promise<{ locale: string }> }) {
     const { locale } = await params;
   }
   ```

2. **Static Rendering**: Use `setRequestLocale(locale)` in layouts/pages for static optimization.

3. **Font Loading**: IBM Plex Sans Arabic is loaded in locale layout, applied globally.

4. **Route Groups**: `(auth)` for authentication pages, `(main)` for main application pages.

5. **Component Organization**: `components/ui/` for primitives (shadcn/ui), `components/[name]/` for complex components.

### Common Gotchas

- **Middleware**: Exported from `proxy.ts`, not `middleware.ts`
- **Locale Layout**: Don't modify `app/layout.tsx` — all config is in `app/[locale]/layout.tsx`
- **Supabase Cookies**: Always use the appropriate client (browser vs server) based on component type
- **Translation Keys**: Nested with dots — e.g. `Auth.common.email` in JSON, accessed as `t('Auth.common.email')`

## 6. Performance & Accessibility (MANDATORY)

### Performance Thresholds

❌ No feature should degrade performance below **95%** on Core Web Vitals.

- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

Required:

- Use `next/dynamic` for heavy client components or below-the-fold content
- Use `next/image` with `sizes`, `priority` (for LCP), and modern formats
- Prefer Static/ISR/PPR; minimize purely client-side rendering for critical content

### Accessibility (WCAG AA)

❌ All new UI must pass accessibility checks with zero critical errors.

- Semantic HTML (`<button>`, `<main>`, `<nav>`, `<h1>` hierarchy) — non-semantic interactive elements are forbidden
- ARIA only where semantic HTML is insufficient
- All interactive elements keyboard-reachable with visible focus states
- Color contrast: 4.5:1 for normal text
- Descriptive `alt` text mandatory for all meaningful images

## 7. Development Workflow (MANDATORY)

### Incremental Staged Development

**Never implement a full feature in one step.** Always split into small, isolated, reviewable stages. Each stage = one clean Git commit.

### Stage Order

1. **Design Phase** — UI / layout / structure first, progressively in small steps
2. **Frontend Logic Phase** — Add logic incrementally, keep changes isolated
3. **Enhancement Phase** — i18n, accessibility, performance/UX improvements (each as its own stage)

### Top-Down Construction

Build page/container first → then components one by one → gradually integrate. Never build deep components without their parent structure.

### File & Code Granularity

Implement changes in small chunks even within the same file. Avoid large diffs. Every step must clearly show what changed and why.

### Approval & Commit Workflow

After each stage: stop and ask for explicit approval. Do not continue until approval is given. Once approved: propose a clear Conventional Commits message and commit.

### Strict Rules

- Do not skip stages
- Do not merge multiple stages into one
- Do not assume approval
- Do not optimize or extend scope unless explicitly requested

**Summary**: Small steps, top-down structure, staged commits, explicit approval, no bulk changes.

---

## Workflows

### Commit

1. Stage all changes: `git add .`
2. Analyze diff: `git diff --cached`
3. Generate a [Conventional Commits](https://www.conventionalcommits.org/) message and commit
4. Optionally push: `git push`

### Fix Lint Errors

1. `npm run lint -- --fix`
2. `npx prettier --write .`

### Next.js Rendering Strategy

1. **Identify component needs** — Server Component by default; Client only if `useState`, `useEffect`, or event handlers are required
2. **Identify page rendering** — Check for `cookies()`, `headers()`, `searchParams` to decide Static / ISR / Dynamic / PPR
3. **Optimize** — Keep as much Static as possible; isolate dynamic parts; prefer ISR or PPR over full Dynamic

### Core Web Vitals Optimizer

- **LCP fix**: Add `priority` to hero `<Image>`
- **CLS fix**: Always define `width`/`height` for images (or `fill` with a sized container); reserve space for dynamic content with `min-height`
- **Fonts**: Use `next/font` for automatic optimization and hosting
- Run Lighthouse audit (Chrome DevTools, Incognito) to get a baseline score

### SEO Setup

1. `metadataBase` in `app/layout.tsx`:
   ```tsx
   export const metadata: Metadata = {
     metadataBase: new URL('https://acme.com'),
   };
   ```
2. Dynamic sitemap at `app/sitemap.ts`
3. Robots.txt at `app/robots.ts`
4. JSON-LD structured data in `layout.tsx` via `<script type="application/ld+json">`
5. Open Graph image via `opengraph-image.tsx`
