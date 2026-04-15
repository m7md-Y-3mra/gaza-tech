import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Toaster } from 'sonner';
import NextTopLoader from 'nextjs-toploader';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import { routing } from '@/i18n/routing';
import { DirectionProvider } from '@/components/ui/direction';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const RTL_LOCALES = ['ar', 'he', 'fa', 'ur'];

export default async function LocaleLayout({
  children,
  chat,
  params,
}: {
  children: React.ReactNode;
  chat?: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  const dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={`${ibmPlexSansArabic.className} antialiased`}>
        <NuqsAdapter>
          <DirectionProvider dir={dir}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <NextTopLoader color="#0B57D0" showSpinner={false} />
              <NextIntlClientProvider>
                {children}
                {chat}
              </NextIntlClientProvider>
              <Toaster richColors position="top-center" />
            </ThemeProvider>
          </DirectionProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
