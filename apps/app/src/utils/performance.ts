import { log } from '@/lib/logger';

export interface StreamingMetrics {
  chatId: string;
  startTime: number;
  firstTokenTime: number | null;
  lastTokenTime: number | null;
  tokenCount: number;
  chunkCount: number;
  totalTime: number;
  tokensPerSecond: number;
  averageChunkSize: number;
}

export interface PerformanceTracker {
  onFirstToken: () => void;
  onToken: (tokenLength?: number) => void;
  onChunk: (chunkSize: number) => void;
  onComplete: () => StreamingMetrics;
  onError: (error: Error) => void;
  getMetrics: () => Partial<StreamingMetrics>;
}

/**
 * Track streaming performance metrics for chat responses
 */
export function trackStreamingPerformance(chatId: string): PerformanceTracker {
  const startTime = performance.now();
  let firstTokenTime: number | null = null;
  let lastTokenTime: number | null = null;
  let tokenCount = 0;
  let chunkCount = 0;
  let totalChunkSize = 0;

  return {
    onFirstToken: () => {
      if (firstTokenTime === null) {
        firstTokenTime = performance.now() - startTime;

        // Log time to first token for performance monitoring
        log.info('Streaming: First token received', {
          chatId,
          timeToFirstToken: firstTokenTime,
          timestamp: new Date().toISOString(),
        });
      }
    },

    onToken: (tokenLength = 1) => {
      tokenCount += tokenLength;
      lastTokenTime = performance.now() - startTime;
    },

    onChunk: (chunkSize: number) => {
      chunkCount++;
      totalChunkSize += chunkSize;
    },

    onComplete: () => {
      const totalTime = performance.now() - startTime;
      const tokensPerSecond = tokenCount / (totalTime / 1000);
      const averageChunkSize = chunkCount > 0 ? totalChunkSize / chunkCount : 0;

      const metrics: StreamingMetrics = {
        chatId,
        startTime,
        firstTokenTime,
        lastTokenTime,
        tokenCount,
        chunkCount,
        totalTime,
        tokensPerSecond,
        averageChunkSize,
      };

      // Log comprehensive streaming metrics
      log.info('Streaming: Response complete', {
        ...metrics,
        timestamp: new Date().toISOString(),
        performance: {
          excellent: tokensPerSecond > 20,
          good: tokensPerSecond > 10,
          needsImprovement: tokensPerSecond < 5,
        },
      });

      return metrics;
    },

    onError: (error: Error) => {
      const totalTime = performance.now() - startTime;

      log.error('Streaming: Error occurred', {
        chatId,
        error: error.message,
        stack: error.stack,
        totalTime,
        tokenCount,
        chunkCount,
        firstTokenTime,
        timestamp: new Date().toISOString(),
      });
    },

    getMetrics: () => {
      const currentTime = performance.now() - startTime;
      return {
        chatId,
        startTime,
        firstTokenTime,
        lastTokenTime,
        tokenCount,
        chunkCount,
        totalTime: currentTime,
        tokensPerSecond: tokenCount / (currentTime / 1000),
        averageChunkSize: chunkCount > 0 ? totalChunkSize / chunkCount : 0,
      };
    },
  };
}

/**
 * Hook for tracking streaming performance in React components
 */
export function useStreamingPerformance(chatId: string) {
  const trackerRef = React.useRef<PerformanceTracker | null>(null);

  React.useEffect(() => {
    trackerRef.current = trackStreamingPerformance(chatId);

    return () => {
      // Clean up on unmount
      trackerRef.current = null;
    };
  }, [chatId]);

  return trackerRef.current;
}

/**
 * Performance monitoring for tool calls
 */
export function trackToolCallPerformance(toolName: string, chatId: string) {
  const startTime = performance.now();

  return {
    onComplete: (result?: any) => {
      const duration = performance.now() - startTime;

      log.info('Tool call completed', {
        toolName,
        chatId,
        duration,
        resultSize: result ? JSON.stringify(result).length : 0,
        timestamp: new Date().toISOString(),
      });

      return duration;
    },

    onError: (error: Error) => {
      const duration = performance.now() - startTime;

      log.error('Tool call failed', {
        toolName,
        chatId,
        duration,
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      return duration;
    },
  };
}

/**
 * Monitor overall chat session performance
 */
export function trackChatSessionPerformance(chatId: string) {
  const sessionStart = performance.now();
  let messageCount = 0;
  let totalTokens = 0;
  let totalResponseTime = 0;

  return {
    onMessageStart: () => {
      messageCount++;
      return performance.now();
    },

    onMessageComplete: (messageStartTime: number, tokens: number) => {
      const responseTime = performance.now() - messageStartTime;
      totalTokens += tokens;
      totalResponseTime += responseTime;

      const averageResponseTime = totalResponseTime / messageCount;
      const averageTokensPerMessage = totalTokens / messageCount;

      log.info('Chat session metrics', {
        chatId,
        messageCount,
        totalTokens,
        averageResponseTime,
        averageTokensPerMessage,
        sessionDuration: performance.now() - sessionStart,
        timestamp: new Date().toISOString(),
      });
    },

    getSessionMetrics: () => ({
      chatId,
      messageCount,
      totalTokens,
      sessionDuration: performance.now() - sessionStart,
      averageResponseTime:
        messageCount > 0 ? totalResponseTime / messageCount : 0,
      averageTokensPerMessage:
        messageCount > 0 ? totalTokens / messageCount : 0,
    }),
  };
}

// React import for the hook
import React from 'react';
