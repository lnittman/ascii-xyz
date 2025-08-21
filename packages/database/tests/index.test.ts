import { beforeEach, describe, expect, it } from 'vitest';

beforeEach(() => {
  (global as any).sql = undefined;
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgres://user:pass@localhost/db';
});

describe('database export', () => {
  it('returns the same Drizzle instance across imports', async () => {
    const mod1 = await import('../index');
    const mod2 = await import('../index');
    expect(mod1.database).toBe(mod2.database);
    expect(mod1.db).toBe(mod2.db);
  });

  it('exports Drizzle ORM utilities', async () => {
    const mod = await import('../index');
    expect(mod.eq).toBeDefined();
    expect(mod.and).toBeDefined();
    expect(mod.or).toBeDefined();
    expect(mod.schema).toBeDefined();
  });
});
