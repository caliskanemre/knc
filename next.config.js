/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['tr', 'en'],
    defaultLocale: 'tr',
    localeDetection: false,
  },
  images: {
    // Next/Image optimizasyonunu etkin kullan
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd2830psw11bu27.cloudfront.net',
        port: '',
        pathname: '/**',
      },
      // AWS S3 bucket (for next/image external loader)
      {
        protocol: 'https',
        hostname: 'kinasepeti.s3.eu-north-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/image',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/locales/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
      {
        source: '/:all*(ico|png|jpg|jpeg|svg|webp|gif|css|js|xml|json)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }, // 7 gün + SWR
        ],
      },
    ];
  }
};

module.exports = nextConfig;
