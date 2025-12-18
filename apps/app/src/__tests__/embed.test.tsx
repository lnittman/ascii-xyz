import { describe, expect, it, vi, beforeEach } from 'vitest';
import './setup';
import {
  generateEmbedCode,
  buildEmbedUrl,
  calculateFrameDelay,
  EMBED_DEFAULTS,
} from '@/lib/embed';

// Test data
const sampleArtwork = {
  _id: 'artwork123',
  prompt: 'A dancing robot',
  frames: ['###\n# #\n###', '#  \n # \n  #', '###\n# #\n###'],
  metadata: {
    width: 80,
    height: 24,
    fps: 10,
    generator: 'ai',
    model: 'claude-3.5-sonnet',
  },
  createdAt: '2024-01-01T00:00:00Z',
};

describe('Embed Code Generator', () => {
  it('generates iframe embed code with default options', () => {
    const baseUrl = 'https://ascii.xyz';
    const shareCode = 'abc123';

    const embedCode = generateEmbedCode({
      baseUrl,
      shareCode,
    });

    expect(embedCode).toContain('<iframe');
    expect(embedCode).toContain(`src="${baseUrl}/embed/${shareCode}"`);
    expect(embedCode).toContain('frameborder="0"');
  });

  it('includes custom width and height', () => {
    const embedCode = generateEmbedCode({
      baseUrl: 'https://ascii.xyz',
      shareCode: 'abc123',
      width: 800,
      height: 600,
    });

    expect(embedCode).toContain('width="800"');
    expect(embedCode).toContain('height="600"');
  });

  it('includes title for accessibility', () => {
    const embedCode = generateEmbedCode({
      baseUrl: 'https://ascii.xyz',
      shareCode: 'abc123',
      title: 'A dancing robot',
    });

    expect(embedCode).toContain('title="A dancing robot"');
  });

  it('supports theme option', () => {
    const embedCode = generateEmbedCode({
      baseUrl: 'https://ascii.xyz',
      shareCode: 'abc123',
      theme: 'light',
    });

    expect(embedCode).toContain('?theme=light');
  });

  it('supports autoplay option', () => {
    const embedCode = generateEmbedCode({
      baseUrl: 'https://ascii.xyz',
      shareCode: 'abc123',
      autoplay: false,
    });

    expect(embedCode).toContain('autoplay=false');
  });

  it('combines multiple query params', () => {
    const embedCode = generateEmbedCode({
      baseUrl: 'https://ascii.xyz',
      shareCode: 'abc123',
      theme: 'dark',
      autoplay: true,
      loop: true,
    });

    expect(embedCode).toContain('theme=dark');
    expect(embedCode).toContain('autoplay=true');
    expect(embedCode).toContain('loop=true');
  });
});

describe('Embed URL Builder', () => {
  it('builds embed URL with share code', () => {
    const url = buildEmbedUrl({
      baseUrl: 'https://ascii.xyz',
      shareCode: 'abc123',
    });

    expect(url).toBe('https://ascii.xyz/embed/abc123');
  });

  it('appends theme query param', () => {
    const url = buildEmbedUrl({
      baseUrl: 'https://ascii.xyz',
      shareCode: 'abc123',
      theme: 'light',
    });

    expect(url).toBe('https://ascii.xyz/embed/abc123?theme=light');
  });

  it('appends multiple query params', () => {
    const url = buildEmbedUrl({
      baseUrl: 'https://ascii.xyz',
      shareCode: 'abc123',
      theme: 'dark',
      autoplay: false,
    });

    expect(url).toContain('theme=dark');
    expect(url).toContain('autoplay=false');
  });
});

describe('ASCII Frame Animation', () => {
  it('calculates correct frame delay from fps', () => {
    expect(calculateFrameDelay(10)).toBe(100); // 1000ms / 10fps = 100ms
    expect(calculateFrameDelay(30)).toBe(33); // 1000ms / 30fps ≈ 33ms
    expect(calculateFrameDelay(1)).toBe(1000); // 1000ms / 1fps = 1000ms
  });

  it('handles edge cases', () => {
    expect(calculateFrameDelay(0)).toBe(1000); // Default to 1 fps when 0
    expect(calculateFrameDelay(-1)).toBe(1000); // Default to 1 fps when negative
  });
});

describe('EMBED_DEFAULTS', () => {
  it('has default dimensions', () => {
    expect(EMBED_DEFAULTS.width).toBe(640);
    expect(EMBED_DEFAULTS.height).toBe(480);
  });

  it('has theme colors', () => {
    expect(EMBED_DEFAULTS.backgroundColor.dark).toBeDefined();
    expect(EMBED_DEFAULTS.backgroundColor.light).toBeDefined();
    expect(EMBED_DEFAULTS.textColor.dark).toBeDefined();
    expect(EMBED_DEFAULTS.textColor.light).toBeDefined();
  });

  it('has animation defaults', () => {
    expect(EMBED_DEFAULTS.autoplay).toBe(true);
    expect(EMBED_DEFAULTS.loop).toBe(true);
  });

  it('has font settings', () => {
    expect(EMBED_DEFAULTS.fontSize).toBe(12);
    expect(EMBED_DEFAULTS.fontFamily).toContain('monospace');
  });
});
