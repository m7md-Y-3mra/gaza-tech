# Contract: Public Listing Visibility After Ban

Cross-feature integration contract. Not a single RPC — a guarantee that existing public listing surfaces filter out banned owners.

## Purpose

Codify the behavior required by FR-037 and the ban → unban round-trip scenario (Spec Scenarios 3.3, 4.3). When an admin bans user `U`:

- `U`'s marketplace listings **disappear** from public-facing queries.
- `U`'s community posts and comments **remain visible** (FR-038).

When `U` is unbanned, both effects reverse automatically — no per-row writes on listings are performed by the ban/unban RPCs. Instead, public queries filter by `users.is_active`.

## Queries that MUST filter

Any query that powers a **public-facing** marketplace surface has to join `public.users` on the listing owner and include:

```sql
  AND owner.is_active = true
```

Known callers to audit as part of this feature:

| File                          | Function                              | Status                            |
| ----------------------------- | ------------------------------------- | --------------------------------- |
| `modules/home/queries.ts`     | `getLatestListingsQuery`              | MUST include filter               |
| `modules/listings/queries.ts` | `getListingsQuery` (browse page)      | MUST include filter               |
| `modules/listings/queries.ts` | `getListingBySlugQuery` (detail page) | MUST 404 / hide if owner inactive |
| Any search / trending RPC     | —                                     | MUST include filter               |

Queries that MUST **NOT** add this filter (admin surfaces and owner-self views):

- `admin_list_users` (lists banned users by definition).
- Any `/profile/me/listings`-style query for the owner's own listings (the owner should still see their own listings as "hidden by ban" in the UI; the query itself does not filter them out).

## Community visibility

Community feed / post queries must **not** filter by `users.is_active` on the author. FR-038 explicitly requires banned users' historical posts/comments to remain visible. A future moderation feature can hide them per-row; Phase 1 is scope-silent about that.

## Listing detail page — UX contract

For listing detail (`/listings/[slug]`):

- If owner is active → render normally.
- If owner is banned → 404 (not 403). Do not expose that a listing exists but is hidden. A banned listing URL is indistinguishable from a nonexistent one to the public.
- Admins viewing via admin tools are allowed to see the listing (separate admin detail path, out of Phase 1 scope).

## Implementation hooks

Phase 1 does not ship the filter patches — the ban/unban RPCs rely on the filter being present in the listing queries. This contract is a **mandatory precondition**, tracked as a follow-up task under the Phase 1 implementation checklist (`tasks.md`). If any public listing query is discovered to not filter by `users.is_active`, Phase 1 is not complete — ban has a visibility hole.

## Acceptance

- Scenario 3.3: admin bans U → SELECT from `getListingsQuery` as anonymous user returns 0 rows for U.
- Scenario 4.3: admin unbans U → same query now returns U's listings again without any row mutation on `listings`.
- Ad-hoc: community feed query run before and after ban returns the same row count for U's posts.

## Non-goals (Phase 1)

- Hiding U's posts: out of scope (FR-038). A moderation admin can still report/hide individual posts through the existing moderation feature.
- Soft-delete semantics: listings are never mutated on ban. They remain in storage, untouched.
- Tombstoning of listing URLs: no tombstone payload is returned; banned-owner listings are 404 to the public.
