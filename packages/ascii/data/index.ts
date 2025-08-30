/**
 * ASCII Data
 * Pre-built ASCII animations and patterns
 */

import geometricMorph from './geometric-morph.json';

export const animations = {
  geometricMorph,
} as const;

// Export individual animations for convenience
export { default as geometricMorphData } from './geometric-morph.json';