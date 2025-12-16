import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, expect, vi } from 'vitest';

expect.extend(matchers);

// Mock localStorage for atomWithStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageMock.store[key];
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {};
  }),
  get length() {
    return Object.keys(localStorageMock.store).length;
  },
  key: vi.fn(
    (index: number) => Object.keys(localStorageMock.store)[index] ?? null
  ),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

afterEach(() => {
  cleanup();
  localStorageMock.clear();
});

export const mockUseQuery = vi.fn();
export const mockUseMutation = vi.fn(() => vi.fn());
export const mockUseAction = vi.fn(() => vi.fn());
export const mockUseAtom = vi.fn(() => [null, vi.fn()]);
export const mockUseAtomValue = vi.fn();
export const mockUseSetAtom = vi.fn(() => vi.fn());

vi.mock('convex/react', () => ({
  useQuery: mockUseQuery,
  useMutation: mockUseMutation,
  useAction: mockUseAction,
  ConvexProvider: ({ children }: { children: ReactNode }) => children,
}));

vi.mock('jotai', async () => {
  const actual = await vi.importActual('jotai');
  return {
    ...actual,
    useAtom: mockUseAtom,
    useAtomValue: mockUseAtomValue,
    useSetAtom: mockUseSetAtom,
  };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));
