import { ListingCardItem } from '@/modules/listings/queries';
import ListingsGrid from './ListingsGrid';
import { getTranslations } from 'next-intl/server';

const ListingsGridWithTitle = async ({
  listings,
}: {
  listings: ListingCardItem[];
}) => {
  const t = await getTranslations('ListingsHome.GridWithTitle');

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <span className="text-muted-foreground text-sm">
          {t('showingResults', { count: listings.length })}
        </span>
      </div>

      <ListingsGrid listings={listings} />
    </>
  );
};

export default ListingsGridWithTitle;
