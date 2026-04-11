import { Suspense } from 'react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  LatestListings,
  LatestListingsSkeleton,
} from './components/latest-listings';
import {
  CommunityHighlights,
  CommunityHighlightsSkeleton,
} from './components/community-highlights';
import { SectionErrorBoundary } from './components/section-error-boundary';

export default async function HomePage() {
  const t = await getTranslations('HomePage');

  return (
    <main className="container mx-auto space-y-12 px-4 py-8">
      {/* Latest Listings Section */}
      <section aria-labelledby="latest-listings-heading">
        <div className="mb-6 flex items-center justify-between">
          <h2 id="latest-listings-heading" className="text-2xl font-bold">
            {t('latestListings')}
          </h2>
          <Link
            href="/listings"
            className="text-primary text-sm font-medium hover:underline"
            aria-label={t('viewAll') + ' - ' + t('latestListings')}
          >
            {t('viewAll')} →
          </Link>
        </div>
        <SectionErrorBoundary fallbackMessage={t('errorListings')}>
          <Suspense fallback={<LatestListingsSkeleton />}>
            <LatestListings />
          </Suspense>
        </SectionErrorBoundary>
      </section>

      {/* Community Highlights Section */}
      <section aria-labelledby="community-highlights-heading">
        <div className="mb-6 flex items-center justify-between">
          <h2 id="community-highlights-heading" className="text-2xl font-bold">
            {t('communityHighlights')}
          </h2>
          <Link
            href="/community"
            className="text-primary text-sm font-medium hover:underline"
            aria-label={t('viewAll') + ' - ' + t('communityHighlights')}
          >
            {t('viewAll')} →
          </Link>
        </div>
        <SectionErrorBoundary fallbackMessage={t('errorPosts')}>
          <Suspense fallback={<CommunityHighlightsSkeleton />}>
            <CommunityHighlights />
          </Suspense>
        </SectionErrorBoundary>
      </section>
    </main>
  );
}
