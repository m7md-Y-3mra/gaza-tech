'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTranslations } from 'next-intl';
import { AdminTrendPoint } from '../../types';

interface GrowthChartProps {
  title: string;
  data: AdminTrendPoint[];
  lineColor?: string;
}

export function GrowthChart({
  title,
  data,
  lineColor = '#2563eb', // text-blue-600
}: GrowthChartProps) {
  const t = useTranslations('Dashboard.charts');

  if (!data || data.length === 0) {
    return (
      <div className="flex h-full flex-col space-y-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="bg-muted/20 flex flex-1 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">{t('noData')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="bg-card flex-1 rounded-xl border p-4 shadow-sm">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelClassName="text-foreground font-semibold"
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                });
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke={lineColor}
              strokeWidth={2}
              dot={{ r: 4, fill: lineColor, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
