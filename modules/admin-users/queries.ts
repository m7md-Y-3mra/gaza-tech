import type { SupabaseClient } from '@supabase/supabase-js';
import CustomError from '@/utils/CustomError';
import type {
  AdminUser,
  AdminUserListInput,
  AdminUserListResult,
  ChangeRoleInput,
  BanUserInput,
  UnbanUserInput,
  EditUserInput,
} from './types';

export async function listAdminUsersRpc(
  supabase: SupabaseClient,
  input: AdminUserListInput
): Promise<AdminUserListResult> {
  const { data, error } = await supabase.rpc('admin_list_users', {
    p_page_index: input.pageIndex,
    p_page_size: input.pageSize,
    p_sort_column: input.sortColumn,
    p_sort_direction: input.sortDirection,
    p_search: input.search || null,
    p_role_filter:
      input.roleFilter && input.roleFilter.length > 0 ? input.roleFilter : null,
    p_status_filter: input.statusFilter,
  });

  if (error) {
    throw new CustomError({
      message: error.message,
      code: error.hint ?? undefined,
    });
  }

  const row = Array.isArray(data) ? data[0] : data;

  return {
    totalCount: Number(row?.total_count ?? 0),
    items: (row?.items as AdminUser[]) ?? [],
    pageIndex: input.pageIndex,
    pageSize: input.pageSize,
  };
}

export async function changeUserRoleRpc(
  supabase: SupabaseClient,
  input: ChangeRoleInput
): Promise<void> {
  const { error } = await supabase.rpc('admin_change_user_role', {
    p_target_user_id: input.targetUserId,
    p_new_role: input.newRole,
  });

  if (error) {
    throw new CustomError({
      message: error.message,
      code: error.hint ?? undefined,
    });
  }
}

export async function banUserRpc(
  supabase: SupabaseClient,
  input: BanUserInput
): Promise<void> {
  const { error } = await supabase.rpc('admin_ban_user', {
    p_target_user_id: input.targetUserId,
    p_reason: input.reason,
  });

  if (error) {
    throw new CustomError({
      message: error.message,
      code: error.hint ?? undefined,
    });
  }
}

export async function unbanUserRpc(
  supabase: SupabaseClient,
  input: UnbanUserInput
): Promise<void> {
  const { error } = await supabase.rpc('admin_unban_user', {
    p_target_user_id: input.targetUserId,
  });

  if (error) {
    throw new CustomError({
      message: error.message,
      code: error.hint ?? undefined,
    });
  }
}

export async function editUserRpc(
  supabase: SupabaseClient,
  input: EditUserInput
): Promise<void> {
  const { error } = await supabase.rpc('admin_edit_user', {
    p_target_user_id: input.targetUserId,
    p_first_name: input.firstName,
    p_last_name: input.lastName,
    p_is_verified: input.isVerified,
  });

  if (error) {
    throw new CustomError({
      message: error.message,
      code: error.hint ?? undefined,
    });
  }
}
