'use server';

import { verifyApiKeyAction } from '@repo/orpc/actions';
import { invokeServerAction } from '@repo/orpc/server-action-wrapper';

export async function verifyApiKey(
  provider: string,
  apiKey: string
): Promise<boolean> {
  try {
    const result = await invokeServerAction(verifyApiKeyAction, {
      provider,
      apiKey,
    });
    return result === true;
  } catch (_error) {
    return false;
  }
}
