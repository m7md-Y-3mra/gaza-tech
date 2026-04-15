import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SummaryCardProps {
  title: string;
  value: number | string;
  previousValue?: number;
  percentageChange?: number;
  icon: ReactNode;
  className?: string;
}

export function SummaryCard({
  title,
  value,
  percentageChange,
  icon,
  className,
}: SummaryCardProps) {
  const t = useTranslations('Dashboard.summary');
  const isPositive = percentageChange !== undefined && percentageChange > 0;
  const isNegative = percentageChange !== undefined && percentageChange < 0;

  return (
    <div
      className={cn(
        'bg-card text-card-foreground rounded-xl border p-6 shadow-sm',
        className
      )}
    >
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="text-muted-foreground h-4 w-4">{icon}</div>
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        {percentageChange !== undefined && (
          <p className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
            <span
              className={cn(
                'flex items-center font-medium',
                isPositive && 'text-emerald-600',
                isNegative && 'text-red-600'
              )}
            >
              {isPositive && <ArrowUpIcon className="h-3 w-3" />}
              {isNegative && <ArrowDownIcon className="h-3 w-3" />}
              {Math.abs(percentageChange).toFixed(1)}%
            </span>
            {t('vsPrevious')}
          </p>
        )}
      </div>
    </div>
  );
}
