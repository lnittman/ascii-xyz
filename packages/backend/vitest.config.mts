import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['__tests__/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    setupFiles: ['./__tests__/setup.ts'],
    testTimeout: 30000,
    coverage: {
      provider: 'v8',
      enabled: false,
      reporter: [
        'text',
        'text-summary',
        'json',
        'json-summary',
        'html',
        'lcov',
      ],
      reportsDirectory: './coverage',
      include: ['convex/**/*.ts'],
      exclude: [
        'node_modules/',
        '__tests__/**',
        '**/*.d.ts',
        '**/*.config.*',
        'convex/_generated/**',
      ],
      thresholds: {
        statements: 20,
        branches: 10,
        functions: 25,
        lines: 20,
      },
    },
  },
});
