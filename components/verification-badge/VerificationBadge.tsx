import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VerificationBadgeProps } from './types';
import { sizeClasses } from './constants';

const VerificationBadge = ({
  isVerified,
  size = 'md',
  className,
}: VerificationBadgeProps) => {
  if (!isVerified) return null;

  return (
    <BadgeCheck
      className={cn(
        'text-primary fill-primary/10',
        sizeClasses[size],
        className
      )}
      aria-label="Verified"
    />
  );
};

export default VerificationBadge;
