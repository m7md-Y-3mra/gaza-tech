import { Metadata } from 'next';
import ProfilePage from '@/modules/user/profile';
import { getUserProfileAction } from '@/modules/user/actions';
import { profileSearchParamsCache } from '@/modules/user/profile/search-params';
import type { SearchParams } from 'nuqs';

interface PageProps {
  params: Promise<{
    userId: string;
  }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { userId } = await params;
  const res = await getUserProfileAction(userId);
  const user = res.success ? res.data : null;

  if (!user) {
    return {
      title: 'Profile Not Found',
      description: 'The requested profile could not be found.',
    };
  }

  const fullName = `${user.first_name} ${user.last_name}`;

  return {
    title: `${fullName} - Profile`,
    description: user.bio || `View ${fullName}'s profile and listings.`,
    openGraph: {
      title: `${fullName} - Profile`,
      description: user.bio || `View ${fullName}'s profile and listings.`,
      type: 'profile',
      ...(user.avatar_url && { images: [user.avatar_url] }),
    },
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { userId } = await params;
  const { page } = await profileSearchParamsCache.parse(searchParams);
  return <ProfilePage userId={userId} page={page} />;
}
