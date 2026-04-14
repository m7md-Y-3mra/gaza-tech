import { setRequestLocale } from 'next-intl/server';

import { AdminUsersPage } from '@/modules/admin-users/admin-users-page';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
}

export default async function Page(props: Props) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  return <AdminUsersPage {...props} />;
}
