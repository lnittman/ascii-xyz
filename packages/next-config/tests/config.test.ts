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

  it('sets up webpack config', () => {
    const result = (config.webpack as any)({ plugins: [] });
    expect(result.ignoreWarnings[0]).toHaveProperty('module');
  });

  it('withAnalyzer wraps provided config', () => {
    const wrapped = withAnalyzer({});
    expect((wrapped as any).analyzed).toBe(true);
  });
});
