import { GIFEncoder, quantize, applyPalette } from 'gifenc';

/**
 * Options for rendering ASCII to canvas
 */
export interface RenderOptions {
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  backgroundColor?: string;
  padding?: number;
}

/**
 * Options for creating animated GIF from ASCII frames
 */
export interface GifExportOptions {
  frames: string[];
  fps: number;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  backgroundColor?: string;
  padding?: number;
}

/**
 * Dimensions result from canvas calculation
 */
export interface CanvasDimensions {
  charWidth: number;
  charHeight: number;
  canvasWidth: number;
  canvasHeight: number;
}

// Default styling for ASCII art
const DEFAULTS = {
  fontSize: 14,
  fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
  textColor: '#00ff00',
  backgroundColor: '#000000',
  padding: 16,
  lineHeight: 1.2,
  charWidthRatio: 0.6, // Monospace char width is typically 0.6 of font size
};

/**
 * Calculate canvas dimensions for ASCII art
 */
export function calculateCanvasDimensions(
  ascii: string,
  options: Pick<RenderOptions, 'fontSize' | 'padding'> = {}
): CanvasDimensions {
  const fontSize = options.fontSize ?? DEFAULTS.fontSize;
  const padding = options.padding ?? DEFAULTS.padding;

  const lines = ascii.split('\n');
  const charHeight = lines.length;
  const charWidth = Math.max(0, ...lines.map((line) => line.length));

  // Calculate pixel dimensions
  const charPixelWidth = fontSize * DEFAULTS.charWidthRatio;
  const lineHeight = fontSize * DEFAULTS.lineHeight;

  const canvasWidth = Math.ceil(charWidth * charPixelWidth + padding * 2);
  const canvasHeight = Math.ceil(charHeight * lineHeight + padding * 2);

  return {
    charWidth,
    charHeight,
    canvasWidth,
    canvasHeight,
  };
}

/**
 * Render ASCII text to a canvas element
 */
export function renderAsciiToCanvas(
  ascii: string,
  options: RenderOptions = {}
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const fontSize = options.fontSize ?? DEFAULTS.fontSize;
  const fontFamily = options.fontFamily ?? DEFAULTS.fontFamily;
  const textColor = options.textColor ?? DEFAULTS.textColor;
  const backgroundColor = options.backgroundColor ?? DEFAULTS.backgroundColor;
  const padding = options.padding ?? DEFAULTS.padding;

  const dims = calculateCanvasDimensions(ascii, { fontSize, padding });

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = dims.canvasWidth;
  canvas.height = dims.canvasHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas 2D context');
  }

  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Set text style
  ctx.fillStyle = textColor;
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textBaseline = 'top';

  // Render each line
  const lines = ascii.split('\n');
  const lineHeight = fontSize * DEFAULTS.lineHeight;

  lines.forEach((line, index) => {
    ctx.fillText(line, padding, padding + index * lineHeight);
  });

  return { canvas, ctx };
}

/**
 * Create an animated GIF from ASCII frames
 */
export async function createGifFromFrames(
  options: GifExportOptions
): Promise<Blob> {
  const {
    frames,
    fps,
    fontSize = DEFAULTS.fontSize,
    fontFamily = DEFAULTS.fontFamily,
    textColor = DEFAULTS.textColor,
    backgroundColor = DEFAULTS.backgroundColor,
    padding = DEFAULTS.padding,
  } = options;

  if (frames.length === 0) {
    throw new Error('No frames provided');
  }

  // Calculate dimensions from the first frame (assume all frames are same size)
  const dims = calculateCanvasDimensions(frames[0], { fontSize, padding });

  // Initialize GIF encoder
  const gif = GIFEncoder();

  // Calculate frame delay in centiseconds (GIF uses centiseconds)
  const delay = Math.round(100 / fps);

  // Render and add each frame
  for (const frame of frames) {
    const { canvas, ctx } = renderAsciiToCanvas(frame, {
      fontSize,
      fontFamily,
      textColor,
      backgroundColor,
      padding,
    });

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Quantize to 256 colors for GIF
    const palette = quantize(imageData.data, 256);
    const indexed = applyPalette(imageData.data, palette);

    // Add frame to GIF
    gif.writeFrame(indexed, canvas.width, canvas.height, {
      palette,
      delay,
    });
  }

  // Finish encoding
  gif.finish();

  // Get the GIF bytes
  const bytes = gif.bytes();

  // Create and return blob (cast for TypeScript compatibility)
  return new Blob([bytes as BlobPart], { type: 'image/gif' });
}

/**
 * Download a GIF blob with the given filename
 */
export function downloadGif(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
