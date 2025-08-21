export interface Logger {
  info(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

// Simple basename implementation that works in Edge Runtime
function getBasename(filepath: string): string {
  // Handle both forward and backward slashes
  const parts = filepath.split(/[\\/]/);
  return parts.at(-1) || 'unknown';
}

export function createLogger(name?: string): Logger {
  const resolved =
    name ??
    (() => {
      // In Edge Runtime, we can't use Error.stack reliably
      // So we'll use a simpler approach
      if (
        typeof (globalThis as any).EdgeRuntime !== 'undefined' ||
        typeof (globalThis as any).document !== 'undefined'
      ) {
        return 'edge-logger';
      }

      const err = new Error();
      const line = err.stack?.split('\n')[2] ?? '';
      const match = line.match(/\(?(.+?):\d+:\d+\)?$/);
      const file = match ? getBasename(match[1]) : 'unknown';
      return file.replace(/\.[^./]+$/, '');
    })();

  const _prefix = `[${resolved}]`;

  return {
    info: (_message: string, ..._args: any[]) => {},
    error: (_message: string, ..._args: any[]) => {},
    warn: (_message: string, ..._args: any[]) => {},
    debug: (_message: string, ..._args: any[]) => {},
  };
}
