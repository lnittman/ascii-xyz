// Glob import for convex-test module resolution
// This file is outside convex/ directory to avoid Convex bundler trying to process import.meta.glob
export const modules = import.meta.glob([
  '../convex/**/*.ts',
  '!../convex/convex.config.ts',
  '!../convex/__tests__/**',
]);
