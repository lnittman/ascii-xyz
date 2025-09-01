/**
 * ASCII Components
 * Reusable React components for ASCII art and animations
 */

export * from './FourMLogsAnimation'; // Keep existing export
export { AsciiMorph } from './ascii-morph';
export { AsciiScatter } from './AsciiScatter';

// Re-export types for convenience
export type { 
  AsciiMorphProps,
  RippleConfig,
  MousePosition 
} from '../types';