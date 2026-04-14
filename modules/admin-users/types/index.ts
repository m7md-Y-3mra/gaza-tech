import type { UserRole } from '@/config/rbac';

export type { UserRole };

export interface AdminUser {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  avatar_url: string | null;
  user_role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  ban_reason: string | null;
  banned_at: string | null;
  created_at: string;
  last_activity_at: string | null;
}

export type SortColumn =
  | 'name'
  | 'role'
  | 'status'
  | 'is_verified'
  | 'created_at'
  | 'last_activity_at';

export type SortDirection = 'asc' | 'desc';

export interface AdminUserListInput {
  pageIndex: number;
  pageSize: number;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  search: string | null;
  roleFilter: UserRole[] | null;
  statusFilter: 'active' | 'banned' | 'all';
}

export interface AdminUserListResult {
  totalCount: number;
  items: AdminUser[];
  pageIndex: number;
  pageSize: number;
}

export interface UsersTableState {
  pageIndex: number;
  pageSize: 10 | 20 | 50 | 100;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  search: string;
  roleFilter: UserRole[];
  statusFilter: Array<'active' | 'banned'>;
  columnVisibility: Record<string, boolean>;
}

export interface ChangeRoleInput {
  targetUserId: string;
  newRole: UserRole;
}

export interface BanUserInput {
  targetUserId: string;
  reason: string;
}

export interface UnbanUserInput {
  targetUserId: string;
}

export interface BulkChangeRoleInput {
  targetUserIds: string[];
  newRole: UserRole;
}

export interface BulkBanInput {
  targetUserIds: string[];
  reason: string;
}

export interface EditUserInput {
  targetUserId: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
}
