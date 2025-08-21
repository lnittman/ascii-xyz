import React from 'react';

// Safari-specific utilities for fixing rendering issues

/**
 * Detects if the browser is Safari on iOS/iPadOS
 */
export function isIOSSafari(): boolean {
  if (typeof window === 'undefined') return false;
  
  const ua = window.navigator.userAgent;
  const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
  const webkit = !!ua.match(/WebKit/i);
  const isSafari = iOS && webkit && !ua.match(/CriOS/i) && !ua.match(/EdgiOS/i);
  
  return isSafari;
}

/**
 * CSS styles to force GPU acceleration and prevent flickering on iOS Safari
 */
export const safariGPUAcceleration = {
  transform: 'translateZ(0)',
  WebkitTransform: 'translateZ(0)',
  willChange: 'transform, opacity',
  WebkitBackfaceVisibility: 'hidden' as const,
  backfaceVisibility: 'hidden' as const,
} as const;

/**
 * Hook to detect iOS Safari
 */
export function useIsIOSSafari(): boolean {
  const [isIOS, setIsIOS] = React.useState(false);
  
  React.useEffect(() => {
    setIsIOS(isIOSSafari());
  }, []);
  
  return isIOS;
}