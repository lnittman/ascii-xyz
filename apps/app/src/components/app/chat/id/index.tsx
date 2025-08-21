'use client';

import type React from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';

// Removed @ai-sdk/react in favor of jotai-ai
import { useAtom, useSetAtom } from 'jotai';

import { log } from '@/lib/logger';
import { useUser } from '@repo/auth/client';
import { useToast } from '@repo/design/hooks/use-toast';

import { PromptBar } from '@/components/shared/prompt-bar';
import type { Attachment } from '@/components/shared/prompt-bar/components/attachment-row';
import { useAttachmentModals } from '@/hooks/attachment/use-attachment-modals';
import { useUpdateChatModel } from '@/hooks/chat/mutations';
import { useChatData, useChatMessages } from '@/hooks/chat/queries';
import { useChatOutputs } from '@/hooks/chat/use-chat-outputs';

import {
  initialPromptAtom,
  isMessageSubmittedAtom,
  promptFocusedAtom,
  promptSubmittingAtom,
} from '@/atoms/chat';
import {
  chatIsLoadingAtom,
  chatMessagesAtom,
  chatStopAtom,
  chatSubmitAtom,
  clearChatAtom,
  initializeChatAtom,
} from '@/atoms/chat-ai';
import { currentChatIdAtom } from '@/atoms/layout/output';
import { sidebarOpenAtom } from '@/atoms/layout/sidebar';
import { selectedModelIdAtom } from '@/atoms/models';
import { useSyncChatTitle } from '@/hooks/chat/mutations';
import type { Chat as ChatType } from '@repo/database/types';
import { useIsMobile } from '@repo/design/hooks/use-is-mobile';
import { useMediaQuery } from '@repo/design/hooks/use-media-query';
import { ChatHeader } from './components/chat-header';
import { MessagesContainer } from './components/messages-container';

interface ChatProps {
  id?: string;
  projectId?: string | null;
  // Shared view props
  chatId?: string;
  isSharedView?: boolean;
  initialChat?: ChatType;
  initialMessages?: any[];
  readOnly?: boolean;
}

