# Server Actions: Category and Location Management

All actions are wrapped with `errorHandler()` and return a `ServerActionResponse`.

## Category Actions

### `createCategoryAction(data: CreateCategoryInput)`

Creates a new marketplace category.

- **Input**: `name`, `name_ar`, `description?`, `icon_url?`, `parent_id?`
- **Logic**: Generates slug, validates uniqueness, inserts into `marketplace_categories`.

### `updateCategoryAction(id: string, data: UpdateCategoryInput)`

Updates an existing marketplace category.

- **Input**: `id`, `name?`, `name_ar?`, `description?`, `icon_url?`, `parent_id?`, `is_active?`
- **Logic**: Re-generates slug if name changed, validates uniqueness, updates row.

### `deleteCategoryAction(id: string)`

Deletes a marketplace category.

- **Input**: `id`
- **Logic**: Checks for linked listings in `marketplace_listings`. Throws `CustomError` if linked. Otherwise deletes.

## Location Actions

### `createLocationAction(data: CreateLocationInput)`

Creates a new location entry.

- **Input**: `name`, `name_ar`, `sort_order?`
- **Logic**: Generates slug, validates uniqueness, inserts into `locations`.

### `updateLocationAction(id: string, data: UpdateLocationInput)`

Updates an existing location entry.

- **Input**: `id`, `name?`, `name_ar?`, `sort_order?`, `is_active?`
- **Logic**: Re-generates slug if name changed, validates uniqueness, updates row.

### `deleteLocationAction(id: string)`

Deletes a location entry.

- **Input**: `id`
- **Logic**: Checks for linked listings in `marketplace_listings`. Throws `CustomError` if linked. Otherwise deletes.
