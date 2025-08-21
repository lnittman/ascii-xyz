import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@repo/auth/server', () => ({ auth: vi.fn() }));
vi.mock('../keys', () => ({ keys: vi.fn(() => ({ SVIX_TOKEN: 'token' })) }));
vi.mock('svix', () => ({
  Svix: class SvixMock {
    message = { create: vi.fn() };
    authentication = { appPortalAccess: vi.fn() };
  },
}));

import { auth } from '@repo/auth/server';
import { Svix } from 'svix';
import { keys } from '../keys';
import { getAppPortal, send } from '../lib/svix';

const svixInstance = new Svix('token');

beforeEach(() => {
  (auth as any).mockResolvedValue({ orgId: 'org_1' });
  (svixInstance.message.create as any).mockClear();
  (svixInstance.authentication.appPortalAccess as any).mockClear();
});

describe('svix helpers', () => {
  it('throws when token missing', async () => {
    (keys as any).mockReturnValue({ SVIX_TOKEN: undefined });
    await expect(send('event', {})).rejects.toThrow('SVIX_TOKEN is not set');
  });

  it('skips send when orgId missing', async () => {
    (keys as any).mockReturnValue({ SVIX_TOKEN: 'token' });
    (auth as any).mockResolvedValue({ orgId: undefined });
    const result = await send('event', {});
    expect(result).toBeUndefined();
  });

  it('creates message when orgId provided', async () => {
    (keys as any).mockReturnValue({ SVIX_TOKEN: 'token' });
    (auth as any).mockResolvedValue({ orgId: 'org_1' });
    await send('event', { foo: 'bar' });
    expect(svixInstance.message.create).toHaveBeenCalled();
  });

  it('returns portal url when orgId provided', async () => {
    (keys as any).mockReturnValue({ SVIX_TOKEN: 'token' });
    (auth as any).mockResolvedValue({ orgId: 'org_1' });
    await getAppPortal();
    expect(svixInstance.authentication.appPortalAccess).toHaveBeenCalled();
  });
});
