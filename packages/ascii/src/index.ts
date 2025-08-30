/**
 * @repo/ascii
 * 
 * Comprehensive ASCII art generation and animation package
 * with data.json-driven animations and full creative control
 * 
 * @example
 * ```tsx
 * import { AsciiMorph, useAsciiAnimation } from '@repo/ascii';
 * import { geometricMorphData } from '@repo/ascii/data';
 * 
 * function App() {
 *   return (
 *     <AsciiMorph 
 *       frames={geometricMorphData}
 *       speed={150}
 *       interactive={true}
 *     />
 *   );
 * }
 * ```
 */

// Components
export * from './components';

// Hooks
export * from './hooks';

// Utilities
export * from './utils';

// Types
export * from './types';

// Keep existing exports for compatibility
export * from './engine';
export * from './generators';
export * from './presets';