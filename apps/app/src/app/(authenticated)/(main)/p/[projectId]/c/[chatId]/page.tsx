import { Chat } from '@/components/app/chat/id';
import { InitialChatProvider } from '@/contexts/initial-chat-context';
import { auth } from '@repo/auth/server';
import { chatService } from '@repo/services/chat';
import { userService } from '@repo/services/user';

export default async function ProjectChatPage({
  params,
}: { params: Promise<{ projectId: string; chatId: string }> }) {
  const { chatId, projectId } = await params;
  const { userId: clerkId } = await auth();

  let chat = null;
  let initialMessages: any[] = [];

  if (clerkId) {
    try {
      const user = await userService.getUserByClerkId(clerkId);
      const fetchedChat = await chatService.getById(chatId);

      if (fetchedChat.userId === user.id) {
        chat = fetchedChat;
        const rawMessages = await chatService.getChatMessages(chatId);

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
          const syncedChat = await chatService.syncTitleFromMastra(
            chatId,
            user.id
          );
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
          id={chatId}
          projectId={projectId}
          initialChat={chat || undefined}
          initialMessages={initialMessages}
        />
      </div>
    </InitialChatProvider>
  );
}
