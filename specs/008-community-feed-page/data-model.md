# Data Model: Community Feed Page

## Existing Types (consumed, not changed)

### `FeedPost` — `modules/community/types/index.ts`

```ts
type FeedPost = {
  post_id: string;
  author: AuthorStub; // { id, name, avatar_url }
  title: string;
  content: string;
  post_category: string; // keyof POST_CATEGORIES
  published_at: string; // ISO timestamp
  attachments: FeedAttachment[];
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
};

type Page<T> = {
  data: T[];
  has_more: boolean;
  next_page: number | null;
};
```

### `PostCategory` — `modules/community/types/index.ts`

```ts
type PostCategory = 'questions' | 'tips' | 'news' | 'troubleshooting';
```

---

## New Types (`modules/community/community-feed/types/index.ts`)

### `FeedFilters`

Represents the combined filter state reflected in the URL.

```ts
type FeedFilters = {
  category: PostCategory | ''; // '' means "All" (no filter)
  q: string; // search term; '' means no search
};
```

**Validation rules**:

- `category` must be a valid `PostCategory` key or empty string
- `q` is a free-form string, max length 200 (client-side UI constraint only; server ignores overly long values gracefully)

### `SsrFeedState`

Passed from the server page component to the client `FeedList` to seed the initial render.

```ts
type SsrFeedState = {
  items: FeedPost[];
  hasMore: boolean;
  filters: FeedFilters; // the filters that were active at SSR time
};
```

---

## Schema Extension (`modules/community/server-schema.ts`)

`feedQuerySchema` gains an optional `search` field:

```ts
export const feedQuerySchema = paginationSchema.extend({
  category: postCategorySchema, // existing
  search: z.string().trim().max(200).optional(), // NEW
});
```

---

## RPC Contract Extension (`get_community_feed`)

| Parameter    | Type   | Default | Notes                            |
| ------------ | ------ | ------- | -------------------------------- |
| `p_page`     | `int`  | —       | required                         |
| `p_limit`    | `int`  | —       | required                         |
| `p_category` | `text` | `NULL`  | filter by category               |
| `p_search`   | `text` | `NULL`  | **NEW** — ILIKE match on `title` |

Filter logic added to WHERE clause:

```sql
AND (p_search IS NULL OR p_search = '' OR title ILIKE '%' || p_search || '%')
```

---

## State Transitions

```
[URL: /community]
      │
      ▼ server reads searchParams
[SSR: getCommunityFeedQuery({ page:1, limit:10, category?, search? })]
      │
      ▼ passes Page<FeedPost> to CommunityFeedPage
[CommunityFeedPage renders FeedFilters + FeedList with initialItems]
      │
      ├─ User changes category tab
      │   └─ nuqs updates URL → FeedList resets → client fetches page 1
      │
      ├─ User types in search (300ms debounce)
      │   └─ nuqs updates URL → FeedList resets → client fetches page 1
      │
      └─ User scrolls to bottom (has_more = true)
          └─ useInfiniteScroll fetches next page → appends to list
```

---

## Category Tab Constants (`modules/community/community-feed/components/feed-filters/constants.ts`)

```ts
type CategoryTab = {
  value: PostCategory | '';
  labelKey: string; // i18n key in CommunityFeed namespace
};

const CATEGORY_TABS: CategoryTab[] = [
  { value: '', labelKey: 'filters.all' },
  { value: 'questions', labelKey: 'filters.questions' },
  { value: 'tips', labelKey: 'filters.tips' },
  { value: 'news', labelKey: 'filters.news' },
  { value: 'troubleshooting', labelKey: 'filters.troubleshooting' },
];
```
