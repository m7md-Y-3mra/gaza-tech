import { ShieldCheck } from 'lucide-react';
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
    // <BadgeCheck
    //   className={cn(
    //     'text-primary fill-primary/10',
    //     sizeClasses[size],
    //     className
    //   )}
    //   aria-label="Verified"
    // />
    <ShieldCheck
      className={cn(
        'text-verification-icon fill-verification-bg',
        sizeClasses[size],
        className
      )}
      aria-label="Verified"
      // className="size-3 fill-blue-500/10 text-blue-500"
    />
  );
};

export default VerificationBadge;
