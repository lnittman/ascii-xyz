'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

import { useOutputInterceptor } from '@/hooks/chat/use-output-interceptor';
import { useModals } from '@/hooks/use-modals';
import { cn } from '@/lib/utils';
import { useAtomValue } from 'jotai';

import { chatOutputsAtom } from '@/atoms/layout/output';
import { StreamingIndicator } from '@/components/shared/streaming-indicator';
import { SmoothStreamingText } from '@/components/shared/streaming/smooth-streaming-text';
import { ToolCallStatus } from '@/components/shared/tool-call-progress';
import {
  ActionButtons,
  MarkdownContent,
  type ToolCall,
  ToolCard,
  type ToolResult,
} from './components';
import { ArtifactCard } from './components/ArtifactCard';
import { OutputToolCard } from './components/OutputToolCard';

export interface SystemMessageProps {
  content: string;
  isLiveResponse?: boolean; // Indicates if this is a live response that should show streaming animation
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  messageId?: string;
  chatId?: string;
  onDownload: (content: string, title: string) => void;
  // New prop for AI SDK parts
  parts?: any[];
}

// Define a consistent type for content segments
type ContentSegment = {
  type: string;
  content?: string;
  toolId?: string;
  position: number;
};

// Simple hash function for deterministic ID generation
function hashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

