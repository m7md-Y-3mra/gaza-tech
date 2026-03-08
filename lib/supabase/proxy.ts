import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/config/env.config';
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
