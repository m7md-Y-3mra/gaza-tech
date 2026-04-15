# Data Model: Category and Location Management

## Entities

### MarketplaceCategory

Represents a classification for products in the marketplace.

| Field                     | Type    | Description          | Validation                   |
| ------------------------- | ------- | -------------------- | ---------------------------- |
| `marketplace_category_id` | UUID    | Primary Key          | Required, Unique             |
| `name`                    | String  | Name in English      | Required, Non-empty, Unique  |
| `name_ar`                 | String  | Name in Arabic       | Required, Non-empty, Unique  |
| `slug`                    | String  | URL-friendly name    | Required, Unique, Kebab-case |
| `description`             | String  | Brief description    | Optional                     |
| `icon_url`                | String  | URL to category icon | Optional, URL format         |
| `is_active`               | Boolean | Status flag          | Default: true                |

### Location

Represents a geographical entry for product availability.

| Field         | Type    | Description       | Validation                   |
| ------------- | ------- | ----------------- | ---------------------------- |
| `location_id` | UUID    | Primary Key       | Required, Unique             |
| `name`        | String  | Name in English   | Required, Non-empty, Unique  |
| `name_ar`     | String  | Name in Arabic    | Required, Non-empty, Unique  |
| `slug`        | String  | URL-friendly name | Required, Unique, Kebab-case |
| `is_active`   | Boolean | Status flag       | Default: true                |
| `sort_order`  | Integer | Display order     | Optional                     |

## Relationships

- **Listing → Category**: `marketplace_listings.category_id` references `marketplace_categories.marketplace_category_id`. (Many-to-One)
- **Listing → Location**: `marketplace_listings.location_id` references `locations.location_id`. (Many-to-One)

## Deletion Constraints

- **Category**: Cannot be deleted if referenced by any row in `marketplace_listings`.
- **Location**: Cannot be deleted if referenced by any row in `marketplace_listings`.
