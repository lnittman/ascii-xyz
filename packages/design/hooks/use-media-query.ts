"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook for detecting whether a media query matches.
 * 
 * @param query The media query to check
 * @returns A boolean indicating whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Check if window is available (for SSR)
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query);
      if (media.matches !== matches) {
        setMatches(media.matches);
      }

      // Create a listener function
      const listener = () => setMatches(media.matches);
      
      // Add listener for changes
      media.addEventListener("change", listener);
      
      // Clean up the listener
      return () => media.removeEventListener("change", listener);
    }
    
    // Default to false in SSR
    return undefined;
  }, [matches, query]);

  return matches;
} 