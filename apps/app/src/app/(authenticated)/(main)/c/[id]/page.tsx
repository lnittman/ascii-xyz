import { Chat } from '@/components/app/chat/id';
import { InitialChatProvider } from '@/contexts/initial-chat-context';
import { auth } from '@repo/auth/server';
import { createServerClient } from '@repo/orpc/server';
import { unstable_cache } from 'next/cache';

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

// Cache chat data with 60 second revalidation
const getCachedChatData = unstable_cache(
  async (chatId: string, clerkId: string) => {
    const client = createServerClient({ clerkId });
    const [chat, messages] = await Promise.all([
      client.chats.get({ id: chatId }),
      client.chats.messages({ chatId }),
    ]);
    return { chat, messages };
  },
  ['chat-data'],
  {
    revalidate: 60,
    tags: ['chat'],
  }
);

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;
  const { userId: clerkId } = await auth();

  let chat = null;
  let initialMessages: {
    id: string;
    role: string;
    content: string;
    createdAt: Date;
    experimental_toolCalls?: any;
    experimental_toolResults?: any;
  }[] = [];

  if (clerkId) {
    try {
      const cachedData = await getCachedChatData(id, clerkId);

      if (cachedData) {
        chat = cachedData.chat;
        const rawMessages = cachedData.messages;

        // Parse message content to ensure it's properly formatted
        initialMessages = rawMessages.map((msg: any) => {
          let parsedContent = msg.content;

          // If content is a JSON string representing an array, parse it
          if (typeof msg.content === 'string') {
            const trimmed = msg.content.trim();
            if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
              try {
                const parsed = JSON.parse(msg.content);

                // If it's an array of parts (AI SDK format)
                if (Array.isArray(parsed)) {
                  const textParts = parsed.filter(
                    (part: any) => part?.type === 'text'
                  );
                  if (textParts.length > 0) {
                    parsedContent = textParts
                      .map((part: any) => part.text || '')
                      .join('');
                  }
                }
                // If it's an object with parts property
                else if (parsed?.parts && Array.isArray(parsed.parts)) {
                  const textParts = parsed.parts.filter(
                    (part: any) => part?.type === 'text'
                  );
                  if (textParts.length > 0) {
                    parsedContent = textParts
                      .map((part: any) => part.text || '')
                      .join('');
                  }
                }
              } catch (_e) {
                // If parsing fails, use content as-is
              }
            }
          }

          return {
            ...msg,
            content: parsedContent,
          };
        });

        // Sync title from Mastra if it looks truncated or is a placeholder
        if (
          chat.title.length === 30 ||
          chat.title.endsWith('...') ||
          chat.title === 'New chat' ||
          chat.title === 'untitled'
        ) {
          const client = createServerClient({ clerkId });
          const syncedChat = await client.chats.syncTitle({ id });
          if (syncedChat) {
            chat = syncedChat;
          }
        }
      }
    } catch (_error) {}
  }

  return (
    <InitialChatProvider initialChat={chat || undefined}>
      <div className="min-h-screen bg-background">
        <Chat
          id={id}
          projectId={chat?.projectId ?? null}
          initialChat={chat || undefined}
          initialMessages={initialMessages}
        />
      </div>
    </InitialChatProvider>
  );
}
