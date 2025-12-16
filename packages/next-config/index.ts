import withBundleAnalyzer from '@next/bundle-analyzer';

import type { NextConfig } from 'next';

export const config: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },

  // biome-ignore lint/suspicious/useAwait: rewrites is async
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
      {
        source: '/ingest/decide',
        destination: 'https://us.i.posthog.com/decide',
      },
    ];
  },

  // Next.js 16: Turbopack is the default bundler
  // Empty config acknowledges we're using Turbopack (removes deprecation error)
  // Turbopack automatically handles server/client boundaries without manual fallbacks
  turbopack: {},

  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

// @ts-ignore - Ignore type mismatch between Next.js versions
export const withAnalyzer = (sourceConfig: NextConfig): NextConfig =>
  withBundleAnalyzer()(sourceConfig);
