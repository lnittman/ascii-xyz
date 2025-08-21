'use client';

import type React from 'react';
import { useEffect, useRef } from 'react';

import { ScrollFadeContainer } from '@/components/shared/scroll-fade-container';
import { useUser } from '@clerk/nextjs';
import { ChatDots } from '@phosphor-icons/react';
import { formatDistanceToNow } from 'date-fns';

import { useChatData, useChatMessages } from '@/hooks/chat/queries';
import type { Message } from '@ai-sdk/ui-utils';
import Markdown from 'markdown-to-jsx';

interface ChatPreviewProps {
  chatId: string;
}

// Markdown component from SystemMessage - simplified version for preview
function MarkdownContent({ content }: { content: string }) {
  // Custom component overrides for markdown-to-jsx
  const markdownOptions = {
    overrides: {
      pre: {
        component: ({ children, ...props }: any) => (
          <pre
            {...props}
            className="my-2 overflow-x-auto bg-muted/40 p-2 text-xs"
          >
            {children}
          </pre>
        ),
      },
      code: {
        component: ({ children, ...props }: any) => (
          <code {...props} className="bg-muted/30 px-1 font-mono text-xs">
            {children}
          </code>
        ),
      },
      a: {
        component: ({ children, ...props }: any) => (
          <a
            {...props}
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
      },
      ul: {
        component: (props: any) => (
          <ul {...props} className="my-1.5 list-disc pl-5 text-xs" />
        ),
      },
      ol: {
        component: (props: any) => (
          <ol {...props} className="my-1.5 list-decimal pl-5 text-xs" />
        ),
      },
      p: {
        component: (props: any) => <p {...props} className="my-1.5 text-xs" />,
      },
      blockquote: {
        component: ({ children, ...props }: any) => (
          <blockquote
            {...props}
            className="my-1.5 border-border border-l-2 pl-3 text-muted-foreground text-xs italic"
          >
            {children}
          </blockquote>
        ),
      },
      h1: {
        component: (props: any) => (
          <h1 {...props} className="my-2 font-bold text-sm" />
        ),
      },
      h2: {
        component: (props: any) => (
          <h2 {...props} className="my-2 font-bold text-sm" />
        ),
      },
      h3: {
        component: (props: any) => (
          <h3 {...props} className="my-1.5 font-bold text-xs" />
        ),
      },
      h4: {
        component: (props: any) => (
          <h4 {...props} className="my-1 font-bold text-xs" />
        ),
      },
    },
  };

  return <Markdown options={markdownOptions}>{content}</Markdown>;
}

// Component to render output/artifact cards in preview
function OutputPreviewCard({ title, type }: { title: string; type: string }) {
  return (
    <div className="my-1.5 h-7 overflow-hidden border border-border/40">
      <div className="flex h-full items-center justify-between bg-purple-500/5 px-2 text-muted-foreground text-xs">
        <div className="flex items-center gap-1">
          <span className="font-medium text-purple-600">output:</span>
          <span className="max-w-[180px] truncate">{title}</span>
          <span className="text-muted-foreground/70">({type})</span>
        </div>
      </div>
    </div>
  );
}

// Function to process content and render with output cards
function ProcessedMarkdownContent({ content }: { content: string }) {
  // Check for OUTPUT markers or artifact tags
  const hasOutputMarkers =
    content.includes('OUTPUT_START') ||
    content.includes('<OUTPUT_START') ||
    content.includes('[OUTPUT_START') ||
    content.includes('<artifact') ||
    content.includes('</artifact>');

  if (!hasOutputMarkers) {
    return <MarkdownContent content={content} />;
  }

  // Find all output blocks and artifact tags
  const outputBlockRegex =
    /<OUTPUT_START(?:\s+id="([^"]+)")?\s*\/>[\s\S]*?<OUTPUT_END(?:\s+id="\1")?\s*\/>|\[OUTPUT_START(?:\s+id="([^"]+)")?\][\s\S]*?\[OUTPUT_END(?:\s+id="\2")?\]|OUTPUT_START[\s\S]*?OUTPUT_END/g;
  const artifactRegex =
    /<artifact[^>]*(?:\s+identifier="([^"]+)")?[^>]*(?:\s+type="([^"]+)")?[^>]*(?:\s+title="([^"]+)")?[^>]*>[\s\S]*?<\/artifact>/g;

  const outputBlocks: Array<{
    match: string;
    id: string | null;
    start: number;
    end: number;
    title?: string;
    type?: string;
  }> = [];
  let match;

  // Find OUTPUT blocks
  outputBlockRegex.lastIndex = 0;
  while ((match = outputBlockRegex.exec(content)) !== null) {
    let outputId: string | null = null;
    const xmlIdMatch = match[0].match(/<OUTPUT_START\s+id="([^"]+)"\s*\/>/);
    const bracketIdMatch = match[0].match(/\[OUTPUT_START\s+id="([^"]+)"\]/);

    if (xmlIdMatch) {
      outputId = xmlIdMatch[1];
    } else if (bracketIdMatch) {
      outputId = bracketIdMatch[1];
    }

    outputBlocks.push({
      match: match[0],
      id: outputId,
      start: match.index!,
      end: match.index! + match[0].length,
      title: outputId || 'Output',
      type: 'document',
    });
  }

  // Find artifact blocks
  artifactRegex.lastIndex = 0;
  while ((match = artifactRegex.exec(content)) !== null) {
    const identifierMatch = match[0].match(/identifier="([^"]+)"/);
    const typeMatch = match[0].match(/type="([^"]+)"/);
    const titleMatch = match[0].match(/title="([^"]+)"/);

    const identifier = identifierMatch ? identifierMatch[1] : null;
    const type = typeMatch ? typeMatch[1] : 'artifact';
    const title = titleMatch ? titleMatch[1] : identifier || 'Artifact';

    outputBlocks.push({
      match: match[0],
      id: identifier,
      start: match.index!,
      end: match.index! + match[0].length,
      title,
      type,
    });
  }

  // Sort blocks by position
  outputBlocks.sort((a, b) => a.start - b.start);

  const renderedParts: React.ReactNode[] = [];
  let currentPosition = 0;

  // Render content with output cards
  outputBlocks.forEach((block, blockIndex) => {
    // Render text before this block
    if (block.start > currentPosition) {
      const textBefore = content.substring(currentPosition, block.start);
      if (textBefore.trim()) {
        renderedParts.push(
          <MarkdownContent key={`text-${blockIndex}`} content={textBefore} />
        );
      }
    }

    // Render the output card
    renderedParts.push(
      <OutputPreviewCard
        key={`output-${blockIndex}`}
        title={block.title || 'Output'}
        type={block.type || 'document'}
      />
    );

    currentPosition = block.end;
  });

  // Render any remaining text after the last block
  if (currentPosition < content.length) {
    const textAfter = content.substring(currentPosition);
    if (textAfter.trim()) {
      renderedParts.push(
        <MarkdownContent key="text-final" content={textAfter} />
      );
    }
  }

  return <>{renderedParts}</>;
}

