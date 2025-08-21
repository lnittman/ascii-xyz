import type { NextConfig } from 'next';

import { config, withAnalyzer } from '@repo/next-config';

import { env } from './env';

let nextConfig: NextConfig = config;

if (env.ANALYZE === 'true') {
  nextConfig = withAnalyzer(nextConfig);
}

nextConfig.devIndicators = false;

// Exclude server-only packages from client bundling
nextConfig.serverExternalPackages = [
  '@prisma/client',
  'postgres',
  'pg',
  '@neondatabase/serverless',
];

// Skip prerendering - will handle at runtime

export default nextConfig;
