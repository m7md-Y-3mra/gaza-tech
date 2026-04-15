'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROLES } from '@/config/rbac';
import { changeUserRoleAction } from '@/modules/admin-users/actions';
import { RoleBadge } from '@/modules/admin-users/components/role-badge';
import type { AdminUser, UserRole } from '@/modules/admin-users/types';

interface RoleTabProps {
  user: AdminUser;
  onMutationSuccess: () => void;
}

export function RoleTab({ user, onMutationSuccess }: RoleTabProps) {
  const t = useTranslations('AdminUsers');
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.user_role);
  const [isLoading, setIsLoading] = useState(false);

  const isDirty = selectedRole !== user.user_role;

  async function handleSave() {
    if (!isDirty) return;
    setIsLoading(true);
    const result = await changeUserRoleAction({
      targetUserId: user.user_id,
      newRole: selectedRole,
    });
    setIsLoading(false);

    if (result.success) {
      toast.success(t('toast.role.success'));
      onMutationSuccess();
    } else {
      toast.error(result.message ?? t('toast.role.error'));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <p className="text-muted-foreground text-sm">
          {t('userDetail.tabs.role')}
        </p>
        <RoleBadge role={user.user_role} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="role-select">{t('dialogs.changeRole.title')}</Label>
        <Select
          value={selectedRole}
          onValueChange={(v) => setSelectedRole(v as UserRole)}
        >
          <SelectTrigger id="role-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {t(`roles.${role}` as Parameters<typeof t>[0])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleSave}
        disabled={!isDirty || isLoading}
        className="w-full"
      >
        {t('dialogs.changeRole.confirm')}
      </Button>
    </div>
  );
}