export function SystemMessage({
  content,
  toolCalls = [],
  toolResults = [],
  isLiveResponse = false,
  messageId = '',
  chatId = '',
  onDownload,
  parts = [],
}: SystemMessageProps) {
  const hasContent = !!content;
  const contentRef = useRef<HTMLDivElement>(null);
  const { openToolDetailModal } = useModals();

  // State for streaming completion
  const [isStreamingComplete, setIsStreamingComplete] = useState(false);
  const prevContentLengthRef = useRef(0);

  // Get existing outputs for this message from the atom
  const outputs = useAtomValue(chatOutputsAtom);
  const messageOutputs = outputs.filter((o: any) => o.messageId === messageId);

  // Check if we have AI SDK parts to render
  const hasAISDKParts = parts && parts.length > 0;

  // Use the output interceptor to get cleaned content (without OUTPUT markers)
  const rawCleanContent = useOutputInterceptor(
    content,
    isLiveResponse,
    messageId
  );
  // Ensure cleanContent is always a string to prevent .slice errors and [Object Object] display
  const cleanContent =
    typeof rawCleanContent === 'string'
      ? rawCleanContent
      : typeof rawCleanContent === 'object'
        ? JSON.stringify(rawCleanContent)
        : String(rawCleanContent ?? '');

  // Check for OUTPUT markers - need to check in parts if using AI SDK, otherwise in content
  let hasOutputMarkers = false;

  if (hasAISDKParts && parts.length > 0) {
    // Check in the original text from AI SDK parts
    hasOutputMarkers = parts.some(
      (part) =>
        part.type === 'text' &&
        part.text &&
        (part.text.includes('OUTPUT_START') ||
          part.text.includes('<OUTPUT_START') ||
          part.text.includes('[OUTPUT_START'))
    );
  } else {
    // Check in content directly
    hasOutputMarkers =
      (typeof content === 'string' &&
        content &&
        (content.includes('OUTPUT_START') ||
          content.includes('<OUTPUT_START') ||
          content.includes('[OUTPUT_START'))) ||
      false;
  }

  // Handle streaming completion detection
  useEffect(() => {
    if (!isLiveResponse) {
      setIsStreamingComplete(true);
      return;
    }

    // Calculate current content length
    let currentLength = 0;

    if (hasAISDKParts) {
      // Calculate from parts
      currentLength = parts
        .filter((part) => part.type === 'text')
        .reduce((total, part) => total + (part.text?.length || 0), 0);
    } else {
      currentLength = cleanContent?.length || 0;
    }

    // Mark as complete when content stops growing
    if (currentLength === prevContentLengthRef.current && currentLength > 0) {
      const timeoutId = setTimeout(() => {
        setIsStreamingComplete(true);
      }, 500);

      return () => clearTimeout(timeoutId);
    }

    prevContentLengthRef.current = currentLength;
  }, [cleanContent, isLiveResponse, hasAISDKParts, parts]);

  // Separate effect for handling streaming completion when we have output markers
  useEffect(() => {
    if (hasOutputMarkers && isLiveResponse) {
      // Check if streaming should be considered complete
      // This happens when we have both OUTPUT_START and OUTPUT_END, and content isn't growing
      const hasCompleteOutput =
        content.includes('OUTPUT_START') && content.includes('OUTPUT_END');

      if (hasCompleteOutput) {
        // Add a small delay to ensure all content has been processed
        const timer = setTimeout(() => {
          setIsStreamingComplete(true);
        }, 100);

        return () => clearTimeout(timer);
      }
      setIsStreamingComplete(false);
    }
  }, [content, hasOutputMarkers, isLiveResponse]);

  // Reset when switching messages
  useEffect(() => {
    if (!isLiveResponse) {
      prevContentLengthRef.current = 0;
    }
  }, [isLiveResponse]);

  // Open the tool detail modal when a tool card is clicked
  const handleToolClick = (
    toolName: string,
    args: Record<string, any>,
    result?: any
  ) => {
    openToolDetailModal(toolName, args, result);
  };

  // Get the visible content (use cleaned content)
  const visibleContent = hasOutputMarkers ? '' : cleanContent;

  // Process the message to identify tool call positions and content segments
  const processMessageContent = () => {
    // Early return for empty content
    if (!visibleContent) {
      return { segments: [], toolPositions: [] };
    }

    // Create a map of tool calls and results by ID for easy lookup
    const toolCallsMap = new Map<string, ToolCall>();
    const toolResultsMap = new Map<string, ToolResult>();

    toolCalls.forEach((tc) => toolCallsMap.set(tc.toolCallId, tc));
    toolResults.forEach((tr) => toolResultsMap.set(tr.toolCallId, tr));

    // For messages with output markers, use special rendering
    if (hasOutputMarkers) {
      return { specialRendering: true };
    }

    // For messages without tool calls, just return the content
    if (toolCalls.length === 0 && toolResults.length === 0) {
      return {
        segments: [
          { type: 'text', content: visibleContent, position: 0 },
        ] as ContentSegment[],
        toolPositions: [],
      };
    }

    // Otherwise, we need to analyze the content to find where tool calls should be positioned

    // Split content into lines for analysis
    const lines = visibleContent.split('\n');
    const segments: ContentSegment[] = [];
    const toolPositions: Array<{ toolId: string; position: number }> = [];

    // *** TOOL CALL POSITION DETECTION PATTERNS ***

    // Common phrases that indicate a tool call is about to happen
    const toolCallIndicators = [
      /I'll\s+(use|call|invoke|execute|run)\s+the\s+(\w+)\s+tool/i,
      /Let me\s+(use|call|invoke|execute|run)\s+the\s+(\w+)\s+tool/i,
      /I'm going to\s+(use|call|invoke|execute|run)\s+the\s+(\w+)\s+tool/i,
      /Using the\s+(\w+)\s+tool/i,
      /Let's\s+(use|call|invoke|execute|run)\s+the\s+(\w+)\s+tool/i,
      /I'll\s+(create|generate)\s+(?:a|an|the)\s+(\w+)/i,
      /Let me\s+(create|generate)\s+(?:a|an|the)\s+(\w+)/i,
      /I'm going to\s+(create|generate)\s+(?:a|an|the)\s+(\w+)/i,
      /Here's\s+(?:a|an|the)\s+(\w+)/i,
    ];

    // Phrases that indicate content is after a tool call result
    const _afterToolIndicators = [
      /Here's\s+(?:your|the)\s+(\w+)/i,
      /I've\s+(created|generated|produced)/i,
      /As you can see/i,
      /Above is/i,
      /As shown above/i,
      /Now you have/i,
      /This\s+(document|code|content|output)/i,
      /The\s+(document|code|content|output)\s+above/i,
    ];

    let currentPosition = 0;
    let lastToolPosition = -1;
    let lastToolEndLineIndex = -1;

    // First pass: Identify where tool calls should be inserted
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        continue;
      }

      // Check if this line indicates a tool call should appear next
      for (const pattern of toolCallIndicators) {
        const match = line.match(pattern);
        if (match) {
          // This is likely right before a tool call
          const toolName = match[2] || ''; // Extract potential tool name

          // Try to find matching tool call based on name or position
          const matchingToolCall = Array.from(toolCallsMap.values()).find(
            (tc) =>
              tc.toolName.toLowerCase().includes(toolName.toLowerCase()) ||
              tc.toolName.toLowerCase() === 'createoutput' ||
              tc.toolName.toLowerCase() === 'create-output'
          );

          if (matchingToolCall) {
            // Insert text content up to this point if it's not empty
            const contentUpToHere = lines.slice(0, i + 1).join('\n');

            if (contentUpToHere.trim()) {
              segments.push({
                type: 'text',
                content: contentUpToHere,
                position: currentPosition,
              });

              currentPosition += 1;
            }

            // Insert tool call position marker
            toolPositions.push({
              toolId: matchingToolCall.toolCallId,
              position: currentPosition,
            });

            // Remember where this tool was positioned
            lastToolPosition = currentPosition;
            lastToolEndLineIndex = i + 1; // Line after the tool indicator

            // Mark the tool as having been positioned
            toolCallsMap.delete(matchingToolCall.toolCallId);

            currentPosition += 1;
            break;
          }
        }
      }
    }

    // Second pass: Any content after the last tool should be positioned after the tool
    if (lastToolEndLineIndex >= 0 && lastToolEndLineIndex < lines.length) {
      const afterToolContent = lines
        .slice(lastToolEndLineIndex)
        .join('\n')
        .trim();

      if (afterToolContent) {
        // Always position content that appears after a tool at a position after the tool
        segments.push({
          type: 'text',
          content: afterToolContent,
          position: Math.max(lastToolPosition + 1, currentPosition),
        });

        currentPosition += 1;
      }
    } else if (toolPositions.length === 0) {
      // No tool positions found, treat all content as before tools
      segments.push({
        type: 'text',
        content: visibleContent,
        position: currentPosition,
      });
    }

    // For any remaining tools that weren't positioned by text analysis,
    // place them at the end in the order they appear in the toolCalls array
    const remainingTools = Array.from(toolCallsMap.values());
    if (remainingTools.length > 0) {
      remainingTools.forEach((tool) => {
        toolPositions.push({
          toolId: tool.toolCallId,
          position: currentPosition,
        });
        currentPosition += 1;
      });
    }

    return { segments, toolPositions };
  };

  // Function to render AI SDK parts (text and tool invocations)
  const renderAISDKParts = () => {
    // If we have OUTPUT markers, collect all text and render clean content
    // Following Claude's pattern - artifacts only show in output panel
    if (hasOutputMarkers) {
      // Collect all text from text parts and use cleanContent
      let fullText = '';
      parts.forEach((part) => {
        if (part.type === 'text' && typeof part.text === 'string') {
          fullText += part.text;
        }
      });

      // Use cleanContent to show text without OUTPUT markers
      return (
        <div className="text-foreground">
          <SmoothStreamingText
            content={cleanContent || fullText}
            isStreaming={isLiveResponse && !isStreamingComplete}
            speed={20}
          >
            {(text: string) => <MarkdownContent content={text} />}
          </SmoothStreamingText>
        </div>
      );
    }

    // Otherwise, render parts normally
    let lastTextPartIndex = -1;

    // Find the last text part index
    parts.forEach((part, index) => {
      if (
        part.type === 'text' &&
        typeof part.text === 'string' &&
        part.text.trim()
      ) {
        lastTextPartIndex = index;
      }
    });

    return parts.map((part, index) => {
      const key = `part-${index}`;

      switch (part.type) {
        case 'text': {
          // Handle text parts with streaming animation
          const textContent = part.text || '';

          // Don't render empty text parts
          if (typeof textContent !== 'string' || !textContent.trim()) {
            return null;
          }

          // Check if this is the last text part for cursor placement
          const isLastTextPart = index === lastTextPartIndex;

          // Use StreamingTextEffect for smoother animations
          if (isLiveResponse && !isStreamingComplete && isLastTextPart) {
            return (
              <div key={key} className="relative inline">
                <SmoothStreamingText
                  content={textContent}
                  isStreaming={true}
                  speed={20}
                  className="inline"
                >
                  {(text: string) => <MarkdownContent content={text} />}
                </SmoothStreamingText>
              </div>
            );
          }

          // For non-streaming or completed text, render normally
          return (
            <div key={key} className="relative inline">
              <MarkdownContent content={textContent} />
            </div>
          );
        }

        case 'reasoning':
          // Handle reasoning/thinking tokens - filter them out by default
          // These are internal model thoughts that shouldn't be shown to users
          // unless explicitly requested via a setting or flag
          return null;

        case 'tool-invocation': {
          const toolInvocation = part.toolInvocation;
          if (!toolInvocation) {
            return null;
          }

          switch (toolInvocation.state) {
            case 'partial-call':
              // Show enhanced loading state for partial tool calls
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="my-3"
                >
                  <ToolCallStatus
                    toolCall={{
                      type: 'tool-call',
                      toolCallId: toolInvocation.toolCallId,
                      toolName: toolInvocation.toolName,
                      args: toolInvocation.args,
                      status: 'pending',
                    }}
                  />
                  {toolInvocation.args &&
                    Object.keys(toolInvocation.args).length > 0 && (
                      <div className="mt-2 rounded-md border border-border/30 bg-muted/20 p-3">
                        <pre className="text-muted-foreground text-xs">
                          {JSON.stringify(toolInvocation.args, null, 2)}
                        </pre>
                      </div>
                    )}
                </motion.div>
              );

            case 'call':
              // Show tool call
              return (
                <motion.div
                  key={key}
                  initial={isLiveResponse ? { opacity: 0, y: 10 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="my-3"
                >
                  <ToolCard
                    toolCallId={toolInvocation.toolCallId}
                    toolName={toolInvocation.toolName}
                    args={toolInvocation.args}
                    onClick={handleToolClick}
                  />
                </motion.div>
              );

            case 'result':
              // Show tool result
              return (
                <motion.div
                  key={key}
                  initial={isLiveResponse ? { opacity: 0, scale: 0.95 } : false}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="my-3"
                >
                  {toolInvocation.toolName === 'createOutput' ||
                  toolInvocation.toolName === 'create-output' ? (
                    <OutputToolCard
                      toolCallId={toolInvocation.toolCallId}
                      result={toolInvocation.result}
                      messageId={messageId}
                    />
                  ) : (
                    <ToolCard
                      toolCallId={toolInvocation.toolCallId}
                      toolName={toolInvocation.toolName}
                      args={toolInvocation.args}
                      result={toolInvocation.result}
                      isResult={true}
                      onClick={handleToolClick}
                    />
                  )}
                </motion.div>
              );

            default:
              return null;
          }
        }

        case 'step-start':
        case 'step-finish':
          // Handle step-related parts (used for multi-step tool calls)
          // For now, we'll just ignore these as they don't need visual representation
          return null;

        default: {
          // Log unknown part types in development only
          if (process.env.NODE_ENV === 'development') {
          }
          return null;
        }
      }
    });
  };

  // Render the message content with properly interleaved tool calls
  const renderMessageContent = () => {
    // If we have AI SDK parts, use them for rendering
    if (hasAISDKParts) {
      return renderAISDKParts();
    }

    // For output markers, render clean content without inline artifacts
    // Following Claude's pattern - artifacts only show in output panel
    if (hasOutputMarkers) {
      return (
        <div className={cn('text-foreground transition-opacity duration-200')}>
          <SmoothStreamingText
            content={cleanContent}
            isStreaming={isLiveResponse && !isStreamingComplete}
            speed={20}
          >
            {(text: string) => <MarkdownContent content={text} />}
          </SmoothStreamingText>
        </div>
      );
    }

    // Process the message content to identify segments and tool positions
    const {
      segments = [],
      toolPositions = [],
      specialRendering,
    } = processMessageContent();

    // If special rendering is needed, also use clean content
    if (specialRendering) {
      return (
        <div className="text-foreground">
          <SmoothStreamingText
            content={cleanContent}
            isStreaming={isLiveResponse && !isStreamingComplete}
            speed={20}
            renderMarkdown={(text) => <MarkdownContent content={text} />}
            showCursor={false}
            gradientFade={true}
          />
        </div>
      );
    }

    // Track which tool results we've rendered
    const renderedToolResults = new Set<string>();

    // If no segments or tool positions, render the content with streaming
    if (segments.length === 0 && toolPositions.length === 0) {
      if (!visibleContent) {
        return null;
      }

      return (
        <SmoothStreamingText
          content={cleanContent}
          isStreaming={isLiveResponse && !isStreamingComplete}
          speed={20}
          renderMarkdown={(text) => <MarkdownContent content={text} />}
          showCursor={false}
          gradientFade={true}
        />
      );
    }

    // Combine segments and tool positions, then sort by position
    const allElements: ContentSegment[] = [
      ...segments,
      ...toolPositions.map((tp) => ({
        type: 'tool',
        toolId: tp.toolId,
        position: tp.position,
      })),
    ].sort((a, b) => a.position - b.position);

    // Helper to check if an element should come after all tools in the UI
    const isAfterToolContent = (element: ContentSegment, index: number) => {
      if (element.type !== 'text') {
        return false;
      }

      // Look at all elements before this one
      const previousElements = allElements.slice(0, index);

      // If there's a tool before this text, consider it "after tool" content
      return previousElements.some((prev) => prev.type === 'tool');
    };

    // Render all elements in the correct order
    const renderedElements = allElements.map((element, index) => {
      if (element.type === 'text' && element.content) {
        // Check if this text should render after tools in the UI
        const isAfterTool = isAfterToolContent(element, index);

        // Determine if this text segment should stream
        const shouldStream =
          isLiveResponse && !isStreamingComplete && !isAfterTool;

        return (
          <motion.div
            key={`text-${index}`}
            className="mb-2"
            initial={
              isLiveResponse && isAfterTool ? { opacity: 0, y: 10 } : false
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {shouldStream ? (
              <SmoothStreamingText
                content={element.content}
                isStreaming={true}
                speed={20}
                renderMarkdown={(text) => <MarkdownContent content={text} />}
                showCursor={false}
                gradientFade={true}
              />
            ) : (
              <MarkdownContent content={element.content} />
            )}
          </motion.div>
        );
      }
      if (element.type === 'tool' && element.toolId) {
        // Find the tool call and its result
        const toolCall = toolCalls.find(
          (tc) => tc.toolCallId === element.toolId
        );
        const toolResult = toolResults.find(
          (tr) => tr.toolCallId === element.toolId
        );

        if (toolResult) {
          renderedToolResults.add(toolResult.toolCallId);
        }

        if (!toolCall) {
          return null;
        }

        return (
          <motion.div
            key={`tool-${element.toolId}`}
            initial={isLiveResponse ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="my-3"
          >
            <ToolCard
              toolCallId={toolCall.toolCallId}
              toolName={toolCall.toolName}
              args={toolCall.args}
              onClick={handleToolClick}
            />

            {toolResult && (
              <motion.div
                initial={isLiveResponse ? false : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="mt-2"
              >
                {toolResult.toolName === 'createOutput' ||
                toolResult.toolName === 'create-output' ? (
                  <OutputToolCard
                    toolCallId={toolResult.toolCallId}
                    result={toolResult.result}
                    messageId={messageId}
                  />
                ) : (
                  <ToolCard
                    toolCallId={toolResult.toolCallId}
                    toolName={toolResult.toolName}
                    args={toolResult.args}
                    result={toolResult.result}
                    isResult={true}
                    onClick={handleToolClick}
                  />
                )}
              </motion.div>
            )}
          </motion.div>
        );
      }

      return null;
    });

    // Now handle any orphaned tool results that weren't associated with a tool call
    // This is especially important for createOutput tool calls
    const orphanedResults = toolResults.filter(
      (tr) => !renderedToolResults.has(tr.toolCallId)
    );

    // Position any orphaned results at the end
    const orphanedElements = orphanedResults.map((result, _index) => (
      <motion.div
        key={`orphaned-result-${result.toolCallId}`}
        initial={isLiveResponse ? false : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="my-3"
      >
        {result.toolName === 'createOutput' ||
        result.toolName === 'create-output' ? (
          <OutputToolCard
            toolCallId={result.toolCallId}
            result={result.result}
            messageId={messageId}
          />
        ) : (
          <ToolCard
            toolCallId={result.toolCallId}
            toolName={result.toolName}
            args={result.args}
            result={result.result}
            isResult={true}
            onClick={handleToolClick}
          />
        )}
      </motion.div>
    ));

    return (
      <>
        {renderedElements}
        {orphanedElements}
      </>
    );
  };

  // Function to render content with inline output cards
  const _renderContentWithOutputs = (originalContentWithMarkers: string) => {
    // Find all output blocks in the content - updated to handle new format
    // Note: Non-greedy matching ([\s\S]*?) to avoid capturing multiple blocks as one
    const outputBlockRegex =
      /<OUTPUT_START[^>]*\/>[\s\S]*?(?:<OUTPUT_END[^>]*\/>|$)/g;

    const outputBlocks: Array<{
      match: string;
      id: string | null;
      type: string;
      title: string;
      start: number;
      end: number;
    }> = [];
    let match;

    // Reset regex state
    outputBlockRegex.lastIndex = 0;

    while (
      (match = outputBlockRegex.exec(originalContentWithMarkers)) !== null
    ) {
      let outputId: string | null = null;
      let type = 'document';
      let title = 'Untitled Output';

      // Extract attributes from OUTPUT_START tag
      const startTagMatch = match[0].match(/<OUTPUT_START([^>]*?)\/>/);
      if (startTagMatch) {
        const attributes = startTagMatch[1];

        // Extract type
        const typeMatch = attributes.match(/type="([^"]+)"/);
        if (typeMatch) {
          type = typeMatch[1];
        }

        // Extract title
        const titleMatch = attributes.match(/title="([^"]+)"/);
        if (titleMatch) {
          title = titleMatch[1];
        }

        // Extract id if present
        const idMatch = attributes.match(/id="([^"]+)"/);
        if (idMatch) {
          outputId = idMatch[1];
        } else {
          // Generate ID based on type and title for consistency
          const idSource = `${messageId || 'unknown'}-${match.index}-${type}-${title}`;
          outputId = `output-${hashCode(idSource)}`;
        }
      }

      outputBlocks.push({
        match: match[0],
        id: outputId,
        type,
        title,
        start: match.index!,
        end: match.index! + match[0].length,
      });
    }

    const renderedParts: React.ReactNode[] = [];
    const _currentPosition = 0;

    // Calculate total text length (excluding output blocks) for streaming
    let totalTextLength = 0;
    let lastTextEnd = 0;

    outputBlocks.forEach((block) => {
      totalTextLength += block.start - lastTextEnd;
      lastTextEnd = block.end;
    });
    totalTextLength += originalContentWithMarkers.length - lastTextEnd;

    // For streaming, determine how much text should be visible
    let visibleTextLength = 0;
    if (isLiveResponse && !isStreamingComplete && cleanContent) {
      visibleTextLength = Math.min(cleanContent.length, totalTextLength);
    } else {
      visibleTextLength = totalTextLength;
    }

    let textPositionCounter = 0;

    // Render content before first output block
    if (outputBlocks.length > 0 && outputBlocks[0].start > 0) {
      const textBefore = originalContentWithMarkers.substring(
        0,
        outputBlocks[0].start
      );
      if (textBefore.trim()) {
        const textLength = textBefore.length;
        let visibleText = textBefore;

        if (isLiveResponse && !isStreamingComplete) {
          if (visibleTextLength <= textPositionCounter) {
            visibleText = '';
          } else if (visibleTextLength < textPositionCounter + textLength) {
            const visibleChars = visibleTextLength - textPositionCounter;
            visibleText = textBefore.substring(0, Math.max(0, visibleChars));
          }
        }

        if (visibleText) {
          renderedParts.push(
            <div key="text-before" className="relative">
              <SmoothStreamingText
                content={visibleText}
                isStreaming={isLiveResponse && !isStreamingComplete}
                speed={20}
                renderMarkdown={(text) => <MarkdownContent content={text} />}
                showCursor={false} // Will show cursor on last text block
                gradientFade={true}
              />
            </div>
          );
        }

        textPositionCounter += textLength;
      }
    }

    // Render output blocks and text between them
    outputBlocks.forEach((block, blockIndex) => {
      // Find the output info from our tracked outputs
      const outputInfo = messageOutputs.find(
        (output: any) => output.id === block.id
      );

      // Check if this block is still streaming (no end marker yet)
      const isStillStreaming =
        blockIndex === outputBlocks.length - 1 &&
        !block.match.includes('OUTPUT_END') &&
        isLiveResponse;

      // Always render the artifact card, using the parsed attributes if outputInfo isn't available yet
      renderedParts.push(
        <ArtifactCard
          key={`artifact-${block.id}-${blockIndex}`}
          outputId={block.id || ''}
          title={outputInfo?.title || block.title}
          type={outputInfo?.type || block.type}
          isStreaming={isStillStreaming}
        />
      );

      // Render text after this output block (if any)
      const nextBlockStart =
        blockIndex < outputBlocks.length - 1
          ? outputBlocks[blockIndex + 1].start
          : originalContentWithMarkers.length;
      const textAfter = originalContentWithMarkers.substring(
        block.end,
        nextBlockStart
      );

      if (textAfter.trim()) {
        const textLength = textAfter.length;
        let visibleText = textAfter;

        if (isLiveResponse && !isStreamingComplete) {
          if (visibleTextLength <= textPositionCounter) {
            visibleText = '';
          } else if (visibleTextLength < textPositionCounter + textLength) {
            const visibleChars = visibleTextLength - textPositionCounter;
            visibleText = textAfter.substring(0, Math.max(0, visibleChars));
          }
        }

        if (visibleText) {
          const _isLastBlock =
            blockIndex === outputBlocks.length - 1 &&
            nextBlockStart === originalContentWithMarkers.length;

          renderedParts.push(
            <div key={`text-after-${blockIndex}`} className="relative">
              <SmoothStreamingText
                content={visibleText}
                isStreaming={isLiveResponse && !isStreamingComplete}
                speed={20}
                renderMarkdown={(text) => <MarkdownContent content={text} />}
                showCursor={false}
                gradientFade={true}
              />
            </div>
          );
        }

        textPositionCounter += textLength;
      }
    });

    // If no output blocks found, render all content as text with streaming
    if (outputBlocks.length === 0 && originalContentWithMarkers.trim()) {
      renderedParts.push(
        <div key="all-text">
          <SmoothStreamingText
            content={originalContentWithMarkers}
            isStreaming={isLiveResponse && !isStreamingComplete}
            speed={20}
            renderMarkdown={(text) => <MarkdownContent content={text} />}
            showCursor={false}
            gradientFade={true}
          />
        </div>
      );
    }

    // Don't render empty fragments
    if (renderedParts.length === 0) {
      return null;
    }

    return <>{renderedParts}</>;
  };

  return (
    <motion.div
      className="group"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Message container with full width */}
      <div className="relative w-full">
        {/* Use flex with align-start to keep avatar at the top */}
        <div className="flex items-start">
          {/* Message content - full width */}
          <div className="flex-1 text-sm">
            <div
              ref={contentRef}
              className="relative overflow-hidden whitespace-pre-wrap text-foreground"
              style={{ overflowWrap: 'break-word' }}
            >
              {/* Content rendering */}
              <div className="relative">
                {renderMessageContent()}

                {/* Show streaming indicator when AI is thinking */}
                {isLiveResponse && !isStreamingComplete && (
                  <div className="mt-2">
                    <StreamingIndicator isStreaming={true} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons with fade-in */}
      <AnimatePresence>
        {hasContent && (isStreamingComplete || !isLiveResponse) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="flex items-center"
          >
            <ActionButtons
              content={content}
              chatId={chatId}
              messageId={messageId}
              onDownload={onDownload}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
