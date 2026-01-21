import  ListingDetailsPage  from '@/modules/listings/listing-details';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  
  return <ListingDetailsPage id={id} />;
}
