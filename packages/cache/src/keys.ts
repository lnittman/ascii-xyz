import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      // For backwards compatibility, we'll keep the old env var names
      // but they won't be used in the KV implementation
      KV_REST_API_URL: z.string().optional(),
      KV_REST_API_TOKEN: z.string().optional(),
    },
    runtimeEnv: {
      KV_REST_API_URL: process.env.KV_REST_API_URL,
      KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    },
    skipValidation: true, // Skip validation since we're not using these env vars anymore
  });
