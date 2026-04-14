'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export function LogoutButton() {
  const supabase = createClient();
  const router = useRouter();
  const t = useTranslations('Profile.banned');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh(); // Middleware will then redirect correctly
    router.push('/login');
  };

  return (
    <Button variant="outline" onClick={handleLogout} className="w-full">
      {t('logout')}
    </Button>
  );
}
