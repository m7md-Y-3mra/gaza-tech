---
trigger: always_on
---

# Universal Project Structure & Module Workflow (MANDATORY)

You are an agentic frontend engineer working in this repository.
You must strictly follow the architecture, structure, and conventions defined below for every page, feature, or UI implementation.

## 1. Global Project Structure (NON-NEGOTIABLE)

You must integrate with the existing global structure exactly as defined:

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

## 2. Module vs Feature (IMPORTANT DISTINCTION)

A Module is a wrapper / container, not a single feature.

A module represents a domain or entity, usually aligned with:

- Database entities
- Business domains (e.g. listings, orders, users, profiles)

A module groups multiple related pages and features under the same domain.

**Rule:**
Modules live in:
`modules/<module-name>/`

Any frontend page related to that domain must live inside its module.

Example:

- `modules/listings/`
- `modules/orders/`
- `modules/users/`

## 3. Routing Rule (App Router)

Routes exist only to connect the URL to the module page.

Example:
`app/[locale]/(main)/listings/[id]/page.tsx`

Typical usage:

```tsx
import { ListingPage } from '@/modules/listings/listing';

export default function Page(props) {
  return <ListingPage {...props} />;
}
```

✔ Routes may contain minimal wiring
✔ All real logic and UI live inside the module

## 4. Mandatory Module Structure (Generic)

Every module must follow this structure:

```
modules/<module-name>/
├── types/
│   └── index.ts                     # Shared domain / database types
├── components/
│   └── <component-name>/
│       ├── constants.ts             # Constants (if any)
│       ├── hooks/use<ComponentName>.ts                 # Custom logic / hooks (if any)
│       ├── types/index.ts           # Component-specific types
│       ├── <Component>.tsx
│       └── index.ts                 # re-export any thing can reuse from outside this folder
├── <module-page>/
│   ├── types/index.ts               # All types used by this page
│   ├── components/                 # Page-specific components
│   ├── <Module>Page.tsx
│   └── index.ts
```

**Clarifications:**

- `components/` → Reusable components across the same module, shared between all pages in that module.
- `<module-page>/` → Represents a single page inside the module (e.g. listing, listing-edit, listing-create).

## 5. Page Naming Rules

- Folder name: kebab-case
- Page component name: PascalCase

Examples:

```
listing/
  └── ListingPage.tsx

listing-edit/
  └── ListingEditPage.tsx
```

❌ Use `<Module>Page.tsx` consistently

## 6. Component Internal Organization (STRICT)

Every component must be split by responsibility:

- UI → `<Component>.tsx`
- Logic → `hooks/useComponentName.ts`
- Constants → `constants.ts`
- Types → `types/index.ts`

**Rules:**

- No mixed responsibilities in one file
- No unused folders
- Only create what is needed

## 7. Server Logic Location (IMPORTANT)

- we have two file in any module queries.ts and action.ts
- queries.ts write inside it all queries to database
- actions.ts wrappe all functions from queries file to error handler and use them in my app

## 8. Server vs Client Components

**Default:**
✅ Server Components by default and when I need a client componenet make a small component to specific thing and if I has component between them can become server make a provider and make others as server component

Use Client Components only when:

- Client-side state
- User interaction
- Browser APIs

`'use client';`

❌ No client-side data fetching for initial render
❌ No hooks for server data
