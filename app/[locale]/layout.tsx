import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Toaster } from 'sonner';
import NextTopLoader from 'nextjs-toploader';
import { Playpen_Sans_Arabic } from 'next/font/google';

const playpenArabic = Playpen_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const RTL_LOCALES = ['ar', 'he', 'fa', 'ur'];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={`${playpenArabic.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader color="#00bc7d" showSpinner={false} />
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
