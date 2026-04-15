# Quickstart: Admin Statistics Dashboard

## Prerequisites
- Supabase project linked.
- Admin user role defined in DB.

## 1. Setup Dependencies
```bash
npm install recharts xlsx
```

## 2. Deploy Supabase RPC
Deploy the `get_admin_dashboard_stats` function to Supabase as specified in `/contracts/rpc-get-admin-dashboard-stats.md`.

## 3. Implement Frontend Modules
Create components in `@modules/dashboard/components/`:
- `SummaryCards.tsx` (Summary metrics grid)
- `GrowthCharts.tsx` (Line charts for trends)
- `ExportButton.tsx` (CSV/Excel download)
- `TimeRangeFilter.tsx` (Preset range selector)

## 4. Integrate Dashboard Page
Implement the page in `app/[locale]/dashboard/page.tsx` as a Server Component to check RBAC and render the dashboard layout with its children modules.
