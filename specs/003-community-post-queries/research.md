# Research: Community Post Queries & Server Actions

**Date**: 2026-04-02  
**Feature**: 003-community-post-queries

## R1: Server-Side Validation Pattern

**Decision**: Create a `server-schema.ts` file with Zod schemas that accept URL strings (not File objects) for attachments, matching the `createListingServerSchema` / `updateListingServerSchema` pattern in `modules/listings/schema.ts`.

**Rationale**: Client schemas in `schema.ts` validate `File` objects (for upload validation in the browser). Server schemas validate the final payload after uploads complete — attachments are URL strings at that point. The listings module uses this exact split: client schemas with `z.file()`, server schemas with `z.string()` for URLs.

**Alternatives considered**:

- Reuse client schemas on server: Rejected — `z.file()` validators would fail since server receives URLs, not File objects.
- Validate only on client: Rejected — server-side validation is mandatory per constitution (VI. Consistent Error Handling).

## R2: Attachment Update Strategy (Diff vs. Delete-All-Reinsert)

**Decision**: Use true diff strategy — compare incoming attachment URLs against existing ones, insert new URLs, delete removed rows, leave unchanged rows intact.

**Rationale**: CHAT.md explicitly specifies "Handles attachment diffs (add new, remove deleted)". This preserves `attachment_id` and `created_at` for unchanged attachments, which is cleaner for audit trails and avoids unnecessary DB writes.

**Alternatives considered**:

- Delete-all-reinsert (listings pattern): Rejected — listings delete all images and reinsert because images have `sort_order` and `is_thumbnail` that change on reorder. Community attachments have no ordering/thumbnail concept, making true diff simpler and more efficient.

## R3: Rollback Strategy on Create Failure

**Decision**: If attachment insertion fails after post creation, delete the created post row (same pattern as `createListingQuery` in `modules/listings/queries.ts:419-430`).

**Rationale**: Supabase JS client does not support database transactions directly. The listings module uses the same manual rollback approach: insert post → try insert attachments → on failure, delete the post. This prevents orphaned post rows.

**Alternatives considered**:

- Supabase RPC transaction: Possible but adds complexity (requires a PostgreSQL function). Not justified for this simple two-table insert.
- Accept orphaned rows: Rejected — violates spec FR-005.

## R4: Auth and Ownership Check Pattern

**Decision**: Use `authHandler()` for authentication (throws `CustomError` if not logged in). For ownership on update, add `.eq('author_id', user.id)` to the update query — if the user is not the author, the query affects 0 rows.

**Rationale**: Matches the listings pattern where `updateListingQuery` uses `.eq('seller_id', user.id)`. Supabase RLS provides a second layer, but the application-level check gives immediate, clear error feedback.

**Alternatives considered**:

- Rely solely on RLS: Rejected — RLS silently returns empty results without meaningful error messages. Application-level check provides better UX.
- Fetch post first, then check author: Rejected — extra query; the `.eq()` approach is one query and atomic.

## R5: Path Revalidation Targets

**Decision**: Revalidate `/community` on create/update, and `/community/[postId]` on update. These paths don't exist yet (Phase 4) but revalidation calls are safe against non-existent paths.

**Rationale**: Follows the listings pattern (`revalidatePath('/listings')` and `revalidatePath('/listings/${listingId}')`). Next.js `revalidatePath` is a no-op for paths that haven't been cached yet, so it's safe to add now.

**Alternatives considered**:

- Skip revalidation until Phase 4: Rejected — adding it now keeps actions complete and avoids forgetting later.
