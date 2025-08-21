'use client';

import type React from 'react';
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { Message } from '@ai-sdk/ui-utils';

import { isMessageSubmittedAtom } from '@/atoms/chat';
import { ChatContentSkeleton } from '@/components/chat/message-skeleton';
import { ScrollFadeContainer } from '@/components/shared/scroll-fade-container';
import { useAtom } from 'jotai';
import { MessageItem } from './components/message-item';

interface MessagesContainerProps {
  messages: Message[];
  isLoading?: boolean;
  isStreaming?: boolean;
  onAnimationComplete?: () => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  chatId?: string;
}

// Memoize the MessageItem wrapper to prevent unnecessary re-renders
const MemoizedMessageItem = memo(MessageItem, (prevProps, nextProps) => {
  // Check if parts have changed for proper streaming updates
  const prevParts = (prevProps.message as any).parts || [];
  const nextParts = (nextProps.message as any).parts || [];

  // Deep comparison of parts for streaming updates
  const partsEqual =
    prevParts.length === nextParts.length &&
    prevParts.every((part: any, index: number) => {
      const nextPart = nextParts[index];
      if (part.type !== nextPart.type) {
        return false;
      }
      if (part.type === 'text') {
        return part.text === nextPart.text;
      }
      if (part.type === 'tool-invocation') {
        return (
          part.toolInvocation?.state === nextPart.toolInvocation?.state &&
          part.toolInvocation?.toolCallId ===
            nextPart.toolInvocation?.toolCallId
        );
      }
      return true;
    });

  // Only re-render if the message content, streaming state, or parts change
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.isLastMessage === nextProps.isLastMessage &&
    prevProps.isStreaming === nextProps.isStreaming &&
    partsEqual
  );
});

