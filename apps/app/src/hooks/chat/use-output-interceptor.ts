import {
  chatOutputsAtom,
  currentChatIdAtom,
  outputPanelOpenAtom,
  selectedOutputIdAtom,
} from '@/atoms/layout/output';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { useCreateOutput } from './use-output-mutations';

interface OutputBlock {
  id: string;
  title: string;
  type: string;
  startMarker: string;
  endMarker: string;
  content: string;
  isComplete: boolean;
  startIndex: number;
  endIndex: number;
}

export function useOutputInterceptor(
  content: string,
  isStreaming: boolean,
  messageId: string
) {
  const setOutputPanelOpen = useSetAtom(outputPanelOpenAtom);
  const setSelectedOutputId = useSetAtom(selectedOutputIdAtom);
  const setChatOutputs = useSetAtom(chatOutputsAtom);
  const outputs = useAtomValue(chatOutputsAtom);
  const currentChatId = useAtomValue(currentChatIdAtom);

  // Use the proper mutation hook
  const { createOutput } = useCreateOutput();

  // Track processed outputs to avoid duplicates
  const processedOutputsRef = useRef<Map<string, boolean>>(new Map());
  const activeStreamingOutputRef = useRef<string | null>(null);

  useEffect(() => {
    if (!content || !currentChatId) {
      return;
    }

    // Parse all OUTPUT blocks in the content
    const outputBlocks = parseOutputBlocks(content, messageId);

    outputBlocks.forEach((block) => {
      const { id, title, type, content: blockContent, isComplete } = block;

      // Skip if we've already processed this output in this exact state
      const outputKey = `${id}-${isComplete}`;
      if (processedOutputsRef.current.get(outputKey)) {
        return;
      }

      // Find existing output in state
      const existingOutput = outputs.find((o) => o.id === id);

      if (existingOutput) {
        // Update existing output
        const contentChanged = existingOutput.content !== blockContent;
        const streamingStateChanged =
          existingOutput.isStreaming !== !isComplete;
        const titleChanged = existingOutput.title !== title;

        if (contentChanged || streamingStateChanged || titleChanged) {
          setChatOutputs((prev) =>
            prev.map((output) =>
              output.id === id
                ? {
                    ...output,
                    title,
                    content: blockContent,
                    isStreaming: !isComplete,
                    updatedAt: new Date(),
                  }
                : output
            )
          );
        }
      } else {
        // Double-check we haven't already started processing this ID
        if (activeStreamingOutputRef.current === id) {
          return;
        }

        // Create new output entry

        setChatOutputs((prev) => {
          // Final check to prevent race conditions
          if (prev.some((o) => o.id === id)) {
            return prev;
          }

          return [
            ...prev,
            {
              id,
              title,
              type,
              messageId,
              chatId: currentChatId,
              createdAt: new Date(),
              isPinned: false,
              content: blockContent,
              isStreaming: !isComplete,
              metadata: {},
            },
          ];
        });

        // Auto-open panel and select this output
        setSelectedOutputId(id);
        setOutputPanelOpen(true);
        activeStreamingOutputRef.current = id;
      }

      // Mark as processed
      processedOutputsRef.current.set(outputKey, true);

      // If complete, save to database
      if (isComplete) {
        if (activeStreamingOutputRef.current === id) {
          activeStreamingOutputRef.current = null;
        }

        // Save to database using the proper hook
        saveOutputToDatabase(
          id,
          title,
          type,
          blockContent,
          messageId,
          currentChatId,
          createOutput
        );
      }
    });
  }, [
    content,
    isStreaming,
    messageId,
    currentChatId,
    outputs,
    setChatOutputs,
    setSelectedOutputId,
    setOutputPanelOpen,
    createOutput,
  ]);

  // Clean up on unmount or when message changes
  useEffect(() => {
    // Clear processed outputs when message changes
    processedOutputsRef.current.clear();

    return () => {
      if (activeStreamingOutputRef.current) {
        // Mark any active streaming output as complete
        const outputId = activeStreamingOutputRef.current;
        setChatOutputs((prev) =>
          prev.map((output) =>
            output.id === outputId ? { ...output, isStreaming: false } : output
          )
        );
      }
    };
  }, [messageId, setChatOutputs]);

  // Return cleaned content (with OUTPUT blocks removed)
  return removeOutputBlocks(content);
}

