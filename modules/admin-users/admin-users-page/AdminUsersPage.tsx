import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/utils/rbac-handler';
import { listAdminUsersAction } from '@/modules/admin-users/actions';
import type { AdminUserListInput } from '@/modules/admin-users/types';
import { UsersTable } from './components/users-table/UsersTable';

interface AdminUsersPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
}

function parseSearchParams(
  sp: Record<string, string | string[]>
): AdminUserListInput {
  const page = parseInt(String(sp.page ?? '0'), 10);
  const size = parseInt(String(sp.size ?? '20'), 10);
  const sort = String(sp.sort ?? 'created_at');
  const dir = String(sp.dir ?? 'desc');
  const q = String(sp.q ?? '').trim();
  const role = sp.role ? (Array.isArray(sp.role) ? sp.role : [sp.role]) : [];
  const statusArr = sp.status
    ? Array.isArray(sp.status)
      ? sp.status
      : [sp.status]
    : [];

  const validSorts = [
    'name',
    'role',
    'status',
    'is_verified',
    'created_at',
    'last_activity_at',
  ];
  const validSizes = [10, 20, 50, 100];

  function mapStatus(arr: string[]): 'active' | 'banned' | 'all' {
    if (arr.length === 0 || arr.length === 2) return 'all';
    if (arr[0] === 'active' || arr[0] === 'banned') return arr[0];
    return 'all';
  }

  return {
    pageIndex: isNaN(page) || page < 0 ? 0 : page,
    pageSize: validSizes.includes(size) ? size : 20,
    sortColumn: (validSorts.includes(sort)
      ? sort
      : 'created_at') as AdminUserListInput['sortColumn'],
    sortDirection: dir === 'asc' ? 'asc' : 'desc',
    search: q || null,
    roleFilter:
      role.length > 0 ? (role as AdminUserListInput['roleFilter']) : null,
    statusFilter: mapStatus(statusArr),
  };
}

export async function AdminUsersPage({
  params,
  searchParams,
}: AdminUsersPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  try {
    await requireRole(['admin']);
  } catch {
    redirect(`/${locale}/dashboard`);
  }

  const sp = await searchParams;
  const input = parseSearchParams(sp);

  const t = await getTranslations({ locale, namespace: 'AdminUsers' });

  let initialData;
  const result = await listAdminUsersAction(input);

  if (!result.success) {
    return (
      <div className="space-y-4 p-6">
        <div>
          <h1 className="text-2xl font-bold">{t('pageTitle')}</h1>
          <p className="text-muted-foreground">{t('pageDescription')}</p>
        </div>
        <p className="text-destructive">{t('error.title')}</p>
      </div>
    );
  }

  initialData = result.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentAdminUserId = user?.id ?? '';

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-bold">{t('pageTitle')}</h1>
        <p className="text-muted-foreground">{t('pageDescription')}</p>
      </div>
      <UsersTable
        initialData={initialData}
        currentAdminUserId={currentAdminUserId}
      />
    </div>
  );
}