export const MessagesContainer = ({
  messages,
  isLoading = false,
  isStreaming = false,
  containerRef: externalContainerRef,
  chatId,
}: MessagesContainerProps) => {
  const [isMessageSubmitted, setIsMessageSubmitted] = useAtom(
    isMessageSubmittedAtom
  );
  const internalContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = externalContainerRef || internalContainerRef;
  const lastUserMessageRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const systemMessageRef = useRef<HTMLDivElement>(null);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [lastSubmittedMessageId, setLastSubmittedMessageId] = useState<
    string | null
  >(null);
  const [spacerHeight, setSpacerHeight] = useState(0);
  const [needsUserMessageScroll, setNeedsUserMessageScroll] = useState(false);

  // Find the last user message index
  const lastUserMessageIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        return i;
      }
    }
    return -1;
  }, [messages]);

  // Track if we have an AI response after the last user message
  const hasAIResponseAfterLastUser = useMemo(() => {
    if (
      lastUserMessageIndex === -1 ||
      lastUserMessageIndex === messages.length - 1
    ) {
      return false;
    }
    return messages[lastUserMessageIndex + 1]?.role === 'assistant';
  }, [messages, lastUserMessageIndex]);

  // Get the actual scrollable container
  const getScrollableContainer = useCallback(() => {
    // The scrollable container is the child div of containerRef with overflow-y-auto class
    if (!containerRef.current) {
      return null;
    }

    // If we already have a reference, return it
    if (scrollableContainerRef.current) {
      return scrollableContainerRef.current;
    }

    // Find the scrollable child (it has the scrollableClassName applied)
    const scrollable = containerRef.current.querySelector(
      '.overflow-y-auto'
    ) as HTMLDivElement;
    if (scrollable) {
      scrollableContainerRef.current = scrollable;
    }
    return scrollable;
  }, []);

  // Function to scroll so the last message appears at the top of the viewport
  const scrollToLastUserMessage = useCallback(() => {
    if (!lastUserMessageRef.current) {
      return;
    }

    const scrollContainer = getScrollableContainer();
    if (!scrollContainer) {
      return;
    }

    // Force layout calculation
    const _forceLayout = scrollContainer.scrollTop;

    // Get the offset of the message element relative to its offset parent
    const messageElement = lastUserMessageRef.current;
    const messageOffsetTop = messageElement.offsetTop;

    // Get the parent element that contains the messages (with pt-2 pb-2)
    const messagesWrapper = messageElement.closest('.pt-2.pb-2') as HTMLElement;
    const wrapperOffsetTop = messagesWrapper ? messagesWrapper.offsetTop : 0;

    // Calculate the absolute position of the message
    const absoluteMessageTop = wrapperOffsetTop + messageOffsetTop;

    // We want to scroll to show the message at the very top
    // Account for the pt-2 (8px) padding at the top
    const targetScrollTop = absoluteMessageTop - 8;

    // Perform the scroll
    scrollContainer.scrollTo({
      top: targetScrollTop,
      behavior: 'auto',
    });

    // Verify the scroll position after a short delay
    setTimeout(() => {
      const finalScrollTop = scrollContainer.scrollTop;

      // If we're not close enough, try one more time
      if (Math.abs(finalScrollTop - targetScrollTop) > 2) {
        scrollContainer.scrollTop = targetScrollTop;
      }
    }, 50);
  }, [getScrollableContainer]);

  // Calculate dynamic spacer height based on content
  useLayoutEffect(() => {
    if (!containerRef.current || !messagesContainerRef.current) {
      return;
    }

    const calculateSpacerHeight = () => {
      const scrollContainer = getScrollableContainer();
      if (!scrollContainer) {
        return;
      }

      const containerHeight = scrollContainer.clientHeight || 0;
      const messagesDiv = messagesContainerRef.current?.querySelector(
        'div'
      ) as HTMLElement;
      const messagesHeight = messagesDiv?.clientHeight || 0;

      if (messagesHeight < containerHeight) {
        // If content is shorter than container, make spacer fill the gap exactly
        setSpacerHeight(containerHeight - messagesHeight - 16); // 16px for padding
      } else {
        // If content is taller, use minimal spacer
        setSpacerHeight(16);
      }
    };

    // Calculate immediately
    calculateSpacerHeight();

    // And recalculate when streaming or size changes
    const resizeObserver = new ResizeObserver(() => {
      calculateSpacerHeight();

      // If we need to scroll to user message, do it after height recalculation
      if (needsUserMessageScroll && scrollableContainerRef.current) {
        scrollToLastUserMessage();
      }
    });

    resizeObserver.observe(messagesContainerRef.current);

    if (systemMessageRef.current) {
      resizeObserver.observe(systemMessageRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [
    messages,
    hasAIResponseAfterLastUser,
    isStreaming,
    needsUserMessageScroll,
    scrollToLastUserMessage,
  ]);

  // Handle message submission - scroll to position the last user message with proper padding
  useEffect(() => {
    if (!isMessageSubmitted || lastUserMessageIndex === -1) {
      return;
    }

    const lastUserMessage = messages[lastUserMessageIndex];
    if (!lastUserMessage) {
      return;
    }

    // Store the last submitted message ID to avoid processing the same submission twice
    setLastSubmittedMessageId(lastUserMessage.id);
    setIsMessageSubmitted(false);

    // Flag that we need to scroll to user message
    setNeedsUserMessageScroll(true);

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      scrollToLastUserMessage();

      // Double-check with another frame
      requestAnimationFrame(() => {
        scrollToLastUserMessage();

        // Final cleanup after a short delay
        setTimeout(() => {
          setNeedsUserMessageScroll(false);
        }, 100);
      });
    });
  }, [
    isMessageSubmitted,
    messages,
    lastUserMessageIndex,
    setIsMessageSubmitted,
    scrollToLastUserMessage,
  ]);

  // Handle scroll position tracking and constraints
  useEffect(() => {
    const scrollContainer = getScrollableContainer();
    if (!scrollContainer) {
      return;
    }

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

      // Calculate if content is short (not overflowing)
      const contentHeight = scrollHeight;
      const containerHeight = clientHeight;
      const isContentShort = contentHeight <= containerHeight;

      // If content is short and we have a last user message, apply scrolling constraint
      if (
        isContentShort &&
        lastUserMessageRef.current &&
        !needsUserMessageScroll
      ) {
        // Get the parent wrapper element
        const messagesWrapper = lastUserMessageRef.current.closest(
          '.pt-2.pb-2'
        ) as HTMLElement;
        const wrapperOffsetTop = messagesWrapper
          ? messagesWrapper.offsetTop
          : 0;
        const lastUserMessageTop =
          wrapperOffsetTop + lastUserMessageRef.current.offsetTop;

        // Calculate maximum allowed scroll position
        // This ensures the last user message stays at or below the top of the visible area
        const maxScroll = Math.max(0, lastUserMessageTop - 8); // Account for pt-2 padding

        // If current scroll position exceeds the limit, constrain it
        if (scrollTop > maxScroll) {
          scrollContainer.scrollTop = maxScroll;
          return;
        }
      }

      // Enable auto-scroll when near bottom
      setShouldAutoScroll(scrollHeight - scrollTop - clientHeight < 50);
    };

    scrollContainer.addEventListener('scroll', handleScroll, {
      passive: false,
    });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [needsUserMessageScroll, getScrollableContainer]);

  // Auto-scroll for normal state when messages change or streaming
  useEffect(() => {
    // Don't auto-scroll if the user has scrolled up
    if (!shouldAutoScroll) {
      return;
    }

    // Don't auto-scroll if we just submitted a message and are waiting for response
    if (
      lastSubmittedMessageId &&
      lastUserMessageIndex !== -1 &&
      messages[lastUserMessageIndex].id === lastSubmittedMessageId &&
      !hasAIResponseAfterLastUser
    ) {
      return;
    }

    // Scroll to bottom in all other cases
    const scrollContainer = getScrollableContainer();
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'auto',
      });
    }
  }, [
    messages.length,
    shouldAutoScroll,
    lastSubmittedMessageId,
    lastUserMessageIndex,
    hasAIResponseAfterLastUser,
    getScrollableContainer,
  ]);

  return (
    <div className="flex h-full flex-col items-center">
      <ScrollFadeContainer
        showTop={true}
        showBottom={true}
        fadeSize={32}
        className="h-full w-full max-w-2xl"
        scrollableClassName="w-full h-full overflow-y-auto hide-scrollbar"
        containerRef={containerRef}
      >
        {/* Main container with padding */}
        <div className="flex min-h-full flex-col" ref={messagesContainerRef}>
          {/* Message list with top padding */}
          <div className="px-6 pt-2 pb-2">
            {isLoading && messages.length === 0 ? (
              <ChatContentSkeleton />
            ) : (
              messages.map((message, index) => {
                const isLastUserMessage = index === lastUserMessageIndex;
                const isSystemAfterLastUser =
                  hasAIResponseAfterLastUser &&
                  index === lastUserMessageIndex + 1;

                return (
                  <div
                    key={`${message.id}-${index}`}
                    ref={
                      isLastUserMessage
                        ? lastUserMessageRef
                        : isSystemAfterLastUser
                          ? systemMessageRef
                          : undefined
                    }
                    className="mb-2" // Uniform spacing between messages
                    data-message-index={index}
                    data-message-role={message.role}
                  >
                    <MemoizedMessageItem
                      message={message}
                      isLastMessage={index === messages.length - 1}
                      isStreaming={isStreaming && index === messages.length - 1}
                      chatId={chatId}
                    />
                  </div>
                );
              })
            )}
          </div>

          {/* Dynamic spacer that ensures proper layout */}
          <div
            style={{ height: `${spacerHeight}px` }}
            className="flex-grow"
            aria-hidden="true"
          />
        </div>
      </ScrollFadeContainer>
    </div>
  );
};
