import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { AdminUser } from '@/modules/admin-users/types';

interface UserAvatarCellProps {
  user: AdminUser;
}

export function UserAvatarCell({ user }: UserAvatarCellProps) {
  const initials = [user.first_name, user.last_name]
    .map((n) => n?.[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <Avatar className="h-8 w-8" style={{ minWidth: '2rem' }}>
      <AvatarImage
        src={user.avatar_url ?? undefined}
        alt={`${user.first_name} ${user.last_name}`}
      />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
