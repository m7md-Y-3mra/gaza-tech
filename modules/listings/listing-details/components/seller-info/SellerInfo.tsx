import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { VerificationBadge } from '@/components/verification-badge';
import { User } from 'lucide-react';
import Link from 'next/link';
import type { SellerInfoProps } from './types';
import { getUserAndListingsCount } from '@/modules/user/queries';
import { formatMemberSince } from '@/utils/date.utils';

const SellerInfo = async ({ sellerId }: SellerInfoProps) => {
  // Fetch seller data from Supabase
  const seller = await getUserAndListingsCount(sellerId);

  // If seller not found, return null (ErrorBoundary will catch this)
  if (!seller) {
    throw new Error('Seller not found');
  }

  const memberSince = formatMemberSince(seller.created_at);

  const fullName = `${seller.first_name} ${seller.last_name}`;

  return (
    <div className="bg-card space-y-4 rounded-lg border p-6">
      {/* Section Title */}
      <h2 className="text-xl font-semibold">Seller Information</h2>

      {/* Seller Profile */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="size-16">
            <AvatarImage src={seller.avatar_url || undefined} alt={fullName} />
            <AvatarFallback>
              <User className="size-8" />
            </AvatarFallback>
          </Avatar>
          {seller.is_verified && (
            <div className="absolute -right-1 bottom-1">
              <VerificationBadge isVerified={true} size="md" />
            </div>
          )}
        </div>

        {/* Seller Details */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold">{fullName}</h3>
          <p className="text-muted-foreground text-sm">Member {memberSince}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Active Listings</span>
          <span className="text-lg font-semibold">{seller.listingsCount}</span>
        </div>
      </div>

      {/* View Profile Button */}
      <Link href={`/profile/${seller.user_id}`} className="block">
        <button className="bg-primary hover:bg-secondary w-full rounded-xl py-3 font-semibold text-white transition-all duration-200">
          View Profile
        </button>
      </Link>
    </div>
  );
};

export default SellerInfo;
