---
description: Workflow for determining and implementing the optimal Next.js rendering strategy
---

# Next.js Rendering Strategy

## Step 1: Identify Component Requirements

- Decide if the component can be a Server Component.
- Switch to Client Component ONLY if hooks like `useState`, `useEffect`, or event handlers are required.

## Step 2: Identify Page Rendering Strategy

- Determine whether the page can be Static by default.
- Check for `cookies()`, `headers()`, `searchParams`, or `force-dynamic` flags.
- Decide between Static, ISR, Dynamic, or PPR.

## Step 3: Optimize for Performance

- Keep as much of the page Static as possible.
- Isolate dynamic parts instead of making the whole page Dynamic.
- Prefer ISR or PPR over full Dynamic rendering when applicable.
