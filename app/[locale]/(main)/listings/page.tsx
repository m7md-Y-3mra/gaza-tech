import ListingsPage from '@/modules/listings/home';
import { listingsSearchParamsCache } from '@/modules/listings/home/search-params';
import type { SearchParams } from 'nuqs';

type ListingsPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function listingsPage({
  searchParams,
}: ListingsPageProps) {
  const searchParamsRes = await listingsSearchParamsCache.parse(searchParams);
  return <ListingsPage searchParams={searchParamsRes} />;
}
