import type { UserRole } from '@/config/rbac';

export type NavLink = {
    href: string;
    labelKey: string;
    /** If set, the link is only visible to users with one of these roles. */
    allowedRoles?: UserRole[];
};

export type NavbarUser = {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    userRole: UserRole | null;
};
