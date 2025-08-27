import type { ThemeProviderProps } from 'next-themes';

import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from './providers/theme';

type DesignSystemProviderProperties = ThemeProviderProps;

export const DesignSystemProvider = ({
  children,
  ...properties
}: DesignSystemProviderProperties) => (
  <ThemeProvider {...properties}>
    <TooltipProvider>{children}</TooltipProvider>
    <Toaster />
  </ThemeProvider>
);

// Export all components
export * from './components';

// Export hooks that are needed by components
export { useStreamingText } from './hooks/use-streaming-text';
export type { UseStreamingTextOptions } from './hooks/use-streaming-text';

// Export utilities that might be needed
export { useIsIOSSafari, safariGPUAcceleration } from './lib/safari-utils';
