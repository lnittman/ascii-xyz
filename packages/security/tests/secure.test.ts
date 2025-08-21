import { beforeEach, describe, expect, it, vi } from 'vitest';

const request = new Request('https://example.com');

beforeEach(() => {
  vi.resetModules();
});

describe('secure', () => {
  it('returns when ARCJET_KEY missing', async () => {
    vi.doMock('../keys', () => ({ keys: () => ({ ARCJET_KEY: undefined }) }));
    const arcjet = vi.fn(() => ({ withRule: vi.fn() }));
    vi.doMock('@arcjet/next', () => ({
      __esModule: true,
      default: arcjet,
      detectBot: vi.fn(() => ({})),
      request: vi.fn(),
      shield: vi.fn(() => ({})),
    }));
    const { secure } = await import('../index');
    await expect(secure([], request)).resolves.toBeUndefined();
    expect(arcjet).not.toHaveBeenCalled();
  });

  it('throws when decision denied due to bot', async () => {
    vi.doMock('../keys', () => ({ keys: () => ({ ARCJET_KEY: 'key' }) }));
    const protect = vi.fn().mockResolvedValue({
      isDenied: () => true,
      reason: { isBot: () => true, isRateLimit: () => false },
    });
    const withRule = vi.fn(() => ({ protect }));
    const arcjet = vi.fn(() => ({ withRule }));
    vi.doMock('@arcjet/next', () => ({
      __esModule: true,
      default: arcjet,
      detectBot: vi.fn(() => ({})),
      request: vi.fn(),
      shield: vi.fn(() => ({})),
    }));
    const { secure } = await import('../index');
    await expect(secure([], request)).rejects.toThrow('No bots allowed');
  });

  it('allows request when decision is approved', async () => {
    vi.doMock('../keys', () => ({ keys: () => ({ ARCJET_KEY: 'key' }) }));
    const protect = vi.fn().mockResolvedValue({
      isDenied: () => false,
      reason: {},
    });
    const withRule = vi.fn(() => ({ protect }));
    const arcjet = vi.fn(() => ({ withRule }));
    vi.doMock('@arcjet/next', () => ({
      __esModule: true,
      default: arcjet,
      detectBot: vi.fn(() => ({})),
      request: vi.fn(),
      shield: vi.fn(() => ({})),
    }));
    const { secure } = await import('../index');
    await expect(secure([], request)).resolves.toBeUndefined();
    expect(protect).toHaveBeenCalled();
  });
});