/**
 * Simple hash function to generate deterministic IDs
 */
function hashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Parse OUTPUT blocks from content
 */
function parseOutputBlocks(content: string, messageId?: string): OutputBlock[] {
  const blocks: OutputBlock[] = [];

  // New pattern that captures type and title attributes (order can vary)
  // The pattern now ensures we start capturing content from the next line
  const xmlPattern =
    /<OUTPUT_START\s+([^>]+?)\/>[\r\n]*([\s\S]*?)(?:<OUTPUT_END\s*\/>|$)/g;

  // Legacy patterns for backward compatibility
  const legacyPatterns = [
    // Old XML format with just id
    /<OUTPUT_START\s+id="([^"]+)"\s*\/>([\s\S]*?)(?:<OUTPUT_END\s+id="\1"\s*\/>|$)/g,
    // Bracket format
    /\[OUTPUT_START\s+id="([^"]+)"\]([\s\S]*?)(?:\[OUTPUT_END\s+id="\1"\]|$)/g,
    // Simple format
    /OUTPUT_START([\s\S]*?)(?:OUTPUT_END|$)/g,
  ];

  // First try the new pattern
  let match;
  xmlPattern.lastIndex = 0;

  while ((match = xmlPattern.exec(content)) !== null) {
    const attributes = match[1];
    let blockContent = match[2] || '';

    // Check if there's content on the same line as OUTPUT_START
    const fullMatch = match[0];
    const tagEnd = fullMatch.indexOf('/>') + 2;
    const afterTag = fullMatch.substring(tagEnd);
    const firstNewline = afterTag.search(/[\r\n]/);

    if (firstNewline > 0 && afterTag.substring(0, firstNewline).trim()) {
      // There's content on the same line, skip it
      const lineContent = afterTag.substring(0, firstNewline);
      if (blockContent.startsWith(lineContent)) {
        blockContent = blockContent.substring(lineContent.length);
      }
    }

    // Remove any leading whitespace/newlines after the tag
    blockContent = blockContent.replace(/^[\s\n]+/, '').trimEnd();

    // Parse attributes
    let type = 'document';
    let title = 'Untitled Output';
    let id: string | null = null;

    // Extract type attribute
    const typeMatch = attributes.match(/type="([^"]+)"/);
    if (typeMatch) {
      type = typeMatch[1];
    }

    // Extract title attribute
    const titleMatch = attributes.match(/title="([^"]+)"/);
    if (titleMatch) {
      title = titleMatch[1];
    }

    // Extract id attribute if present
    const idMatch = attributes.match(/id="([^"]+)"/);
    if (idMatch) {
      id = idMatch[1];
    }

    // Create a deterministic ID if not provided
    if (!id) {
      // Use message ID and position to ensure uniqueness
      const idSource = `${messageId || 'unknown'}-${match.index}-${type}-${title}`;
      id = `output-${hashCode(idSource)}`;
    }

    const endMarkerFound =
      content.includes('<OUTPUT_END/>') || content.includes('<OUTPUT_END />');

    blocks.push({
      id,
      title,
      type,
      startMarker: match[0].substring(0, match[0].indexOf(blockContent)),
      endMarker: endMarkerFound ? '<OUTPUT_END/>' : '',
      content: blockContent,
      isComplete: endMarkerFound,
      startIndex: match.index!,
      endIndex: match.index! + match[0].length,
    });
  }

  // If no blocks found with new pattern, try legacy patterns
  if (blocks.length === 0) {
    legacyPatterns.forEach((pattern, patternIndex) => {
      pattern.lastIndex = 0;

      while ((match = pattern.exec(content)) !== null) {
        let id: string;
        let blockContent: string;
        let endMarkerFound: boolean;

        if (patternIndex === 0) {
          // Old XML format
          id = match[1];
          blockContent = match[2].trim();
          endMarkerFound = content.includes(`<OUTPUT_END id="${id}"/>`);
        } else if (patternIndex === 1) {
          // Bracket format
          id = match[1];
          blockContent = match[2].trim();
          endMarkerFound = content.includes(`[OUTPUT_END id="${id}"]`);
        } else {
          // Simple format - use deterministic ID based on position
          const idSource = `${match.index}-legacy-${patternIndex}`;
          id = `output-${hashCode(idSource)}`;
          blockContent = match[1].trim();
          endMarkerFound = content.includes('OUTPUT_END');
        }

        blocks.push({
          id,
          title: 'Generated Output', // Default title for legacy
          type: 'document', // Default type for legacy
          startMarker: match[0].substring(0, match[0].indexOf(blockContent)),
          endMarker: endMarkerFound
            ? patternIndex === 0
              ? `<OUTPUT_END id="${id}"/>`
              : patternIndex === 1
                ? `[OUTPUT_END id="${id}"]`
                : 'OUTPUT_END'
            : '',
          content: blockContent,
          isComplete: endMarkerFound,
          startIndex: match.index!,
          endIndex: match.index! + match[0].length,
        });
      }
    });
  }

  return blocks;
}

