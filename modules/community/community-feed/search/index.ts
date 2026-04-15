import { createSearchParamsCache, parseAsString } from 'nuqs/server';

export const communityFeedSearchParams = {
  category: parseAsString.withDefault(''),
  q: parseAsString.withDefault(''),
};

export const communityFeedSearchCache = createSearchParamsCache(
  communityFeedSearchParams
);
