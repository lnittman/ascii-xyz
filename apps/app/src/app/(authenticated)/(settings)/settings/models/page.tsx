import { ModelsTab } from '@/components/app/settings/components/ModelsTab';
import { auth } from '@repo/auth/server';
import { CACHE_TAGS } from '@repo/orpc/lib/cache';
import { createServerClient } from '@repo/orpc/server';
import { unstable_cache } from 'next/cache';

// Cache AI settings with 1 hour revalidation
const getCachedAISettings = unstable_cache(
  async (clerkId: string) => {
    // Create client with provided auth context
    const client = createServerClient({ clerkId });
    return client.settings.ai.get();
  },
  ['ai-settings'],
  {
    revalidate: 3600, // 1 hour
    tags: [CACHE_TAGS.AI_SETTINGS, CACHE_TAGS.SETTINGS],
  }
);

export default async function ModelsSettingsPage() {
  const { userId: clerkId } = await auth();

  let initialSettings;
  if (clerkId) {
    try {
      initialSettings = await getCachedAISettings(clerkId);
    } catch (_error) {}
  }

  return (
    <div className="min-h-full bg-background">
      <ModelsTab initialSettings={initialSettings} />
    </div>
  );
}