/**
 * Remove all OUTPUT blocks from content for clean chat display
 */
function removeOutputBlocks(content: string): string {
  let cleanContent = content;

  // Remove new format OUTPUT blocks (handle with or without trailing slash properly)
  cleanContent = cleanContent.replace(
    /<OUTPUT_START[^>]*\/>[\s\S]*?<OUTPUT_END\s*\/>/g,
    ''
  );

  // Remove legacy format OUTPUT blocks
  cleanContent = cleanContent.replace(
    /<OUTPUT_START\s+id="[^"]+"\s*\/>([\s\S]*?)<OUTPUT_END\s+id="[^"]+"\s*\/>/g,
    ''
  );
  cleanContent = cleanContent.replace(
    /\[OUTPUT_START\s+id="[^"]+"\]([\s\S]*?)\[OUTPUT_END\s+id="[^"]+"\]/g,
    ''
  );
  cleanContent = cleanContent.replace(/OUTPUT_START([\s\S]*?)OUTPUT_END/g, '');

  // Remove incomplete OUTPUT blocks (streaming)
  cleanContent = cleanContent.replace(/<OUTPUT_START[^>]*\/>[\s\S]*$/g, '');
  cleanContent = cleanContent.replace(
    /\[OUTPUT_START\s+id="[^"]+"\][\s\S]*$/g,
    ''
  );
  cleanContent = cleanContent.replace(/OUTPUT_START[\s\S]*$/g, '');

  // Remove any remaining markers
  cleanContent = cleanContent.replace(/<OUTPUT_START[^>]*\/?>/g, '');
  cleanContent = cleanContent.replace(/<OUTPUT_END[^>]*\/?>/g, '');
  cleanContent = cleanContent.replace(/\[OUTPUT_START[^\]]*\]/g, '');
  cleanContent = cleanContent.replace(/\[OUTPUT_END[^\]]*\]/g, '');
  cleanContent = cleanContent.replace(/OUTPUT_START/g, '');
  cleanContent = cleanContent.replace(/OUTPUT_END/g, '');

  // Clean up extra whitespace
  cleanContent = cleanContent.replace(/\n\s*\n\s*\n/g, '\n\n').trim();

  return cleanContent;
}

/**
 * Save output to database using the proper mutation hook
 */
async function saveOutputToDatabase(
  outputId: string,
  title: string,
  type: string,
  content: string,
  messageId: string,
  chatId: string,
  createOutput: (data: any) => Promise<any>
) {
  try {
    await createOutput({
      chatId,
      messageId,
      title,
      type,
      content,
      metadata: {
        outputId, // Store the original output ID for reference
      },
      isPinned: false,
    });
  } catch (_error) {}
}
