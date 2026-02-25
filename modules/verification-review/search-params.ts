import {
    parseAsString,
    parseAsInteger,
    createSearchParamsCache,
    createSerializer,
} from 'nuqs/server';
import {
    DEFAULT_LIMIT_NUMBER,
    DEFAULT_PAGE_NUMBER,
} from '@/constants/pagination';

export const queueSearchParams = {
    query: parseAsString.withDefault(''),
    page: parseAsInteger.withDefault(DEFAULT_PAGE_NUMBER),
};

export const queueSearchParamsCache =
    createSearchParamsCache(queueSearchParams);

export type QueueSearchParamsType = Awaited<
    ReturnType<typeof queueSearchParamsCache.parse>
>;

export const serializeQueueSearchParams =
    createSerializer(queueSearchParams);

export { DEFAULT_LIMIT_NUMBER as QUEUE_PAGE_SIZE };
