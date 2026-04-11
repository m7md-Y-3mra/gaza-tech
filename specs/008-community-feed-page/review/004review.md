# Spec Review: 008-community-feed-page — Lint Errors After "All" Category Fix

- Branch: `008-community-feed-page`
- Review file: `004review.md`

## Summary

- Overall status: **FAIL**
- High-risk issues: 2 errors in `FeedList.tsx` (7 lint violations from 1 root cause + 1 unused variable warning)
- Type-check: 0 errors
- Format: PASS (after running `npm run format`)
- Lint: 7 errors, 11 warnings

## Actual `npm run check` Output (errors only, from FeedList.tsx)

```
modules/community/community-feed/components/feed-list/FeedList.tsx
  43:22  error  Cannot access refs during render   react-hooks/refs
  43:41  error  Cannot access refs during render   react-hooks/refs
  43:42  error  Cannot access refs during render   react-hooks/refs
  70:21  error  Cannot access refs during render   react-hooks/refs
  70:21  error  Cannot access refs during render   react-hooks/refs
  71:23  error  Cannot access refs during render   react-hooks/refs
  71:23  error  Cannot access refs during render   react-hooks/refs
  80:31  warning  'postId' is defined but never used  @typescript-eslint/no-unused-vars
```

All 7 errors come from the same root cause. The warning is a separate issue.

---

## Issues List (Consolidated)

### Issue 1: `useRef` read during render violates React Compiler `react-hooks/refs` rule

- [x] FIXED
- Severity: **BLOCKER** (blocks `npm run check`)
- Depends on: none
- Fix notes: Replaced `useRef(false)` with `useState(false)` in `FeedList.tsx`. State is safe to read during render and fulfills React Compiler requirements.

- Evidence:
  - `FeedList.tsx:35` — `const hasFiltersEverChanged = useRef(false);`
  - `FeedList.tsx:43` — `const useSsrData = filtersMatchSsr && !hasFiltersEverChanged.current;` (reads ref during render)
  - `FeedList.tsx:70-71` — `useSsrData` is used in hook arguments (also during render)

- Root cause analysis:
  This project uses the **React Compiler** (React 19). The React Compiler enforces that `ref.current` must NOT be read during the render phase — only inside effects, event handlers, or callbacks. The `useRef` approach reads `.current` at the top level of the component body (line 43), which is the render phase. The React Compiler correctly flags this as an error because it can't safely memoize a component that reads a mutable ref during render.

- Proposed solution:

  **Replace `useRef` with `useState`**. State IS meant to be read during render. Once `hasFiltersEverChanged` is set to `true`, it never goes back to `false`, so there is no extra re-render cost — `setHasFiltersEverChanged(true)` when it's already `true` is a no-op in React.

  **File: `modules/community/community-feed/components/feed-list/FeedList.tsx`**

  **Change 1 — Line 3: Update the import** (remove `useRef`, add `useState`):

  ```tsx
  // OLD:
  import { useMemo, useRef, useEffect } from 'react';

  // NEW:
  import { useMemo, useState, useEffect } from 'react';
  ```

  **Change 2 — Line 35: Replace `useRef` with `useState`:**

  ```tsx
  // OLD:
  const hasFiltersEverChanged = useRef(false);

  // NEW:
  const [hasFiltersEverChanged, setHasFiltersEverChanged] = useState(false);
  ```

  **Change 3 — Lines 37-41: Update the effect to use the state setter:**

  ```tsx
  // OLD:
  useEffect(() => {
    if (!filtersMatchSsr) {
      hasFiltersEverChanged.current = true;
    }
  }, [filtersMatchSsr]);

  // NEW:
  useEffect(() => {
    if (!filtersMatchSsr) {
      setHasFiltersEverChanged(true);
    }
  }, [filtersMatchSsr]);
  ```

  **Change 4 — Line 43: Read state instead of ref** (no `.current`):

  ```tsx
  // OLD:
  const useSsrData = filtersMatchSsr && !hasFiltersEverChanged.current;

  // NEW:
  const useSsrData = filtersMatchSsr && !hasFiltersEverChanged;
  ```

  Lines 70-71 (`useSsrData ? ...`) need NO changes — `useSsrData` is now a plain boolean derived from state, which is valid to read during render.

---

### Issue 2: Unused `postId` parameter in `handleOpenComments`

- [x] FIXED
- Severity: **LOW** (warning, not error — does not block `npm run check`)
- Depends on: none
- Fix notes: Prefixed unused parameter with underscore (`_postId`) in `FeedList.tsx` to satisfy lint rule.

- Evidence:
  - `FeedList.tsx:80` — `const handleOpenComments = (postId: string) => {`
  - The function body is empty (placeholder for future modal)

- Root cause analysis:
  The `handleOpenComments` callback accepts a `postId` parameter but doesn't use it. The function body was a `console.log` that got removed. The parameter is still needed for the `PostCard` `onOpenComments` prop type signature, but the lint rule flags the unused variable.

- Proposed solution:

  **Prefix the unused parameter with an underscore:**

  **File: `modules/community/community-feed/components/feed-list/FeedList.tsx`**

  ```tsx
  // OLD:
  const handleOpenComments = (postId: string) => {
    // Comments modal handling will be implemented in a future phase.
  };

  // NEW:
  const handleOpenComments = (_postId: string) => {
    // Comments modal handling will be implemented in a future phase.
  };
  ```

---

## Fix Plan (Ordered)

1. Issue 1: `useRef` read during render — Replace `useRef(false)` with `useState(false)`, update effect to use setter, read state value instead of `.current`
2. Issue 2: Unused `postId` — Prefix with underscore: `_postId`

---

## Handoff to Coding Model (Copy/Paste)

**File to edit**: `modules/community/community-feed/components/feed-list/FeedList.tsx`

**4 exact changes (apply in order):**

1. **Line 3** — Replace the import:
   - OLD: `import { useMemo, useRef, useEffect } from 'react';`
   - NEW: `import { useMemo, useState, useEffect } from 'react';`

2. **Line 35** — Replace useRef with useState:
   - OLD: `const hasFiltersEverChanged = useRef(false);`
   - NEW: `const [hasFiltersEverChanged, setHasFiltersEverChanged] = useState(false);`

3. **Line 39** — Replace ref mutation with state setter:
   - OLD: `hasFiltersEverChanged.current = true;`
   - NEW: `setHasFiltersEverChanged(true);`

4. **Line 43** — Remove `.current`:
   - OLD: `const useSsrData = filtersMatchSsr && !hasFiltersEverChanged.current;`
   - NEW: `const useSsrData = filtersMatchSsr && !hasFiltersEverChanged;`

5. **Line 80** — Prefix unused param with underscore:
   - OLD: `const handleOpenComments = (postId: string) => {`
   - NEW: `const handleOpenComments = (_postId: string) => {`

After all changes, run `npm run check` to verify 0 errors.

**Why `useState` instead of `useRef`**: This project uses the React Compiler (React 19) which enforces that `ref.current` cannot be read during the render phase — only in effects and event handlers. `useState` values ARE designed to be read during render. Since `hasFiltersEverChanged` only ever goes from `false` to `true` (one-way), there is no extra re-render cost — React skips re-render when `setState` is called with the same value.

**Commit message**: `fix: replace useRef with useState to satisfy React Compiler refs rule`
