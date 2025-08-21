import { createEnv } from '@t3-oss/env-nextjs';

import { keys as analytics } from '@repo/analytics/keys';
import { keys as auth } from '@repo/auth/keys';
import { keys as database } from '@repo/database/keys';
import { keys as core } from '@repo/next-config/keys';
import { keys as security } from '@repo/security/keys';

export const env = createEnv({
  extends: [analytics(), auth(), core(), database(), security()],
  server: {},
  client: {},
  runtimeEnv: {},
});
