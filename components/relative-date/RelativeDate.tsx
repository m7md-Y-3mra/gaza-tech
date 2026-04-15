'use client';

import { formatDistanceToNow } from 'date-fns';
import { enUS, arSA } from 'date-fns/locale';
import { useLocale } from 'next-intl';

interface RelativeDateProps {
  timestamp: string | null;
  className?: string;
}

export function RelativeDate({ timestamp, className }: RelativeDateProps) {
  const locale = useLocale();
  const dateFnsLocale = locale === 'ar' ? arSA : enUS;

  if (!timestamp) {
    return <span className={className}>—</span>;
  }

  const date = new Date(timestamp);
  const relative = formatDistanceToNow(date, {
    addSuffix: true,
    locale: dateFnsLocale,
  });

  return (
    <time
      dateTime={timestamp}
      title={date.toISOString()}
      className={className}
      style={{ minWidth: '6rem', display: 'inline-block' }}
    >
      {relative}
    </time>
  );
}
