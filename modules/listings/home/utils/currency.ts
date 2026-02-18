import 'server-only';

import { Currency } from '../../types';

const FRANKFURTER_API_URL = 'https://api.frankfurter.dev/v1/latest';
const REVALIDATE_SECONDS = 86400; // 24 hours

type FrankfurterResponse = {
    amount: number;
    base: string;
    date: string;
    rates: Record<string, number>;
};

/**
 * Fetches the exchange rate between two currencies from the Frankfurter API.
 * The result is cached by Next.js for 24 hours via `next: { revalidate }`.
 */
export async function getExchangeRate(
    from: string,
    to: string
): Promise<number> {
    if (from === to) return 1;

    const res = await fetch(
        `${FRANKFURTER_API_URL}?base=${from}&symbols=${to}`,
        { next: { revalidate: REVALIDATE_SECONDS } }
    );

    if (!res.ok) {
        console.error('Failed to fetch exchange rate:', res.statusText);
        throw new Error('Failed to fetch exchange rate');
    }

    const data: FrankfurterResponse = await res.json();
    return data.rates[to];
}

type PriceRangePerCurrency = {
    min: number;
    max: number;
};

type PriceRangesForBothCurrencies = {
    usd: PriceRangePerCurrency;
    ils: PriceRangePerCurrency;
};

/**
 * Given the user's selected currency and price range,
 * converts the range into both USD and ILS so we can query
 * listings in both currencies with a single `.or()` filter.
 *
 * Example: user filters $50-$200 USD → returns:
 *   { usd: { min: 50, max: 200 }, ils: { min: 155.25, max: 621 } }
 */
export async function getPriceRangesForBothCurrencies(
    minPrice: number,
    maxPrice: number,
    userCurrency: string
): Promise<PriceRangesForBothCurrencies> {
    const otherCurrency =
        userCurrency === Currency.USD ? Currency.ILS : Currency.USD;
    const rate = await getExchangeRate(userCurrency, otherCurrency);

    const userRange: PriceRangePerCurrency = {
        min: minPrice,
        max: maxPrice,
    };

    const convertedRange: PriceRangePerCurrency = {
        min: Math.floor(minPrice * rate),
        max: Math.ceil(maxPrice * rate),
    };

    if (userCurrency === Currency.USD) {
        return { usd: userRange, ils: convertedRange };
    }

    return { ils: userRange, usd: convertedRange };
}
