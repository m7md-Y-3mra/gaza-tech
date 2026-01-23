import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { VerificationBadge } from '@/components/verification-badge';
import { formatDistanceToNow } from 'date-fns';
import { User } from 'lucide-react';
import Link from 'next/link';
import type { SellerInfoProps } from './types';

const SellerInfo = async ({ sellerId }: SellerInfoProps) => {
  // TODO: Fetch seller data from Supabase in Stage 12
  // Mock data for now
  const mockSeller = {
    userId: sellerId,
    firstName: 'John',
    lastName: 'Doe',
    avatarUrl: null,
    isVerified: true,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    listingsCount: 12,
  };

  const memberSince = formatDistanceToNow(new Date(mockSeller.createdAt), {
    addSuffix: true,
  });

  const fullName = `${mockSeller.firstName} ${mockSeller.lastName}`;

  return (
    <div className="bg-card space-y-4 rounded-lg border p-6">
      {/* Section Title */}
      <h2 className="text-xl font-semibold">Seller Information</h2>

      {/* Seller Profile */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="size-16">
            <AvatarImage
              src={mockSeller.avatarUrl || undefined}
              alt={fullName}
            />
            <AvatarFallback>
              <User className="size-8" />
            </AvatarFallback>
          </Avatar>
          {mockSeller.isVerified && (
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
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-center">
          <span className="text-muted-foreground text-sm">Active Listings</span>
          <span className="text-lg font-semibold">
            {mockSeller.listingsCount}
          </span>
        </div>
      </div>

      {/* View Profile Button */}
      <Link href={`/profile/${mockSeller.userId}`} className="block">
        <button className="bg-primary hover:bg-secondary w-full rounded-xl py-3 font-semibold text-white transition-all duration-200">
          View Profile
        </button>
      </Link>
    </div>
  );
};

export default SellerInfo;
