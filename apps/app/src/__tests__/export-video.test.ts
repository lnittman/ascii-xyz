import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

// Mock canvas and context
const mockCanvasStream = {
  getTracks: vi.fn(() => [{ stop: vi.fn() }]),
};

const mockCanvas: any = {
  width: 0,
  height: 0,
  getContext: vi.fn(),
  captureStream: vi.fn(() => mockCanvasStream),
};

const mockContext = {
  fillStyle: '',
  font: '',
  textBaseline: '',
  fillRect: vi.fn(),
  fillText: vi.fn(),
  canvas: mockCanvas,
};

// Wire up getContext to return mockContext
mockCanvas.getContext = vi.fn(() => mockContext);

// Track mock calls
const mockStart = vi.fn();
const mockStop = vi.fn();

// Mock MediaRecorder as a class
class MockMediaRecorder {
  static isTypeSupported = vi.fn(() => true);

  state: 'inactive' | 'recording' | 'paused' = 'inactive';
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: ((error: Error) => void) | null = null;

  constructor(_stream: any, _options?: any) {}

  start() {
    mockStart();
    this.state = 'recording';
  }

  stop() {
    mockStop();
    this.state = 'inactive';
    // Simulate data available and stop events
    setTimeout(() => {
      if (this.ondataavailable) {
        this.ondataavailable({ data: new Blob(['video'], { type: 'video/webm' }) });
      }
      if (this.onstop) {
        this.onstop();
      }
    }, 10);
  }
}

vi.stubGlobal('MediaRecorder', MockMediaRecorder);

vi.stubGlobal('document', {
  createElement: vi.fn((tag: string) => {
    if (tag === 'canvas') {
      return mockCanvas;
    }
    if (tag === 'a') {
      return { href: '', download: '', click: vi.fn() };
    }
    return {};
  }),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
});

vi.stubGlobal('URL', {
  createObjectURL: vi.fn(() => 'blob:test'),
  revokeObjectURL: vi.fn(),
});

// Mock requestAnimationFrame
vi.stubGlobal('requestAnimationFrame', vi.fn((cb: () => void) => {
  setTimeout(cb, 16);
  return 1;
}));

// Import after mocking
import {
  createVideoFromFrames,
  isVideoExportSupported,
  type VideoExportOptions,
} from '@/lib/export/video';

describe('Video Export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isVideoExportSupported', () => {
    it('returns true when MediaRecorder supports webm', () => {
      MockMediaRecorder.isTypeSupported.mockReturnValue(true);
      expect(isVideoExportSupported()).toBe(true);
    });

    it('returns false when MediaRecorder not supported', () => {
      MockMediaRecorder.isTypeSupported.mockReturnValue(false);
      expect(isVideoExportSupported()).toBe(false);
    });
  });

  describe('createVideoFromFrames', () => {
    const sampleFrames = [
      '####\n#  #\n####',
      '#  #\n    \n#  #',
      '####\n#  #\n####',
    ];

    it('creates a WebM video blob', async () => {
      const options: VideoExportOptions = {
        frames: sampleFrames,
        fps: 10,
      };

      const blob = await createVideoFromFrames(options);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('video/webm');
    });

    it('uses provided fps for frame timing', async () => {
      const options: VideoExportOptions = {
        frames: sampleFrames,
        fps: 30,
      };

      const blob = await createVideoFromFrames(options);

      expect(blob).toBeInstanceOf(Blob);
    });

    it('applies custom colors', async () => {
      const options: VideoExportOptions = {
        frames: sampleFrames,
        fps: 10,
        backgroundColor: '#1a1a1a',
        textColor: '#00ff00',
      };

      const blob = await createVideoFromFrames(options);

      expect(blob).toBeInstanceOf(Blob);
    });

    it('handles single frame (static video)', async () => {
      const options: VideoExportOptions = {
        frames: ['Static ASCII'],
        fps: 1,
      };

      const blob = await createVideoFromFrames(options);

      expect(blob).toBeInstanceOf(Blob);
    });

    it('throws error for empty frames', async () => {
      const options: VideoExportOptions = {
        frames: [],
        fps: 10,
      };

      await expect(createVideoFromFrames(options)).rejects.toThrow('No frames provided');
    });

    it('uses canvas captureStream', async () => {
      const options: VideoExportOptions = {
        frames: sampleFrames,
        fps: 10,
      };

      await createVideoFromFrames(options);

      expect(mockCanvas.captureStream).toHaveBeenCalled();
    });

    it('starts and stops MediaRecorder', async () => {
      const options: VideoExportOptions = {
        frames: sampleFrames,
        fps: 10,
      };

      await createVideoFromFrames(options);

      expect(mockStart).toHaveBeenCalled();
      expect(mockStop).toHaveBeenCalled();
    });
  });
});
