import { notFound } from 'next/navigation';
import type { ProfilePageProps } from './types';
import { getUserProfileAction } from '@/modules/user/actions';
import ProfileTabs from './components/profile-tabs';
import ProfileHero from './components/profile-hero';
import { getCurrentUser } from '../queries';

const ProfilePage = async ({ userId, page }: ProfilePageProps) => {
  // Fetch profile user data
  const res = await getUserProfileAction(userId);
  const user = res.success ? res.data : null;

  if (!user) {
    notFound();
  }

  // Determine if the current logged-in user is the profile owner
  const currentUser = await getCurrentUser();
  const isOwner = currentUser?.id === userId;

  return (
    <div className="bg-background-alt min-h-screen">
      {/* Top Hero Area */}
      <ProfileHero user={user} />

      {/* Main Content Section */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div>
          <ProfileTabs userId={userId} page={page} isOwner={isOwner} />
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
