import { createSearchParamsCache, parseAsStringLiteral } from 'nuqs/server';

export const rangeParser = parseAsStringLiteral([
  '7d',
  '30d',
  '90d',
] as const).withDefault('7d');

export const dashboardSearchParamsCache = createSearchParamsCache({
  range: rangeParser,
});
