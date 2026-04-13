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

export const reportQueueSearchParams = {
  query: parseAsString.withDefault(''),
  page: parseAsInteger.withDefault(DEFAULT_PAGE_NUMBER),
  contentType: parseAsString.withDefault('all'),
  reason: parseAsString.withDefault('all'),
  status: parseAsString.withDefault('pending'),
};

export const reportQueueSearchParamsCache =
  createSearchParamsCache(reportQueueSearchParams);

export type ReportQueueSearchParamsType = Awaited<
  ReturnType<typeof reportQueueSearchParamsCache.parse>
>;

export const serializeReportQueueSearchParams = createSerializer(reportQueueSearchParams);

export { DEFAULT_LIMIT_NUMBER as QUEUE_PAGE_SIZE };
