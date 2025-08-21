import { DataTab } from '@/components/code/settings/components/DataTab';
import { auth } from '@repo/auth/server';
import { aiSettingsService } from '@repo/services/settings/ai';
import { userService } from '@repo/services/user';

export default async function DataSettingsPage() {
  const { userId: clerkId } = await auth();

  let initial;
  if (clerkId) {
    try {
      const user = await userService.getUserByClerkId(clerkId);
      initial = await aiSettingsService.getOrCreateAISettings(user.id);
    } catch (_error) {}
  }

  return (
    <div className="h-full w-full overflow-auto bg-background">
      <div className="max-w-3xl p-8">
        <DataTab initialSettings={initial} />
      </div>
    </div>
  );
}
