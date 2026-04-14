'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { errorHandler } from '@/utils/error-handler';
import { requireRole } from '@/utils/rbac-handler';
import { ROLES } from '@/config/rbac';
import type {
  AdminUserListInput,
  AdminUserListResult,
  ChangeRoleInput,
  BanUserInput,
  UnbanUserInput,
  BulkChangeRoleInput,
  BulkBanInput,
  EditUserInput,
} from './types';
import {
  listAdminUsersRpc,
  changeUserRoleRpc,
  banUserRpc,
  unbanUserRpc,
  editUserRpc,
} from './queries';

const AdminUserListInputSchema = z.object({
  pageIndex: z.number().int().min(0),
  pageSize: z.number().int().min(1).max(100),
  sortColumn: z.enum([
    'name',
    'role',
    'status',
    'is_verified',
    'created_at',
    'last_activity_at',
  ]),
  sortDirection: z.enum(['asc', 'desc']),
  search: z.string().nullable(),
  roleFilter: z.array(z.enum(ROLES)).nullable(),
  statusFilter: z.enum(['active', 'banned', 'all']),
});

const ChangeRoleInputSchema = z.object({
  targetUserId: z.string().uuid(),
  newRole: z.enum(ROLES),
});

const BanUserInputSchema = z.object({
  targetUserId: z.string().uuid(),
  reason: z.string().trim().min(1).max(500),
});

const UnbanUserInputSchema = z.object({
  targetUserId: z.string().uuid(),
});

const BulkChangeRoleInputSchema = z.object({
  targetUserIds: z.array(z.string().uuid()).min(1).max(100),
  newRole: z.enum(ROLES),
});

const EditUserInputSchema = z.object({
  targetUserId: z.string().uuid(),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  isVerified: z.boolean(),
});

const BulkBanInputSchema = z.object({
  targetUserIds: z.array(z.string().uuid()).min(1).max(100),
  reason: z.string().trim().min(1).max(500),
});

export const listAdminUsersAction = errorHandler(
  async (input: AdminUserListInput): Promise<AdminUserListResult> => {
    await requireRole(['admin']);
    const parsed = AdminUserListInputSchema.parse(input);
    const supabase = await createClient();
    return listAdminUsersRpc(supabase, parsed as AdminUserListInput);
  }
);

export const changeUserRoleAction = errorHandler(
  async (input: ChangeRoleInput): Promise<void> => {
    await requireRole(['admin']);
    const parsed = ChangeRoleInputSchema.parse(input);
    const supabase = await createClient();
    return changeUserRoleRpc(supabase, parsed as ChangeRoleInput);
  }
);

export const banUserAction = errorHandler(
  async (input: BanUserInput): Promise<void> => {
    await requireRole(['admin']);
    const parsed = BanUserInputSchema.parse(input);
    const supabase = await createClient();
    return banUserRpc(supabase, parsed as BanUserInput);
  }
);

export const unbanUserAction = errorHandler(
  async (input: UnbanUserInput): Promise<void> => {
    await requireRole(['admin']);
    const parsed = UnbanUserInputSchema.parse(input);
    const supabase = await createClient();
    return unbanUserRpc(supabase, parsed as UnbanUserInput);
  }
);

export const editUserAction = errorHandler(
  async (input: EditUserInput): Promise<void> => {
    await requireRole(['admin']);
    const parsed = EditUserInputSchema.parse(input);
    const supabase = await createClient();
    return editUserRpc(supabase, parsed as EditUserInput);
  }
);

async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>
): Promise<Array<PromiseSettledResult<void>>> {
  const results: Array<PromiseSettledResult<void>> = [];
  let index = 0;

  async function runNext(): Promise<void> {
    if (index >= items.length) return;
    const current = index++;
    try {
      await fn(items[current]);
      results[current] = { status: 'fulfilled', value: undefined };
    } catch (err) {
      results[current] = {
        status: 'rejected',
        reason: err,
      };
    }
    await runNext();
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () =>
    runNext()
  );
  await Promise.all(workers);
  return results;
}

export const bulkChangeRoleAction = errorHandler(
  async (
    input: BulkChangeRoleInput
  ): Promise<{
    successful: string[];
    failed: Array<{ userId: string; code?: string; message: string }>;
  }> => {
    await requireRole(['admin']);
    const parsed = BulkChangeRoleInputSchema.parse(input);
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const targetIds = parsed.targetUserIds.filter((id) => id !== user?.id);

    const successful: string[] = [];
    const failed: Array<{ userId: string; code?: string; message: string }> =
      [];

    const results = await runWithConcurrency(targetIds, 10, async (userId) => {
      const supabaseInner = await createClient();
      await changeUserRoleRpc(supabaseInner, {
        targetUserId: userId,
        newRole: parsed.newRole,
      });
    });

    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        successful.push(targetIds[i]);
      } else {
        const err = result.reason as { code?: string; message?: string };
        failed.push({
          userId: targetIds[i],
          code: err?.code,
          message: err?.message ?? 'Unknown error',
        });
      }
    });

    return { successful, failed };
  }
);

export const bulkBanAction = errorHandler(
  async (
    input: BulkBanInput
  ): Promise<{
    successful: string[];
    failed: Array<{ userId: string; code?: string; message: string }>;
  }> => {
    await requireRole(['admin']);
    const parsed = BulkBanInputSchema.parse(input);
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const targetIds = parsed.targetUserIds.filter((id) => id !== user?.id);

    const successful: string[] = [];
    const failed: Array<{ userId: string; code?: string; message: string }> =
      [];

    const results = await runWithConcurrency(targetIds, 10, async (userId) => {
      const supabaseInner = await createClient();
      await banUserRpc(supabaseInner, {
        targetUserId: userId,
        reason: parsed.reason,
      });
    });

    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        successful.push(targetIds[i]);
      } else {
        const err = result.reason as { code?: string; message?: string };
        failed.push({
          userId: targetIds[i],
          code: err?.code,
          message: err?.message ?? 'Unknown error',
        });
      }
    });

    return { successful, failed };
  }
);
