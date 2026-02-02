# Best Practices & Patterns

## Important Patterns

1. **Locale Params**: All pages under `[locale]` receive async params:

   ```typescript
   async function Page({ params }: { params: Promise<{ locale: string }> }) {
     const { locale } = await params;
   }
   ```

2. **Static Rendering**: Use `setRequestLocale(locale)` in layouts/pages for static optimization

3. **Font Loading**: IBM Plex Sans Arabic is loaded in locale layout, applied globally

4. **Route Groups**: Use parentheses for grouping without affecting URL structure:
   - `(auth)`: Authentication pages
   - `(main)`: Main application pages

5. **Component Organization**:
   - `components/ui/`: Primitive components (from shadcn/ui)
   - `components/[name]/`: Complex components with sub-components in nested folder

## Common Gotchas

- **Middleware**: The middleware is exported from `proxy.ts`, not `middleware.ts`
- **Locale Layout**: Don't modify `app/layout.tsx`, all config is in `app/[locale]/layout.tsx`
- **Supabase Cookies**: Always use the appropriate client (browser vs server) based on component type
- **Translation Keys**: Nested with dots (e.g., `Auth.common.email` in JSON, accessed as `t('Auth.common.email')`)
