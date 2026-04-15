import { getListingsAction } from '@/modules/listings/actions';
import ListingsGrid from '@/modules/listings/home/components/listings-grid';
import { getTranslations } from 'next-intl/server';

export async function LatestListings() {
  const t = await getTranslations('HomePage');
  const result = await getListingsAction({
    filters: {},
    page: 1,
    limit: 4,
  });

  if (!result.success || !result.data?.data || result.data.data.length === 0) {
    return (
      <div className="border-muted-foreground/25 flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <p className="text-muted-foreground">{t('emptyListings')}</p>
      </div>
    );
  }

  return <ListingsGrid listings={result.data.data} />;
}
