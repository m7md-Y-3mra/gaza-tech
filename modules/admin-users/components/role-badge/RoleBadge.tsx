'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import type { UserRole } from '@/modules/admin-users/types';
import { ROLE_BADGE_MAP } from './constants';

interface RoleBadgeProps {
  role: UserRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const t = useTranslations('AdminUsers');
  const config = ROLE_BADGE_MAP[role];
  const label = t(config.labelKey as Parameters<typeof t>[0]);

  return (
    <Badge className={config.className} aria-label={`Role: ${label}`}>
      {label}
    </Badge>
  );
}
