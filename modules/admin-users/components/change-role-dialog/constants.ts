import { z } from 'zod';
import { ROLES } from '@/config/rbac';

export const ChangeRoleSchema = z.object({
  newRole: z.enum(ROLES),
});

export type ChangeRoleFormValues = z.infer<typeof ChangeRoleSchema>;
