/**
 * Authentication and session-related constants.
 */

/**
 * Cookie name for caching user is_active status in Middleware.
 * Short name to minimize cookie overhead.
 */
export const USER_STATUS_COOKIE_NAME = 'sb-user-status';

/**
 * Duration for which the user status is cached in the cookie (5 minutes in milliseconds).
 */
export const USER_STATUS_CACHE_DURATION = 5 * 60 * 1000;

/**
 * Type definition for the user status cookie payload.
 */
export interface UserStatusPayload {
  /**
   * is_active status: true if account is active, false if banned.
   * Short key 'a' to save cookie space.
   */
  a: boolean;
  /**
   * User role from public.users table.
   * Short key 'r' to save cookie space.
   */
  r: string | null;
  /**
   * Timestamp when the status was last verified.
   * Short key 't' to save cookie space.
   */
  t: number;
}
