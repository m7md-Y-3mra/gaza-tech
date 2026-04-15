'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Calendar, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

interface UserData {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  user_role?: string;
  is_active?: boolean;
  bio?: string;
  created_at: string;
}

interface ReportedUserProps {
  user: UserData;
}

const ReportedUser: React.FC<ReportedUserProps> = ({ user }) => {
  if (!user) return null;

  const fullName = `${user.first_name} ${user.last_name}`;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <Avatar className="border-background h-24 w-24 border-4 shadow-xl">
            <AvatarImage src={user.avatar_url || ''} />
            <AvatarFallback>
              <User className="h-10 w-10" />
            </AvatarFallback>
          </Avatar>
          {user.user_role === 'verified_seller' && (
            <div className="bg-primary absolute -right-1 -bottom-1 rounded-full p-1 text-white shadow-lg">
              <ShieldCheck className="h-4 w-4" />
            </div>
          )}
        </div>

        <div>
          <h4 className="text-xl font-bold">{fullName}</h4>
          <div className="text-muted-foreground mt-1 flex items-center justify-center gap-1.5 text-sm">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              Member since {format(new Date(user.created_at), 'MMMM yyyy')}
            </span>
          </div>
        </div>
      </div>

      {user.bio && (
        <div className="bg-muted/20 rounded-md border p-4">
          <p className="text-center text-sm leading-relaxed italic">
            {user.bio}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 border-t pt-4 text-center">
        <div>
          <p className="text-muted-foreground text-xs font-bold uppercase">
            Status
          </p>
          <p
            className={
              user.is_active
                ? 'text-sm font-bold text-green-600'
                : 'text-sm font-bold text-red-600'
            }
          >
            {user.is_active ? 'ACTIVE' : 'BANNED'}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs font-bold uppercase">
            Role
          </p>
          <p className="text-sm font-bold uppercase">
            {user.user_role?.replace('_', ' ') || 'USER'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportedUser;