export function ChatPreview({ chatId }: ChatPreviewProps) {
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUser();

  // Calculate user initials for avatar
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((name) => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : user?.emailAddresses?.[0]?.emailAddress?.charAt(0).toUpperCase() || '?';

  // Don't try to fetch data for the 'new-chat' special ID
  if (chatId === 'new-chat') {
    return null;
  }

  const { chat: chatData, isLoading: isLoadingChat } = useChatData(chatId);
  const { messages, isLoading: isLoadingMessages } = useChatMessages(chatId);

  const isLoading = isLoadingChat || isLoadingMessages;

  // Scroll to the latest message when messages load or chatId changes
  useEffect(() => {
    if (messagesContainerRef.current && messages && messages.length > 0) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
        }
      });
    }
  }, [messages, chatId]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex h-full flex-col px-4 py-4">
        <div className="mb-2 h-6 w-3/4 animate-pulse rounded-none bg-accent/40" />
        <div className="mb-4 h-4 w-1/2 animate-pulse rounded-none bg-accent/30" />
        <div className="space-y-3">
          <div className="mb-2 h-16 w-5/6 animate-pulse rounded-none bg-accent/20" />
          <div className="mb-2 h-16 w-3/4 animate-pulse rounded-none bg-accent/30" />
          <div className="h-16 w-4/5 animate-pulse rounded-none bg-accent/20" />
        </div>
      </div>
    );
  }

  // Error state - No chat data
  if (!chatData) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
        <ChatDots weight="duotone" className="mb-4 h-10 w-10 opacity-50" />
        <p className="text-sm">Chat not found or still loading</p>
      </div>
    );
  }

  // Get all messages
  const previewMessages = messages || [];

  return (
    <div className="flex h-full flex-col overflow-hidden px-4 py-4">
      {/* Chat header */}
      <h3 className="mb-1 truncate font-medium text-foreground">
        {chatData.title}
      </h3>
      <p className="mb-4 text-muted-foreground text-xs">
        {chatData.updatedAt
          ? formatDistanceToNow(new Date(chatData.updatedAt), {
              addSuffix: true,
            })
          : 'just now'}
        {' · '}
        {previewMessages.length} message
        {previewMessages.length !== 1 ? 's' : ''}
      </p>

      {/* Messages preview - scrollable with fade effects */}
      <ScrollFadeContainer
        showTop
        showBottom
        fadeSize={24}
        fadeColor="var(--accent)"
        className="flex-1"
        scrollableClassName="h-full overflow-y-auto px-0.5"
        containerRef={messagesContainerRef}
      >
        <div className="space-y-3 pt-2 pb-2">
          {previewMessages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
              <ChatDots weight="duotone" className="mb-2 h-8 w-8 opacity-50" />
              <p className="text-xs">No messages yet</p>
            </div>
          ) : (
            previewMessages.map((message: Message, index: number) => (
              <div key={`${message.id || index}`}>
                {message.role === 'user' ? (
                  /* User Message */
                  <div className="relative w-full border border-border/40 bg-muted/40 p-2">
                    <div className="flex items-start">
                      {/* Avatar with initials inside message container */}
                      <div className="mr-2 flex h-5 w-5 flex-shrink-0 select-none items-center justify-center border border-border/40 bg-background font-medium text-foreground text-xs">
                        {initials}
                      </div>

                      {/* Message content */}
                      <div className="flex-1">
                        <p className="overflow-hidden whitespace-pre-wrap break-words text-foreground text-xs">
                          {typeof message.content === 'string'
                            ? message.content
                            : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* System/Assistant Message */
                  <div className="group relative w-full">
                    <div className="flex items-start">
                      {/* Message content */}
                      <div className="flex-1">
                        <div
                          className="overflow-hidden whitespace-pre-wrap text-foreground"
                          style={{ overflowWrap: 'break-word' }}
                        >
                          {typeof message.content === 'string' ? (
                            <ProcessedMarkdownContent
                              content={message.content}
                            />
                          ) : (
                            <p className="text-muted-foreground text-xs">
                              Content unavailable
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollFadeContainer>
    </div>
  );
}
