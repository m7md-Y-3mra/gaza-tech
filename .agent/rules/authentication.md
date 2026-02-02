# Authentication Flow

1. **Supabase Setup**: Three client variants:
   - `lib/supabase/client.ts`: Browser-side client
   - `lib/supabase/server.ts`: Server-side client with cookie handling
   - `lib/supabase/proxy.ts`: Middleware session refresh

2. **Middleware Pattern**: Uses `proxy.ts` (not `middleware.ts`) which:
   - Refreshes Supabase auth sessions
   - Runs next-intl middleware for locale routing
   - Combines responses to preserve auth cookies

3. **Auth Pages**: Located in `app/[locale]/(auth)/`
   - Login, signup, and email verification
   - Route group prevents shared layout pollution
