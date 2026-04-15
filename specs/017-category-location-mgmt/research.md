# Research: Category and Location Management

## Database Schema

### Marketplace Categories

Table: `public.marketplace_categories`

- `marketplace_category_id`: UUID (Primary Key)
- `name`: Text (English)
- `name_ar`: Text (Arabic)
- `slug`: Text (Unique)
- `description`: Text (Optional)
- `icon_url`: Text (Optional)
- `parent_id`: UUID (Self-reference, for hierarchy - though spec says flat list)
- `is_active`: Boolean
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Locations

Table: `public.locations`

- `location_id`: UUID (Primary Key)
- `name`: Text (English)
- `name_ar`: Text (Arabic)
- `slug`: Text (Unique)
- `is_active`: Boolean
- `sort_order`: Integer
- `created_at`: Timestamp
- `updated_at`: Timestamp

## Dependencies & Deletion Protection

The following tables reference `marketplace_categories` or `locations`:

- `marketplace_listings`: References `category_id` and `location_id`.

**Deletion Strategy**:

1. Before deleting, query `marketplace_listings` to check if any active listings are linked to the category/location.
2. If linked, prevent deletion and show a warning as per spec.
3. Database foreign key constraints will also naturally prevent deletion if restricted.

## UI/UX Patterns

- **Tabs**: Use Shadcn/UI `Tabs` component to switch between "Categories" and "Locations".
- **Tables**: Use the project's existing data table pattern (likely based on `@tanstack/react-table`).
- **Forms**: Use `react-hook-form` + `zod` for validation (uniqueness, non-empty).
- **Modals**: Use `Dialog` (Shadcn/UI) for Create/Edit forms to keep the management experience fluid.

## Technical Decisions

1. **Module Location**: `modules/category-location/`.
2. **Slug Generation**: Use `slugify` or a similar utility for name-to-slug conversion if not handled by the database.
3. **Localization**: Both English (`name`) and Arabic (`name_ar`) names are required as per schema.
