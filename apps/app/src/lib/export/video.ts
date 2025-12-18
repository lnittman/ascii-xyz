import { calculateCanvasDimensions, type RenderOptions } from './gif';

/**
 * Options for creating video from ASCII frames
 */
export interface VideoExportOptions {
  frames: string[];
  fps: number;
  format?: 'webm' | 'mp4';
  quality?: number; // 0-1, default 0.9
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  backgroundColor?: string;
  padding?: number;
}

// Default styling (reuse from gif)
const DEFAULTS = {
  fontSize: 14,
  fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
  textColor: '#00ff00',
  backgroundColor: '#000000',
  padding: 16,
  lineHeight: 1.2,
  charWidthRatio: 0.6,
  quality: 0.9,
};

/**
 * Check if video export is supported in the current browser
 */
export function isVideoExportSupported(): boolean {
  if (typeof MediaRecorder === 'undefined') {
    return false;
  }
  return MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ||
         MediaRecorder.isTypeSupported('video/webm;codecs=vp8') ||
         MediaRecorder.isTypeSupported('video/webm');
}

/**
 * Get the best supported video MIME type
 */
function getBestMimeType(): string {
  const types = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return 'video/webm';
}

/**
 * Render a single frame to a canvas
 */
function renderFrameToCanvas(
  ctx: CanvasRenderingContext2D,
  frame: string,
  options: Required<Pick<VideoExportOptions, 'fontSize' | 'fontFamily' | 'textColor' | 'backgroundColor' | 'padding'>>
): void {
  const { fontSize, fontFamily, textColor, backgroundColor, padding } = options;

  // Clear and fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Set text style
  ctx.fillStyle = textColor;
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textBaseline = 'top';

  // Render each line
  const lines = frame.split('\n');
  const lineHeight = fontSize * DEFAULTS.lineHeight;

  lines.forEach((line, index) => {
    ctx.fillText(line, padding, padding + index * lineHeight);
  });
}

/**
 * Sleep for a given duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a video from ASCII frames using MediaRecorder
 */
export async function createVideoFromFrames(
  options: VideoExportOptions
): Promise<Blob> {
  const {
    frames,
    fps,
    quality = DEFAULTS.quality,
    fontSize = DEFAULTS.fontSize,
    fontFamily = DEFAULTS.fontFamily,
    textColor = DEFAULTS.textColor,
    backgroundColor = DEFAULTS.backgroundColor,
    padding = DEFAULTS.padding,
  } = options;

  if (frames.length === 0) {
    throw new Error('No frames provided');
  }

  // Calculate dimensions from the first frame
  const dims = calculateCanvasDimensions(frames[0], { fontSize, padding });

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = dims.canvasWidth;
  canvas.height = dims.canvasHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas 2D context');
  }

  // Get stream from canvas
  const stream = canvas.captureStream(fps);

  // Create MediaRecorder
  const mimeType = getBestMimeType();
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 5000000, // 5 Mbps for quality
  });

  // Collect recorded chunks
  const chunks: Blob[] = [];

  return new Promise((resolve, reject) => {
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onerror = (event) => {
      reject(new Error('MediaRecorder error'));
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });

      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());

      resolve(blob);
    };

    // Start recording
    recorder.start();

    // Render frames at the specified FPS
    const frameDelay = 1000 / fps;

    const renderFrames = async () => {
      for (let i = 0; i < frames.length; i++) {
        renderFrameToCanvas(ctx, frames[i], {
          fontSize,
          fontFamily,
          textColor,
          backgroundColor,
          padding,
        });

        // Wait for frame duration
        await sleep(frameDelay);
      }

      // Add a small delay before stopping to ensure last frame is captured
      await sleep(100);

      // Stop recording
      recorder.stop();
    };

    renderFrames().catch(reject);
  });
}

/**
 * Download a video blob with the given filename
 */
export function downloadVideo(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
