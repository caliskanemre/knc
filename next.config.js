/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  i18n: {
    locales: ['tr', 'en'],
    defaultLocale: 'tr',
    localeDetection: false,
  },
  images: {
    // Next/Image optimizasyonunu etkin kullan
    formats: ['image/avif', 'image/webp'],
    // LCP OPTİMİZASYONU: Daha agresif image loading
    minimumCacheTTL: 86400,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd2830psw11bu27.cloudfront.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // LCP OPTİMİZASYONU: Kritik kaynakları optimize et
  experimental: {
    optimizeCss: true, // CSS optimizasyonunu tekrar etkinleştir
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
  // Webpack optimizasyonları
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!dev && !isServer) {
      // Bundle splitting için daha iyi optimizasyon
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          mui: {
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            name: 'mui',
            chunks: 'all',
            priority: 10,
          },
        },
      };
    }
    return config;
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
