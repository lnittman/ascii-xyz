import { Empty } from '@phosphor-icons/react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'next-view-transitions';

import type { Chat, Project } from '@repo/database/types';

import { ChatMenu } from '@/components/shared/menu/chat-menu';
import { useProject } from '@/hooks/project/queries';

interface ChatListProps {
  projectId: string;
}

// Extended project type that includes chats relation
type ProjectWithChats = Project & {
  chats?: Chat[];
};

export function ChatList({ projectId }: ChatListProps) {
  const { data: project } = useProject(projectId);
  const projectWithChats = project as ProjectWithChats;

  return (
    <div className="mb-10">
      {/* Chat List */}
      <div className="space-y-1.5">
        {projectWithChats?.chats && projectWithChats.chats.length > 0 ? (
          projectWithChats.chats.map((chat: Chat) => (
            <Link
              key={chat.id}
              href={`/p/${projectId}/c/${chat.id}`}
              className="flex items-center justify-between rounded-none px-3 py-2 transition-colors hover:bg-accent/50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground text-sm">
                  {chat.title}
                </p>

                <p className="text-muted-foreground text-xs">
                  {chat.updatedAt
                    ? formatDistanceToNow(new Date(chat.updatedAt), {
                        addSuffix: true,
                      })
                    : 'just now'}
                </p>
              </div>

              <ChatMenu chatId={chat.id} />
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-none bg-muted/40">
              <Empty
                weight="duotone"
                className="h-6 w-6 text-muted-foreground"
              />
            </div>

            <h3 className="mb-2 font-medium text-base text-foreground">
              no chats yet
            </h3>

            <p className="max-w-xs text-muted-foreground text-sm">
              submit a prompt to start a new chat
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
