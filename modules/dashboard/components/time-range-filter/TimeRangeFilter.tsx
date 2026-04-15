'use client';

import { useQueryState } from 'nuqs';
import { useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { rangeParser } from '../../search-params';
import { TimeRange } from '../../types';

export function TimeRangeFilter() {
  const t = useTranslations('Dashboard.filters');
  const [range, setRange] = useQueryState('range', rangeParser);

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-sm font-medium sm:inline-block">
        {t('timeRange')}:
      </span>
      <Select
        value={range}
        onValueChange={(value) => setRange(value as TimeRange)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder={t('timeRange')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">{t('last7Days')}</SelectItem>
          <SelectItem value="30d">{t('last30Days')}</SelectItem>
          <SelectItem value="90d">{t('last90Days')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
