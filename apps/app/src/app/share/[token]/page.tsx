import SharedChatClient from '@/components/app/share/shared-chat-client';
import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@repo/orpc/server';
import { unstable_cache } from 'next/cache';

// Cache shared chat data with 5 minute revalidation
const getCachedSharedChat = unstable_cache(
  async (token: string) => {
    // No auth needed for public share links
    const client = createServerClient({});
    return client.share.get({ token });
  },
  ['shared-chat'],
  {
    revalidate: 300, // 5 minutes
    tags: ['shared-chat'],
  }
);

export default async function SharedChatPage({
  params,
}: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const sharedChat = await getCachedSharedChat(token);

    let currentUser = null;
    const { userId: clerkId } = await auth();
    if (clerkId) {
      try {
        const client = createServerClient({ clerkId });
        const [user, dataSettings] = await Promise.all([
          client.user.current(),
          client.settings.data.get(),
        ]);
        if (user) {
          currentUser = {
            id: user.id,
            clerkId: user.clerkId,
            hideSharedWarning: dataSettings.hideSharedWarning,
          };
        }
      } catch (_error) {}
    }

    return (
      <SharedChatClient
        initialChatData={sharedChat}
        currentUser={currentUser}
      />
    );
  } catch (error: any) {
    return <SharedChatClient initialChatData={null} error={error.message} />;
  }
}
