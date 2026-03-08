import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ProfileTabsClient from './ProfileTabsClient';
import ProfileListingsTab from './profile-listings-tab/ProfileListingsTab';
import { ProfileListingsTabSkeleton } from './profile-listings-tab/ProfileListingsTabSkeleton';
import { ProfileListingsTabError } from './profile-listings-tab/ProfileListingsTabError';
import ProfileBookmarkTab from './profile-bookmark-tab/ProfileBookmarkTab';
import { ProfileBookmarkTabSkeleton } from './profile-bookmark-tab/ProfileBookmarkTabSkeleton';
import { ProfileBookmarkTabError } from './profile-bookmark-tab/ProfileBookmarkTabError';
import type { ProfileTabsProps } from './types';

const ProfileTabs = ({ userId, page, isOwner }: ProfileTabsProps) => {
  return (
    <ProfileTabsClient
      isOwner={isOwner}
      listingsContent={
        <Suspense fallback={<ProfileListingsTabSkeleton />}>
          <ErrorBoundary FallbackComponent={ProfileListingsTabError}>
            <ProfileListingsTab userId={userId} page={page} isOwner={isOwner} />
          </ErrorBoundary>
        </Suspense>
      }
      bookmarkedContent={
        isOwner ? (
          <Suspense fallback={<ProfileBookmarkTabSkeleton />}>
            <ErrorBoundary FallbackComponent={ProfileBookmarkTabError}>
              <ProfileBookmarkTab page={page} />
            </ErrorBoundary>
          </Suspense>
        ) : null
      }
    />
  );
};

export default ProfileTabs;
