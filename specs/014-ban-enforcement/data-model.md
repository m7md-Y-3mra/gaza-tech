# Data Model: Ban Enforcement (Auth Layer)

## Entities

### User (`public.users`)

Represents the user profile with extended auth/ban fields.

| Field        | Type      | Description                                    | Validation       |
| :----------- | :-------- | :--------------------------------------------- | :--------------- |
| `user_id`    | `uuid`    | Primary Key, foreign key to `auth.users`.      | Required, UNIQUE |
| `is_active`  | `boolean` | Ban status. `true` = active, `false` = banned. | Default: `true`  |
| `ban_reason` | `text`    | Reason for ban. Displayed to banned users.     | Optional         |

## Relationships

- **User** has a 1:1 relationship with **Supabase Auth User** via `user_id`.

## State Transitions

- **Active** -> **Banned**: An admin sets `is_active = false` and provides a `ban_reason`.
- **Banned** -> **Active**: An admin sets `is_active = true` and optionally clears the `ban_reason`.
