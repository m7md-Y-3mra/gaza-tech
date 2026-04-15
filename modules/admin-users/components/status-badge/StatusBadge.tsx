'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { STATUS_BADGE_MAP } from './constants';

interface StatusBadgeProps {
  isActive: boolean;
}

export function StatusBadge({ isActive }: StatusBadgeProps) {
  const t = useTranslations('AdminUsers');
  const key = isActive ? 'active' : 'banned';
  const config = STATUS_BADGE_MAP[key];
  const label = t(config.labelKey as Parameters<typeof t>[0]);

  return (
    <Badge className={config.className} aria-label={`Status: ${label}`}>
      {label}
    </Badge>
  );
}
