import { parseAsFloat, parseAsArrayOf, parseAsString, parseAsStringLiteral, createSearchParamsCache, createSerializer } from 'nuqs/server';
import { DEFAULT_CURRENCY } from '../constant';
import { Currency } from '../types';

export const listingsSearchParams = {
    categories: parseAsArrayOf(parseAsString).withDefault([]),
    locations: parseAsArrayOf(parseAsString).withDefault([]),
    conditions: parseAsArrayOf(parseAsString).withDefault([]),
    minPrice: parseAsFloat.withDefault(0),
    maxPrice: parseAsFloat.withDefault(0),
    currency: parseAsStringLiteral([Currency.ILS, Currency.USD] as const).withDefault(DEFAULT_CURRENCY),
    search: parseAsString.withDefault(''),
    sortBy: parseAsString.withDefault('created_at'),
    sortOrder: parseAsStringLiteral(['asc', 'desc'] as const).withDefault('desc'),
};

export const listingsSearchParamsCache = createSearchParamsCache(listingsSearchParams);

export type ListingsSearchParamsType = Awaited<ReturnType<typeof listingsSearchParamsCache.parse>>;

export const serializeListingsSearchParams = createSerializer(listingsSearchParams)