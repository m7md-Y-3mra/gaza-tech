# Research Findings: Admin Statistics Dashboard

## Supabase RPC: `fetch_admin_dashboard_stats`

**Decision**: Use a single Supabase RPC named `get_admin_dashboard_stats` that returns a structured JSON object.

**Rationale**: Minimizes network round-trips and ensures atomic data retrieval for a consistent "snapshot" of the dashboard.

**Proposed Schema**:

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
      ...
    ],
    "listing_growth": [
      { "date": "2024-04-08", "count": 2 },
      { "date": "2024-04-09", "count": 4 }
      ...
    ]
  }
}
```

## Visualization: Recharts in Next.js 15

**Decision**: Install `recharts` and use `ResponsiveContainer` for all charts.

**Rationale**: Recharts is the industry standard for React. To handle Next.js Server Components, we will wrap Recharts components in client-side wrappers or use dynamic imports with `ssr: false` where needed.

**Best Practices**:

- Use `ResponsiveContainer` to match the grid layout.
- Use `CartesianGrid`, `XAxis`, `YAxis`, `Tooltip`, and `Line` components.
- Leverage `date-fns` (already in `package.json`) for date formatting on the X-Axis.

## Data Export: CSV/Excel

**Decision**: Use `xlsx` (SheetJS) for Excel and CSV export.

**Rationale**: `xlsx` is powerful, widely used, and supports both CSV and Excel (.xlsx) formats from a single data structure.

**Alternative Considered**: Native Blob API for CSV.

- **Rejected because**: `xlsx` handles complex data and Excel formatting much better, fulfilling the requirement for "CSV or Excel".

## Localization: `next-intl` Integration

**Decision**: Use `useTranslations` hook in client components for chart labels, tooltips, and card titles.

**Best Practices**:

- Pass formatted dates from `Intl.DateTimeFormat` or `date-fns` to Recharts.
- Ensure all static text in `ar.json` and `en.json` is updated with dashboard keys.

## Testing & Validation

**Decision**: Focus on Manual Verification and Type Safety.

**Rationale**: No automated testing framework (Vitest/Playwright) is currently configured in the project. We will rely on:

1. `npm run check` (Lint + Type-check).
2. Manual scenario testing as defined in `spec.md`.
