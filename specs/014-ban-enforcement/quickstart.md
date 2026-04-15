# Quickstart: Ban Enforcement (Auth Layer)

## Description

This feature implements a ban enforcement layer that blocks inactive users (`is_active: false`) in the application.

## Key Files

- `proxy.ts`: Middleware entry point.
- `lib/supabase/proxy.ts`: Supabase session logic for Middleware.
- `modules/user/banned-page/`: Module for the banned message.
- `app/[locale]/banned/page.tsx`: Route to the module page.
- `modules/auth/login/components/LoginForm/actions/index.ts`: `signIn` server action.

## Implementation Steps

1. **Update Middleware (`proxy.ts`)**:
   - Check `is_active` status in the profile fetch.
   - Implement cookie-based caching for status.
   - Redirect to `/[locale]/banned` if status is false.

2. **Update Server Action (`modules/auth/login/components/LoginForm/actions/index.ts`)**:
   - Perform a fresh `is_active` check during login.
   - Throw a `CustomError` if the user is banned.

3. **Create Banned Page (`modules/user/banned-page/BannedPage.tsx`)**:
   - Build UI showing the "Account Banned" message and the `ban_reason`.
   - Use a Server Component for direct data fetching.

4. **Add Translations**:
   - Update `messages/en.json` and `messages/ar.json` with new ban-related keys.

## Testing

1.  **Login Attempt**: Try signing in with an `is_active = false` account. Expect error.
2.  **Navigation Block**: Log in with an active account, then manually set `is_active = false` in the database. Navigate to `/dashboard` after 5 minutes. Expect redirect to `/banned`.
3.  **Direct Access**: Visit `/banned` while logged in with a banned account. Expect ban reason display.
