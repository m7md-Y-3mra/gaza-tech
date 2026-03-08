import { createClient } from '@/lib/supabase/server';
import { authHandler } from './auth-handler';
import CustomError from './CustomError';
import type { UserRole } from '@/config/rbac';
import { rbacConfig } from '@/config/rbac';

/**
 * Require the current user to have one of the specified roles.
 *
 * Usage in Server Actions / queries:
 * ```ts
 * const { user, role } = await requireRole(['admin', 'moderator']);
 * ```
 *
 * @throws CustomError if user is not authenticated or lacks the required role.
 */
export async function requireRole(allowedRoles: UserRole[]) {
    // 1. Ensure user is authenticated
    const user = await authHandler();

    // 2. Fetch user_role from the public users table
    const supabase = await createClient();
    const { data: profile } = await supabase
        .from('users')
        .select('user_role')
        .eq('user_id', user.id)
        .single();

    const role = (profile?.user_role as UserRole) ?? null;

    // 3. Check role access using the RBAC Singleton
    if (!rbacConfig.hasRole(role, allowedRoles)) {
        throw new CustomError({
            message: 'Insufficient permissions',
        });
    }

    return { user, role };
}
