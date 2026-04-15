import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/config/env.config';
import {
  USER_STATUS_CACHE_DURATION,
  USER_STATUS_COOKIE_NAME,
  type UserStatusPayload,
} from '@/constants/auth';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

type UpdateSessionResult = {
  supabaseResponse: NextResponse;
  supabase: SupabaseClient;
};

export async function updateSession(
  request: NextRequest
): Promise<UpdateSessionResult> {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // refreshing the auth token
  await supabase.auth.getUser();

  return { supabaseResponse, supabase };
}

/**
 * Fetches the user's is_active status and role, using a 5-minute cookie cache in Middleware.
 * If cache is missing or expired, it queries the database and updates the cookie.
 */
export async function getUserStatus(
  request: NextRequest,
  supabase: SupabaseClient,
  userId: string
): Promise<{ isActive: boolean; role: string | null; fromCache: boolean }> {
  const cookieValue = request.cookies.get(USER_STATUS_COOKIE_NAME)?.value;

  if (cookieValue) {
    try {
      const payload: UserStatusPayload = JSON.parse(cookieValue);
      const isExpired = Date.now() - payload.t > USER_STATUS_CACHE_DURATION;

      if (!isExpired) {
        return { isActive: payload.a, role: payload.r, fromCache: true };
      }
    } catch {
      // Invalid cookie format, fallback to DB
    }
  }

  // Cache miss or expired: Query DB
  const { data, error } = await supabase
    .from('users')
    .select('is_active, user_role')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    // If we can't fetch the status, assume active and registered to avoid locking out valid users on transient errors
    return { isActive: true, role: 'registered', fromCache: false };
  }

  return {
    isActive: !!data.is_active,
    role: data.user_role ?? null,
    fromCache: false,
  };
}

/**
 * Updates the user status cookie in the response.
 */
export function updateUserStatusCookie(
  response: NextResponse,
  isActive: boolean,
  role: string | null
) {
  const payload: UserStatusPayload = {
    a: isActive,
    r: role,
    t: Date.now(),
  };

  response.cookies.set(USER_STATUS_COOKIE_NAME, JSON.stringify(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week (the 5-minute limit is handled by payload.t)
    path: '/',
  });
}
