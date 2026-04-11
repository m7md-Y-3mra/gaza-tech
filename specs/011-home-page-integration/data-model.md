# Phase 1: Data Model

The Home Page Integration feature does not introduce new database tables or entities. It completely relies on existing entities:

## Entity: Listing

Properties fetched (via `getListingsAction`):

- `list_id`, `title`, `price`, `created_at`, `images`, author details, etc.
- **Constraint**: Must fetch exactly 4 items, ordered by most recently published.

## Entity: CommunityPost

Properties fetched (via `getCommunityPostsAction`):

- `post_id`, `title`, `content`, `post_category`, `published_at`, `author`, `like_count`, `comment_count`, etc.
- **Constraint**: Must fetch exactly 3 items, ordered by most recently published.

## State Transitions

N/A - This is a read-only dashboard view.
