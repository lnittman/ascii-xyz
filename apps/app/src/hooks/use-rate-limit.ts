import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

interface RateLimitState {
  requests: number[];
  isLimited: boolean;
}

export function useRateLimit(config: RateLimitConfig) {
  const {
    maxRequests,
    windowMs,
    message = 'Please slow down. Try again in a moment.',
  } = config;

  const [state, setState] = useState<RateLimitState>({
    requests: [],
    isLimited: false,
  });

  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Filter out requests outside the current window
    const recentRequests = state.requests.filter((time) => time > windowStart);

    if (recentRequests.length >= maxRequests) {
      // Rate limit exceeded
      setState({ requests: recentRequests, isLimited: true });

      // Show toast message
      toast.error('Rate limit exceeded', {
        description: message,
      });

      // Clear rate limit after window expires
      const oldestRequest = recentRequests[0];
      const resetTime = oldestRequest + windowMs - now;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, isLimited: false }));
      }, resetTime);

      return false;
    }

    // Add new request and allow it
    setState({
      requests: [...recentRequests, now],
      isLimited: false,
    });

    return true;
  }, [state.requests, maxRequests, windowMs, message]);

  const reset = useCallback(() => {
    setState({ requests: [], isLimited: false });
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const getRemainingRequests = useCallback(() => {
    const now = Date.now();
    const windowStart = now - windowMs;
    const recentRequests = state.requests.filter((time) => time > windowStart);
    return Math.max(0, maxRequests - recentRequests.length);
  }, [state.requests, maxRequests, windowMs]);

  const getResetTime = useCallback(() => {
    if (state.requests.length === 0) {
      return null;
    }

    const now = Date.now();
    const windowStart = now - windowMs;
    const recentRequests = state.requests.filter((time) => time > windowStart);

    if (recentRequests.length === 0) {
      return null;
    }

    const oldestRequest = recentRequests[0];
    return new Date(oldestRequest + windowMs);
  }, [state.requests, windowMs]);

  return {
    checkRateLimit,
    isLimited: state.isLimited,
    remainingRequests: getRemainingRequests(),
    resetTime: getResetTime(),
    reset,
  };
}

// Preset configurations for different use cases
export const rateLimitPresets = {
  chat: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 20 messages per minute
    message: "You're sending messages too quickly. Please wait a moment.",
  },

  fastChat: {
    maxRequests: 5,
    windowMs: 10 * 1000, // 5 messages per 10 seconds (burst protection)
    message: 'Slow down! Please wait a few seconds between messages.',
  },

  fileUpload: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 10 uploads per minute
    message: 'Too many file uploads. Please wait before uploading more.',
  },

  apiCall: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 100 API calls per minute
    message: 'API rate limit reached. Please try again later.',
  },
};
