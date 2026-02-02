import { formatDistanceToNow } from 'date-fns';

/**
 * Format a date as "Member X time ago"
 * @param date - Date string or Date object
 * @returns Formatted string like "2 years ago"
 * @example
 * formatMemberSince('2022-01-01') // "2 years ago"
 * formatMemberSince(null) // "recently"
 */
export function formatMemberSince(
  date: string | Date | null | undefined
): string {
  if (!date) {
    return 'recently';
  }

  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
  });
}
