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
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: 'CacheFirst',
      options: { cacheName: 'image-cache', expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 } }
    }
  ]
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const formattedBasePath = basePath && !basePath.startsWith('/') ? `/${basePath}` : basePath;

const nextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: formattedBasePath,
  assetPrefix: formattedBasePath,
};

module.exports = withPWA(nextConfig);
