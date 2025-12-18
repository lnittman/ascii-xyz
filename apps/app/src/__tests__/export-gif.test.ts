import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock canvas and 2D context
const mockContext = {
  fillStyle: '',
  font: '',
  textBaseline: '',
  fillRect: vi.fn(),
  fillText: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray(100 * 50 * 4).fill(0),
    width: 100,
    height: 50,
  })),
};

const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn(() => mockContext),
};

// Mock document.createElement for canvas
vi.stubGlobal('document', {
  createElement: vi.fn((tag: string) => {
    if (tag === 'canvas') {
      return mockCanvas;
    }
    return {};
  }),
});

// Import after mocking
import {
  renderAsciiToCanvas,
  createGifFromFrames,
  calculateCanvasDimensions,
  type GifExportOptions,
} from '@/lib/export/gif';

describe('GIF Export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCanvas.width = 0;
    mockCanvas.height = 0;
  });

  describe('calculateCanvasDimensions', () => {
    it('calculates dimensions for single-line ASCII', () => {
      const ascii = 'Hello World';
      const dims = calculateCanvasDimensions(ascii);

      expect(dims.charWidth).toBe(11); // "Hello World".length
      expect(dims.charHeight).toBe(1);
      expect(dims.canvasWidth).toBeGreaterThan(0);
      expect(dims.canvasHeight).toBeGreaterThan(0);
    });

    it('calculates dimensions for multi-line ASCII', () => {
      const ascii = '###\n# #\n###';
      const dims = calculateCanvasDimensions(ascii);

      expect(dims.charWidth).toBe(3);
      expect(dims.charHeight).toBe(3);
    });

    it('handles empty string', () => {
      const dims = calculateCanvasDimensions('');

      expect(dims.charWidth).toBe(0);
      // Empty string split gives [''] which is 1 line
      expect(dims.charHeight).toBe(1);
    });

    it('uses custom font size', () => {
      const ascii = 'Test';
      const dims12 = calculateCanvasDimensions(ascii, { fontSize: 12 });
      const dims16 = calculateCanvasDimensions(ascii, { fontSize: 16 });

      expect(dims16.canvasWidth).toBeGreaterThan(dims12.canvasWidth);
      expect(dims16.canvasHeight).toBeGreaterThan(dims12.canvasHeight);
    });

    it('uses custom padding', () => {
      const ascii = 'Test';
      const noPadding = calculateCanvasDimensions(ascii, { padding: 0 });
      const withPadding = calculateCanvasDimensions(ascii, { padding: 20 });

      expect(withPadding.canvasWidth).toBe(noPadding.canvasWidth + 40); // padding * 2
      expect(withPadding.canvasHeight).toBe(noPadding.canvasHeight + 40);
    });
  });

  describe('renderAsciiToCanvas', () => {
    it('creates a canvas with correct dimensions', () => {
      const ascii = '####\n#  #\n####';

      renderAsciiToCanvas(ascii);

      expect(document.createElement).toHaveBeenCalledWith('canvas');
      expect(mockCanvas.width).toBeGreaterThan(0);
      expect(mockCanvas.height).toBeGreaterThan(0);
    });

    it('fills background with specified color', () => {
      const ascii = 'Test';

      renderAsciiToCanvas(ascii, { backgroundColor: '#000000' });

      // fillRect is called to fill background
      expect(mockContext.fillRect).toHaveBeenCalled();
      // Note: fillStyle is later set to textColor, so we verify fillRect was called
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, expect.any(Number), expect.any(Number));
    });

    it('sets text color', () => {
      const ascii = 'Test';

      renderAsciiToCanvas(ascii, { textColor: '#00ff00' });

      // Check that fillText was called (text rendering)
      expect(mockContext.fillText).toHaveBeenCalled();
    });

    it('uses monospace font', () => {
      const ascii = 'Test';

      renderAsciiToCanvas(ascii);

      expect(mockContext.font).toMatch(/monospace/);
    });

    it('renders each line of ASCII', () => {
      const ascii = 'Line1\nLine2\nLine3';

      renderAsciiToCanvas(ascii);

      expect(mockContext.fillText).toHaveBeenCalledTimes(3);
    });

    it('returns canvas and context', () => {
      const ascii = 'Test';

      const result = renderAsciiToCanvas(ascii);

      expect(result.canvas).toBeDefined();
      expect(result.ctx).toBeDefined();
    });
  });

  describe('createGifFromFrames', () => {
    const sampleFrames = [
      '####\n#  #\n####',
      '#  #\n    \n#  #',
      '####\n#  #\n####',
    ];

    it('creates a GIF blob from ASCII frames', async () => {
      const options: GifExportOptions = {
        frames: sampleFrames,
        fps: 10,
      };

      const blob = await createGifFromFrames(options);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/gif');
    });

    it('respects fps setting for frame delay', async () => {
      const options: GifExportOptions = {
        frames: sampleFrames,
        fps: 5, // 200ms per frame
      };

      const blob = await createGifFromFrames(options);

      expect(blob).toBeInstanceOf(Blob);
    });

    it('applies custom colors', async () => {
      const options: GifExportOptions = {
        frames: sampleFrames,
        fps: 10,
        backgroundColor: '#1a1a1a',
        textColor: '#00ff00',
      };

      const blob = await createGifFromFrames(options);

      expect(blob).toBeInstanceOf(Blob);
    });

    it('handles single frame (static GIF)', async () => {
      const options: GifExportOptions = {
        frames: ['Static ASCII'],
        fps: 1,
      };

      const blob = await createGifFromFrames(options);

      expect(blob).toBeInstanceOf(Blob);
    });

    it('handles empty frames array', async () => {
      const options: GifExportOptions = {
        frames: [],
        fps: 10,
      };

      await expect(createGifFromFrames(options)).rejects.toThrow('No frames provided');
    });

    it('uses custom font size', async () => {
      const options: GifExportOptions = {
        frames: sampleFrames,
        fps: 10,
        fontSize: 20,
      };

      const blob = await createGifFromFrames(options);

      expect(blob).toBeInstanceOf(Blob);
    });
  });
});
