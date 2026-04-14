import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { ShieldAlert } from 'lucide-react';
import { redirect } from 'next/navigation';
import { LogoutButton } from './components/LogoutButton';

/**
 * Server Component that displays the ban reason to a restricted user.
 * It fetches the latest status and reason directly from Supabase.
 */
export async function BannedPage({ locale }: { locale: string }) {
  const supabase = await createClient();
  const t = await getTranslations('Profile.banned');

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no session at all, they shouldn't be here (Middleware should handle this, but safety first)
  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Fetch fresh status and reason
  const { data: profile, error } = await supabase
    .from('users')
    .select('is_active, ban_reason')
    .eq('user_id', user.id)
    .single();

  if (error || !profile) {
    // If we can't find the profile, something is wrong, but we can't show a reason
  }

  // If the user is actually active (e.g. unbanned since last Middleware check), redirect them home
  if (profile?.is_active) {
    redirect(`/${locale}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
            <ShieldAlert className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {t('title')}
          </h2>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            {t('description')}
          </p>
        </div>

        <div className="mt-6 rounded-lg border border-red-100 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-950/20">
          <p className="text-center text-base leading-relaxed font-medium text-red-800 dark:text-red-200">
            {profile?.ban_reason || 'No specific reason provided.'}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {t('contactSupport')}
          </p>
          <div className="pt-2">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
