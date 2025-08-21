import { describe, expect, it, vi } from 'vitest';
import { capitalize, cn, handleError, srOnly } from '../lib/utils';

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

const { toast } = require('sonner');

describe('design utils', () => {
  it('cn merges classes with tailwind merge', () => {
    expect(cn('mt-2', 'mt-4')).toBe('mt-4');
  });

  it('capitalize capitalizes first letter', () => {
    expect(capitalize('test')).toBe('Test');
  });

  it('handleError calls toast.error', () => {
    handleError('oops');
    expect(toast.error).toHaveBeenCalledWith('oops');
  });

  it('srOnly contains clipping styles', () => {
    expect(srOnly).toContain('overflow-hidden');
  });
});
