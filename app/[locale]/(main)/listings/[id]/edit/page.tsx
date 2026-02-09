import UpdateListingPage from '@/modules/listings/update-listing';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <UpdateListingPage id={id} />;
}
