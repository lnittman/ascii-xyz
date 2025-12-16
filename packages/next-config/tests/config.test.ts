import { describe, expect, it, vi } from 'vitest';
import { config, withAnalyzer } from '../index';

vi.mock('@next/bundle-analyzer', () => ({
  default: () => (cfg: any) => ({ ...cfg, analyzed: true }),
}));

describe('next config', () => {
  it('provides rewrite rules', async () => {
    const rewrites = await (config.rewrites as any)();
    expect(rewrites[0].source).toBe('/ingest/static/:path*');
  });

  it('has turbopack config for Next 16', () => {
    // Next 16 uses Turbopack by default, webpack config is no longer needed
    expect(config.turbopack).toEqual({});
  });

  it('withAnalyzer wraps provided config', () => {
    const wrapped = withAnalyzer({});
    expect((wrapped as any).analyzed).toBe(true);
  });
});
