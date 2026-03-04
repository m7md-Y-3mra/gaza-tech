'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ProfileTabsClientProps } from './types';

const ProfileTabsClient = ({
  isOwner,
  listingsContent,
  bookmarkedContent,
}: ProfileTabsClientProps) => {
  return (
    <Tabs
      defaultValue="listings"
      className="bg-card border-border flex w-full flex-col overflow-hidden rounded-2xl border shadow-sm"
    >
      <div className="border-border bg-muted/40 border-b">
        <TabsList className="inline-flex h-16 w-full items-center justify-start rounded-none bg-transparent p-0">
          <TabsTrigger
            value="listings"
            className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-card flex-1 items-center justify-center rounded-tl-xl rounded-bl-none border-b-2 border-transparent px-6 py-4 text-sm font-semibold transition-all data-[state=active]:shadow-none"
          >
            My Listings
          </TabsTrigger>
          {isOwner && (
            <TabsTrigger
              value="bookmarked"
              className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-card flex-1 items-center justify-center rounded-tr-xl rounded-br-none border-b-2 border-transparent px-6 py-4 text-sm font-semibold transition-all data-[state=active]:shadow-none"
            >
              Saved Items
            </TabsTrigger>
          )}
        </TabsList>
      </div>

      {/* Listings Tab */}
      <TabsContent
        value="listings"
        className="animate-in fade-in slide-in-from-bottom-2 px-8 duration-300"
      >
        {listingsContent}
      </TabsContent>

      {/* Bookmarked Tab */}
      {isOwner && (
        <TabsContent
          value="bookmarked"
          className="animate-in fade-in slide-in-from-bottom-2 mt-0 p-6 duration-300"
        >
          {bookmarkedContent}
        </TabsContent>
      )}
    </Tabs>
  );
};

export default ProfileTabsClient;
