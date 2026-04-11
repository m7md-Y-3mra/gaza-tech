import type { ReactNode } from 'react';

export type ProfileTabsProps = {
  userId: string;
  page: number;
  isOwner: boolean;
};

export type ProfileTabsClientProps = {
  isOwner: boolean;
  listingsContent: ReactNode;
  bookmarkedContent: ReactNode;
  postsContent: ReactNode;
};
