import { VerificationBadge } from '@/components/verification-badge';
import type { BadgeOverlayProps } from './types';
import { memo } from 'react';

// This will be updated in Stage 12 with actual server action
const BadgeOverlay = memo(async ({ listingId }: BadgeOverlayProps) => {
  // TODO: Fetch verification status from Supabase in Stage 12
  // For now, mock data
  const isVerified = false;

  return <VerificationBadge isVerified={isVerified} size="md" />;
});

export default BadgeOverlay;
