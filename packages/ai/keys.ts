import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      OPENAI_API_KEY: z.string().min(1).startsWith('sk-'),
      OPENROUTER_API_KEY: z.string().min(1).startsWith('sk-or-'),
    },
    client: {
      NEXT_PUBLIC_AI_URL: z.string().url().default('http://localhost:3999'),
    },
    runtimeEnv: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
      NEXT_PUBLIC_AI_URL: process.env.NEXT_PUBLIC_AI_URL,
    },
  });
