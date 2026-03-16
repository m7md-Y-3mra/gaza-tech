import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'biekkaxdittvxqgvmepf.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: '5.imimg.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'laptopmedia.com',
      }, {
        protocol: 'https',
        hostname: 'www.notebookcheck.net'
      }, {
        protocol: 'https',
        hostname: 'www.fixo.com.au'
      },
      {
        protocol: 'https',
        hostname: 'sm.pcmag.com'
      },
      {
        protocol: 'https',
        hostname: 'i.ebayimg.com'
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com'
      },
      {
        protocol: 'https',
        hostname: 'i5.walmartimages.com'
      },
      {
        protocol: 'https',
        hostname: '*'
      }
    ],
  },
  cacheComponents: true,
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