const ChatComponent = ({
  id,
  projectId,
  chatId,
  isSharedView = false,
  initialChat,
  initialMessages: sharedInitialMessages,
  readOnly = false,
}: ChatProps) => {
  const { toast } = useToast();
  const { user } = useUser();

  // Use chatId for shared views, id for regular views
  const actualChatId = chatId || id;
  const isShared = isSharedView;

  // Early return if no chat ID is provided
  if (!actualChatId) {
    return <div>No chat ID provided</div>;
  }

  const [isOpen, setIsOpen] = useAtom(sidebarOpenAtom);
  const setCurrentChatId = useSetAtom(currentChatIdAtom);
  const [selectedModelId, setSelectedModelId] = useAtom(selectedModelIdAtom);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { isMobile } = useIsMobile();

  // Use SWR hooks with server-provided initial data for hydration
  const {
    chat: chatData,
    isLoading,
    mutate: mutateChat,
  } = useChatData(actualChatId, initialChat);
  const {
    messages: fetchedMessages,
    isLoading: isMessagesLoading,
    mutate: mutateMessages,
  } = useChatMessages(
    isShared ? null : actualChatId, // Don't fetch messages for shared views
    sharedInitialMessages
  );
  const { updateChatModel } = useUpdateChatModel();
  const { syncChatTitle } = useSyncChatTitle();

  // Debug logging for message loading
  useEffect(() => {
    if (fetchedMessages) {
      log.info('[Chat] Messages loaded from database:', {
        chatId: actualChatId,
        messageCount: fetchedMessages.length,
        firstMessage: fetchedMessages[0]
          ? {
              role: (fetchedMessages[0] as any).role,
              contentPreview:
                typeof (fetchedMessages[0] as any).content === 'string'
                  ? (fetchedMessages[0] as any).content.substring(0, 50)
                  : JSON.stringify(
                      (fetchedMessages[0] as any).content
                    ).substring(0, 50),
            }
          : null,
      });
    }
  }, [fetchedMessages, actualChatId]);

  // Load outputs for this chat
  const { outputs, isLoading: isOutputsLoading } = useChatOutputs(actualChatId);

  const [initialPrompt, setInitialPrompt] = useAtom(initialPromptAtom);
  const [, setIsMessageSubmitted] = useAtom(isMessageSubmittedAtom);
  const [isPromptSubmitting, setIsPromptSubmitting] =
    useAtom(promptSubmittingAtom);
  const [isPromptFocused, setIsPromptFocused] = useAtom(promptFocusedAtom);

  // Attachment modals hook
  const { previewAttachment } = useAttachmentModals();

  // Ref to track if we've processed the initial message
  const initialMessageProcessedRef = useRef(false);

  // Ref to track if we've synced the title from Mastra
  const titleSyncedRef = useRef(false);

  // Ref to track if we're updating the model to prevent loops
  const modelUpdateInProgressRef = useRef(false);

  // Ref for the messages container to use with custom scrollbar
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Use shared messages if in shared view, otherwise use fetched messages
  const messagesToUse = isShared
    ? sharedInitialMessages || []
    : fetchedMessages || [];

  // Memoize the useChat body to prevent re-initialization
  const _chatBody = useMemo(
    () => ({
      threadId: actualChatId,
      resourceId: projectId || user?.id, // user.id from Clerk is the Clerk ID
    }),
    [actualChatId, projectId, user?.id]
  );

  // Memoize the onFinish callback to prevent re-renders
  const onFinishCallback = useCallback(
    async (_message: any) => {
      // Mastra automatically persists messages through its memory system
      // No manual saving needed here
      setIsPromptSubmitting(false);

      // Single revalidation after a reasonable delay
      // This gives Mastra time to persist messages without overloading the server
      setTimeout(async () => {
        try {
          await mutateMessages();
          log.info('[Chat] Messages revalidated after AI response:', {
            chatId: actualChatId,
          });
        } catch (error) {
          log.error('[Chat] Failed to revalidate messages:', error);
        }
      }, 2000); // 2 second delay for Mastra persistence

      // Sync title from Mastra after the first AI response
      if (!titleSyncedRef.current && !isShared) {
        titleSyncedRef.current = true;

        // Add a small delay to ensure Mastra has generated the title
        setTimeout(async () => {
          try {
            const updatedChat = await syncChatTitle(actualChatId);
            if (
              updatedChat &&
              typeof updatedChat === 'object' &&
              'title' in updatedChat
            ) {
              // Invalidate the chat data to show the new title
              mutateChat({ success: true, data: updatedChat as ChatType });
              log.info('[Chat] Title synced from Mastra:', {
                chatId: actualChatId,
                newTitle: (updatedChat as any).title,
              });
            }
          } catch (error) {
            log.error('[Chat] Failed to sync title:', error);
          }
        }, 2000); // 2 second delay for Mastra to generate title
      }
    },
    [
      setIsPromptSubmitting,
      syncChatTitle,
      actualChatId,
      isShared,
      mutateChat,
      mutateMessages,
    ]
  );

  // Memoize the onError callback
  const onErrorCallback = useCallback(
    (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Chat Error',
        description:
          error.message || 'an unexpected error occurred with the AI service.',
        duration: 5000,
      });
    },
    [toast]
  );

  // Memoize the prepareRequestBody callback - only send latest message to Mastra
  const _prepareRequestBodyCallback = useCallback(
    (request: any) => {
      // Get only the latest message to send to Mastra
      // This prevents duplicate message persistence since Mastra handles history automatically
      const lastMessage =
        request.messages.length > 0 ? request.messages.at(-1) : null;

      return {
        // Send only the latest message instead of full history
        messages: lastMessage ? [lastMessage] : [],
        threadId: actualChatId,
        resourceId: chatData?.projectId || user?.id, // user.id from Clerk is the Clerk ID
        selectedModelId: selectedModelId,
      };
    },
    [actualChatId, chatData?.projectId, user?.id, selectedModelId]
  );

  // Initialize jotai-ai chat atoms
  const initializeChat = useSetAtom(initializeChatAtom);
  const [messages] = useAtom(chatMessagesAtom);
  const [isStreaming] = useAtom(chatIsLoadingAtom);
  const submitMessage = useSetAtom(chatSubmitAtom);
  const stopStreaming = useSetAtom(chatStopAtom);
  const clearChat = useSetAtom(clearChatAtom);

  // Initialize chat atoms when component mounts or chat changes
  useEffect(() => {
    initializeChat({
      chatId: actualChatId,
      initialMessages: messagesToUse,
      resourceId: projectId || user?.id,
      selectedModelId,
      onFinish: onFinishCallback,
      onError: onErrorCallback,
    });

    return () => {
      clearChat();
    };
  }, [
    actualChatId,
    projectId,
    user?.id,
    selectedModelId,
    onFinishCallback,
    onErrorCallback,
    initializeChat,
    clearChat,
  ]);

  // Memoize messages to prevent unnecessary re-renders
  const memoizedMessages = useMemo(() => messages, [messages]);
  const isLoadingData = isLoading || isMessagesLoading;

  // Set the current chat ID for output filtering
  useEffect(() => {
    setCurrentChatId(actualChatId);

    // Clear it when unmounting
    return () => {
      setCurrentChatId(null);
      // Note: We don't clear outputs here because they're filtered by chat ID
    };
  }, [actualChatId, setCurrentChatId]);

  // Load chat's active model when chat data is loaded
  useEffect(() => {
    if (chatData?.activeModel && !isLoading) {
      setSelectedModelId(chatData.activeModel);
    }
  }, [chatData?.activeModel, isLoading, setSelectedModelId]);

  // Update chat's active model when model selection changes
  useEffect(() => {
    if (!actualChatId || !selectedModelId || isLoading || isShared) {
      return;
    }

    // Only update if the model has changed from what's saved
    if (chatData?.activeModel === selectedModelId) {
      return;
    }

    // Prevent multiple updates while one is in progress
    if (modelUpdateInProgressRef.current) {
      return;
    }

    // Update the chat's active model using the mutation hook
    modelUpdateInProgressRef.current = true;
    updateChatModel(actualChatId, selectedModelId).finally(() => {
      modelUpdateInProgressRef.current = false;
    });
  }, [
    actualChatId,
    selectedModelId,
    chatData?.activeModel,
    isLoading,
    isShared,
    updateChatModel,
  ]);

  // Close sidebar on mobile when component mounts
  useEffect(() => {
    if (!isDesktop && isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 300); // Wait for page transition to complete

      return () => clearTimeout(timer);
    }
  }, []); // Empty dependency array - only run on mount

  // Auto-process the initial message when coming from new chat flow
  useEffect(() => {
    // Only process if we have an initialPrompt and haven't processed it yet
    if (
      initialPrompt &&
      !initialMessageProcessedRef.current &&
      !isLoading &&
      !isMessagesLoading
    ) {
      // Mark as processed to prevent duplicate processing
      initialMessageProcessedRef.current = true;

      log.info('[Chat] Processing initial prompt:', {
        chatId: actualChatId,
        promptLength: initialPrompt.length,
      });

      // Mastra handles message persistence automatically
      // Submit the message using jotai-ai
      submitMessage(initialPrompt);

      // Clear the initialPrompt
      setInitialPrompt('');
    }
  }, [
    initialPrompt,
    isLoading,
    isMessagesLoading,
    submitMessage,
    setInitialPrompt,
  ]); // Added back necessary deps

  // Memoize the submission handler
  const handleSubmit = useCallback(
    async (command: string, attachments?: Attachment[]) => {
      setIsMessageSubmitted(true);
      setIsPromptSubmitting(true);

      // Convert attachments to AI SDK format if provided
      let experimental_attachments: any[] | undefined;

      if (attachments && attachments.length > 0) {
        experimental_attachments = await Promise.all(
          attachments.map(async (attachment) => {
            // For files with metadata (from file upload)
            if (attachment.metadata?.file) {
              const file = attachment.metadata.file as File;

              // Convert file to data URL for AI SDK
              const dataUrl = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
              });

              return {
                name: attachment.name,
                contentType: file.type || attachment.metadata.mimeType,
                url: dataUrl,
              };
            }

            // For text attachments
            if (attachment.type === 'text' && attachment.content) {
              const blob = new Blob([attachment.content], {
                type: 'text/plain',
              });
              const dataUrl = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
              });

              return {
                name: attachment.name,
                contentType: 'text/plain',
                url: dataUrl,
              };
            }

            // For image attachments with URL (e.g., screenshots)
            if (attachment.url) {
              return {
                name: attachment.name,
                contentType: attachment.metadata?.mimeType || 'image/png',
                url: attachment.url,
              };
            }

            return null;
          })
        );

        // Filter out any null values
        experimental_attachments = experimental_attachments.filter(Boolean);
      }

      // TODO: Handle attachments with jotai-ai
      // For now, submit without attachments
      if (attachments && attachments.length > 0) {
        toast({
          variant: 'default',
          title: 'Attachments not yet supported',
          description:
            "We're working on attachment support. Your message will be sent without attachments.",
          duration: 3000,
        });
      }

      // Update input and submit using jotai-ai
      await submitMessage(command);

      // Remove excessive mutateMessages calls that were causing server overload
      // jotai-ai manages message state during streaming
    },
    [setIsMessageSubmitted, setIsPromptSubmitting, submitMessage, toast]
  );

  // Handle wheel events on the entire chat area
  const handleWheel = useCallback((e: React.WheelEvent) => {
    // Don't handle if the event came from sidebar
    const target = e.target as HTMLElement;
    if (target.closest('[data-sidebar]')) {
      return;
    }

    // Forward the scroll to messages container
    if (messagesContainerRef.current) {
      e.preventDefault();
      messagesContainerRef.current.scrollTop += e.deltaY;
    }
  }, []);

  return (
    <div
      className="flex h-screen w-full flex-col bg-background text-foreground"
      onWheel={handleWheel}
    >
      {/* Chat Header */}
      <div className="px-4">
        <ChatHeader
          chatId={actualChatId}
          chatTitle={chatData?.title}
          isProject={!!projectId}
        />
      </div>

      {/* Messages Container with proper spacing for prompt bar */}
      <div
        className={`flex-1 overflow-hidden px-4 ${isMobile ? 'pb-24' : 'pb-20'}`}
      >
        <MessagesContainer
          isLoading={isLoadingData}
          isStreaming={isStreaming}
          messages={memoizedMessages}
          containerRef={messagesContainerRef}
          chatId={actualChatId}
        />
      </div>

      {/* Fixed prompt bar for mobile, sticky for desktop */}
      {!readOnly && (
        <div
          className={`mx-auto w-full ${
            isMobile
              ? 'fixed right-0 bottom-0 left-0 z-40 border-border/50 border-t bg-background p-4 backdrop-blur-sm'
              : 'sticky bottom-0 z-40 max-w-2xl bg-background px-4 pb-4'
          }`}
        >
          <div className={isMobile ? 'mx-auto max-w-2xl' : ''}>
            <PromptBar
              onSubmit={handleSubmit}
              stop={stopStreaming}
              isSubmitting={isPromptSubmitting}
              isFocused={isPromptFocused}
              onFocusChange={setIsPromptFocused}
              onAttachmentPreview={previewAttachment}
              placeholder="what do you want to know?"
              selectedModelId={selectedModelId}
              onModelChange={setSelectedModelId}
              clearOnSubmit={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Export component without memo - root components don't benefit from memoization
export const Chat = ChatComponent;
