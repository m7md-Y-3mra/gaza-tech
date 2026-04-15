# Contract: Supabase RPC `get_admin_dashboard_stats`

## Purpose

Returns all dashboard statistics (summary and trends) in a single optimized JSON object.

## Input Parameters

| Parameter         | Type  | Required | Description                                         |
| :---------------- | :---- | :------- | :-------------------------------------------------- |
| `time_range_days` | `int` | Yes      | Number of days for trend analysis (e.g., 7, 30, 90) |

## Response Format

Returns a single JSON object (record) of type `jsonb`.

## Sample Response

```json
{
  "summary": {
    "total_users": { "current": 1250, "previous": 1200 },
    "new_listings": { "current": 45, "previous": 40 },
    "new_posts": { "current": 150, "previous": 130 },
    "pending_reports": { "current": 12, "previous": 15 },
    "pending_verifications": { "current": 8, "previous": 10 }
  },
  "trends": {
    "daily_new_users": [
      { "date": "2024-04-08", "count": 5 },
      { "date": "2024-04-09", "count": 8 }
    ],
    "listing_growth": [
      { "date": "2024-04-08", "count": 2 },
      { "date": "2024-04-09", "count": 4 }
    ]
  }
}
```

## Security & Access

- Function MUST be restricted to `authenticated` role.
- Internal check inside RPC MUST verify the user has the "admin" role before execution.
