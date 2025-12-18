/**
 * Embed utilities for ASCII artwork
 */

export interface EmbedCodeOptions {
  baseUrl: string;
  shareCode: string;
  width?: number;
  height?: number;
  title?: string;
  theme?: 'light' | 'dark';
  autoplay?: boolean;
  loop?: boolean;
}

export interface EmbedUrlOptions {
  baseUrl: string;
  shareCode: string;
  theme?: 'light' | 'dark';
  autoplay?: boolean;
  loop?: boolean;
}

/**
 * Generate iframe embed code for ASCII artwork
 */
export function generateEmbedCode(options: EmbedCodeOptions): string {
  const {
    baseUrl,
    shareCode,
    width = 640,
    height = 480,
    title = 'ASCII Art',
    theme,
    autoplay,
    loop,
  } = options;

  const url = buildEmbedUrl({ baseUrl, shareCode, theme, autoplay, loop });

  return `<iframe src="${url}" width="${width}" height="${height}" title="${title}" frameborder="0" allowfullscreen></iframe>`;
}

/**
 * Build embed URL with query parameters
 */
export function buildEmbedUrl(options: EmbedUrlOptions): string {
  const { baseUrl, shareCode, theme, autoplay, loop } = options;
  const params = new URLSearchParams();

  if (theme) params.append('theme', theme);
  if (autoplay !== undefined) params.append('autoplay', String(autoplay));
  if (loop !== undefined) params.append('loop', String(loop));

  const queryString = params.toString();
  return `${baseUrl}/embed/${shareCode}${queryString ? `?${queryString}` : ''}`;
}

/**
 * Calculate frame delay in milliseconds from FPS
 */
export function calculateFrameDelay(fps: number): number {
  if (fps <= 0) return 1000;
  return Math.round(1000 / fps);
}

/**
 * Default embed settings
 */
export const EMBED_DEFAULTS = {
  width: 640,
  height: 480,
  theme: 'dark' as const,
  autoplay: true,
  loop: true,
  fontSize: 12,
  fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
  backgroundColor: {
    dark: '#0a0a0a',
    light: '#fafafa',
  },
  textColor: {
    dark: '#00ff00',
    light: '#1a1a1a',
  },
};
