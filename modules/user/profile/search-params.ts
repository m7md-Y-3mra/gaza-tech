import {
    parseAsInteger,
    createSearchParamsCache,
    createSerializer,
} from 'nuqs/server';

export const profileSearchParams = {
    page: parseAsInteger.withDefault(1),
};

export const profileSearchParamsCache =
    createSearchParamsCache(profileSearchParams);

export type ProfileSearchParamsType = Awaited<
    ReturnType<typeof profileSearchParamsCache.parse>
>;

export const serializeProfileSearchParams =
    createSerializer(profileSearchParams);
