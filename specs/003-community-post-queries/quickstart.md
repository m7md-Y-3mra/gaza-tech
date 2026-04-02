# Quickstart: Community Post Queries & Server Actions

**Feature**: 003-community-post-queries  
**Branch**: `003-community-post-queries`

## Prerequisites

- Supabase project running with `community_posts` and `community_posts_attachments` tables
- `community-attachments` storage bucket configured
- Phase 2 complete (`modules/community/types/index.ts` and `modules/community/schema.ts` exist)

## Implementation Order

### Stage 1: Server Schema (`modules/community/server-schema.ts`)

Create server-side Zod schemas that validate the payload after client-side file uploads (attachments are URL strings, not File objects).

**Pattern reference**: `modules/listings/schema.ts` lines 163-191 (`createListingServerSchema`, `updateListingServerSchema`)

Key decisions:
- Create schema: requires `title`, `content`, `post_category`, optional `attachments` as `Array<{ url: string }>`
- Update schema: same fields but all partial, attachments include `isExisting` boolean flag
- No `author_id` in schema — injected from `authHandler()` in queries

### Stage 2: Queries (`modules/community/queries.ts`)

Create three query functions:

1. **`createCommunityPostQuery(data)`** — Insert post row with `content_status: 'published'` and `published_at: new Date().toISOString()`. If attachments provided, insert attachment rows. On attachment failure, delete the post (manual rollback).

2. **`updateCommunityPostQuery(postId, data)`** — Update post row with `.eq('author_id', user.id)` ownership check. Diff attachments: fetch current, delete removed, insert new.

3. **`getCommunityPostDetailsQuery(postId)`** — Select post with joined `community_posts_attachments` via Supabase `.select()` relational query.

**Pattern reference**: `modules/listings/queries.ts` (`createListingQuery`, `updateListingQuery`, `getListingDetailsQuery`)

### Stage 3: Actions (`modules/community/actions.ts`)

Wrap each query with `errorHandler()`:

1. **`createCommunityPostAction`** — Wraps create query, revalidates `/community`
2. **`updateCommunityPostAction`** — Wraps update query, revalidates `/community` and `/community/[postId]`
3. **`getCommunityPostDetailsAction`** — Wraps details query (no revalidation needed for read)

**Pattern reference**: `modules/listings/actions.ts`

## Key Files to Reference

| File | Why |
|------|-----|
| `modules/listings/queries.ts` | Query patterns, auth, rollback |
| `modules/listings/actions.ts` | errorHandler wrapping, revalidation |
| `modules/listings/schema.ts` | Server schema pattern |
| `modules/community/schema.ts` | Client schemas (Phase 2) |
| `modules/community/types/index.ts` | Types (Phase 2) |
| `utils/error-handler.ts` | errorHandler implementation |
| `utils/auth-handler.ts` | authHandler implementation |
| `lib/zod-error.ts` | zodValidation utility |
| `constants/community-file.ts` | POST_CATEGORIES, file constants |

## Verification

After each stage, run:
```bash
npm run check  # format + lint + type-check
```

Functional verification happens in Phase 4 (form UI) and Phase 5 (integration).
