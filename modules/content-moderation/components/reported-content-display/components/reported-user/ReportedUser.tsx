'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Calendar, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

interface ReportedUserProps {
  user: any;
}

const ReportedUser: React.FC<ReportedUserProps> = ({ user }) => {
  if (!user) return null;

  const fullName = `${user.first_name} ${user.last_name}`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                <AvatarImage src={user.avatar_url || ''} />
                <AvatarFallback><User className="h-10 w-10" /></AvatarFallback>
            </Avatar>
            {user.user_role === 'verified_seller' && (
                <div className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1 text-white shadow-lg">
                    <ShieldCheck className="h-4 w-4" />
                </div>
            )}
        </div>

        <div>
            <h4 className="text-xl font-bold">{fullName}</h4>
            <div className="flex items-center gap-1.5 justify-center text-sm text-muted-foreground mt-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Member since {format(new Date(user.created_at), 'MMMM yyyy')}</span>
            </div>
        </div>
      </div>

      {user.bio && (
        <div className="rounded-md border bg-muted/20 p-4">
          <p className="text-sm italic leading-relaxed text-center">{user.bio}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-center border-t pt-4">
        <div>
            <p className="text-xs text-muted-foreground uppercase font-bold">Status</p>
            <p className={user.is_active ? "text-sm text-green-600 font-bold" : "text-sm text-red-600 font-bold"}>
                {user.is_active ? "ACTIVE" : "BANNED"}
            </p>
        </div>
        <div>
            <p className="text-xs text-muted-foreground uppercase font-bold">Role</p>
            <p className="text-sm font-bold uppercase">{user.user_role?.replace('_', ' ') || 'USER'}</p>
        </div>
      </div>
    </div>
  );
};

export default ReportedUser;
