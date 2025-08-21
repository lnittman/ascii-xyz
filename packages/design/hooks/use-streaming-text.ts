"use client";

import { useEffect, useState, useRef, useCallback } from "react";

export interface UseStreamingTextOptions {
  text: string;
  isStreaming?: boolean;
  speed?: number; // milliseconds per character
  onComplete?: () => void;
}

export function useStreamingText({
  text,
  isStreaming = true,
  speed = 30, // 30ms per character for smooth reveal
  onComplete,
}: UseStreamingTextOptions) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  // Refs to track the latest values
  const textRef = useRef(text);
  const onCompleteRef = useRef(onComplete);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update refs
  textRef.current = text;
  onCompleteRef.current = onComplete;
  
  // Handle text changes
  useEffect(() => {
    if (!isStreaming) {
      // If not streaming, show all text immediately
      setDisplayedText(text);
      setCurrentIndex(text.length);
      setIsComplete(true);
      return;
    }
    
    // If text changed significantly (not just appending), reset
    if (!text.startsWith(displayedText)) {
      setDisplayedText("");
      setCurrentIndex(0);
      setIsComplete(false);
    }
  }, [text, isStreaming]);
  
  // Streaming effect
  useEffect(() => {
    if (!isStreaming || currentIndex >= text.length) {
      if (currentIndex >= text.length && !isComplete) {
        setIsComplete(true);
        onCompleteRef.current?.();
      }
      return;
    }
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Start streaming from current index
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = prev + 1;
        
        if (nextIndex >= textRef.current.length) {
          // Streaming complete
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return textRef.current.length;
        }
        
        // Update displayed text
        setDisplayedText(textRef.current.slice(0, nextIndex));
        return nextIndex;
      });
    }, speed);
    
    // Cleanup interval on unmount or deps change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [currentIndex, speed, isStreaming, text.length]);
  
  // Reset function
  const reset = useCallback(() => {
    setDisplayedText("");
    setCurrentIndex(0);
    setIsComplete(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  
  return {
    displayedText,
    isComplete,
    isStreaming: isStreaming && currentIndex < text.length,
    progress: text.length > 0 ? currentIndex / text.length : 0,
    reset,
  };
}