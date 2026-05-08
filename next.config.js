/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: { cacheName: 'supabase-cache', expiration: { maxEntries: 50 } }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
      handler: 'CacheFirst',
      options: { cacheName: 'image-cache', expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 } }
    }
  ]
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const formattedBasePath = (basePath && basePath.startsWith('/')) ? basePath : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  basePath: formattedBasePath,
  assetPrefix: formattedBasePath,

  // ── IMAGE OPTIMIZATION (Vercel handles this for free) ──────────
  // Sebelumnya: unoptimized: true → gambar 2–10MB langsung dikirim ke user
  // Sekarang: Next.js otomatis resize + convert ke WebP/AVIF per device
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400,         // Cache 24 jam
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // ── PERFORMANCE ────────────────────────────────────────────────
  compress: true,
  poweredByHeader: false,

  // ── HEADERS ────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
