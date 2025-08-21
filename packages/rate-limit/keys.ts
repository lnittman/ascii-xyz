import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      // Use standard Upstash naming convention
      UPSTASH_REDIS_REST_URL: z.string().min(1).url().optional(),
      UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
      // Keep legacy names for backward compatibility
      KV_REST_API_URL: z.string().min(1).url().optional(),
      KV_REST_API_TOKEN: z.string().min(1).optional(),
    },
    runtimeEnv: {
      // Try standard names first, fall back to legacy
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
      KV_REST_API_URL: process.env.KV_REST_API_URL,
      KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    },
  });
