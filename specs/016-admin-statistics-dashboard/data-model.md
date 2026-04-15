# Data Model: Admin Statistics Dashboard

## Summary Metrics Type

```typescript
interface MetricComparison {
  current: number;
  previous: number;
  percentage_change: number; // Calculated on frontend: ((current - previous) / previous) * 100
}

interface AdminDashboardSummary {
  total_users: MetricComparison;
  new_listings: MetricComparison;
  new_posts: MetricComparison;
  pending_reports: MetricComparison;
  pending_verifications: MetricComparison;
}
```

## Trend Data Type

```typescript
interface AdminTrendPoint {
  date: string; // ISO format (YYYY-MM-DD)
  count: number;
}

interface AdminDashboardTrends {
  daily_new_users: AdminTrendPoint[];
  listing_growth: AdminTrendPoint[];
}
```

## Complete RPC Response

```typescript
interface AdminDashboardStatsResponse {
  summary: AdminDashboardSummary;
  trends: AdminDashboardTrends;
}
```

## Frontend State (Filter context)

```typescript
type TimeRange = '7d' | '30d' | '90d';
```
