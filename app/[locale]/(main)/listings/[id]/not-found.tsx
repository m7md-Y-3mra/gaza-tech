import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  const t = useTranslations('ListingDetails.errors.notFound');

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-6">
        <h1 className="text-muted-foreground text-6xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">{t('title')}</h2>
        <p className="text-muted-foreground">{t('description')}</p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 size-4" />
              {t('goHome')}
            </Link>
          </Button>
          <Button variant="outline" className="hover:text-white!" asChild>
            <Link href="/search">
              <Search className="mr-2 size-4" />
              {t('searchListings')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
