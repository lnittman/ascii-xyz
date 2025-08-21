'use client';

import { memo, useMemo } from 'react';

import type { Message } from '@ai-sdk/ui-utils';

import { useOutputInterceptor } from '@/hooks/chat/use-output-interceptor';
import {
  extractTextFromUIMessage,
  normalizeUIMessage,
} from '@/utils/message-helpers';
import { UserMessage } from './components/UserMessage';
import { SystemMessage } from './components/system-message';

interface MessageItemProps {
  message: Message;
  isLastMessage?: boolean;
  isStreaming?: boolean;
  chatId?: string;
}

const MessageItemComponent = ({
  message,
  isLastMessage = false,
  isStreaming = false,
  chatId,
}: MessageItemProps) => {
  const isUserMessage = useMemo(() => message.role === 'user', [message.role]);
  const isAIMessage = useMemo(
    () => message.role === 'assistant' || message.role === 'system',
    [message.role]
  );

  // Normalize message and extract text content
  const normalizedMessage = useMemo(
    () => normalizeUIMessage(message),
    [message]
  );
  const messageContent = useMemo(
    () => extractTextFromUIMessage(normalizedMessage),
    [normalizedMessage]
  );

  // Extract tool calls from message parts
  const toolCalls = useMemo(() => {
    const messageWithParts = message as any;
    if (
      Array.isArray(messageWithParts.parts) &&
      messageWithParts.parts.length > 0
    ) {
      const toolInvocations = messageWithParts.parts.filter(
        (part: any) =>
          part.type === 'tool-invocation' &&
          (part.toolInvocation?.state === 'call' ||
            part.toolInvocation?.state === 'partial-call')
      );

      if (toolInvocations.length > 0) {
        return toolInvocations.map((part: any) => ({
          type: 'tool-call',
          toolCallId: part.toolInvocation.toolCallId,
          toolName: part.toolInvocation.toolName,
          args: part.toolInvocation.args,
        }));
      }
    }

    // Fallback to older formats or directly attached tool calls
    if (
      Array.isArray(messageWithParts.toolCalls) &&
      messageWithParts.toolCalls.length > 0
    ) {
      return messageWithParts.toolCalls;
    }

    return [];
  }, [message]);

  // Extract tool results from message parts
  const toolResults = useMemo(() => {
    const messageWithParts = message as any;
    if (
      Array.isArray(messageWithParts.parts) &&
      messageWithParts.parts.length > 0
    ) {
      const toolInvocations = messageWithParts.parts.filter(
        (part: any) =>
          part.type === 'tool-invocation' &&
          part.toolInvocation?.state === 'result'
      );

      if (toolInvocations.length > 0) {
        return toolInvocations.map((part: any) => ({
          type: 'tool-result',
          toolCallId: part.toolInvocation.toolCallId,
          toolName: part.toolInvocation.toolName,
          args: part.toolInvocation.args,
          result: part.toolInvocation.result,
        }));
      }
    }

    // Fallback to older formats or directly attached tool results
    if (
      Array.isArray(messageWithParts.toolResults) &&
      messageWithParts.toolResults.length > 0
    ) {
      return messageWithParts.toolResults;
    }

    return [];
  }, [message]);

  // Extract AI SDK parts for proper rendering
  const messageParts = useMemo(() => {
    const messageWithParts = message as any;
    return Array.isArray(messageWithParts.parts) ? messageWithParts.parts : [];
  }, [message]);

  // Extract attachments from the message
  const attachments = useMemo(() => {
    const messageWithAttachments = message as any;
    return messageWithAttachments.experimental_attachments || [];
  }, [message]);

  // Determine if this is a live streaming response
  const isLiveResponse = isAIMessage && isLastMessage && isStreaming;

  // Use the output interceptor to process content and extract outputs
  const cleanContent = useOutputInterceptor(
    messageContent,
    isStreaming && isLastMessage,
    message.id
  );

  // For AI messages, ALWAYS use clean content to ensure outputs never show
  const rawDisplayContent = isAIMessage ? cleanContent : messageContent;

  // Ensure displayContent is always a string to prevent [Object Object] display
  const displayContent =
    typeof rawDisplayContent === 'string'
      ? rawDisplayContent
      : typeof rawDisplayContent === 'object'
        ? JSON.stringify(rawDisplayContent)
        : String(rawDisplayContent ?? '');

  return (
    <div className="group relative flex items-start gap-2">
      {/* Message content */}
      <div className="flex-1 overflow-hidden">
        {isUserMessage && (
          <UserMessage content={displayContent} attachments={attachments} />
        )}

        {isAIMessage && (
          <SystemMessage
            content={displayContent}
            toolCalls={toolCalls}
            toolResults={toolResults}
            messageId={message.id}
            chatId={chatId}
            onDownload={() => {}}
            isLiveResponse={isLiveResponse}
            parts={messageParts}
          />
        )}
      </div>
    </div>
  );
};

// Export memoized component to prevent unnecessary re-renders
export const MessageItem = memo(MessageItemComponent);
