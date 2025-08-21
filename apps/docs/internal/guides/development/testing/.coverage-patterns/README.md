# Coverage Patterns

This document captures effective testing patterns and utilities used across the repo.

## Effective Patterns
- **Shared Vitest Config**: Import `@repo/testing` in each `vitest.config.ts` for consistent setup.
- **Console Spies for Logger**: Use `vi.spyOn` to verify logger output without printing to stdout.
- **Environment Mocks**: Temporarily set `process.env` values in tests and restore them after each run.
- **Module Mocking with `vi.doMock`**: Mock modules before import when functions rely on top-level constants.

## Testing Utilities
- **Test Data Builders**: Factory functions help create consistent test data.
- **Custom Matchers**: Add domain-specific assertions for cleaner expectations.

## Coverage Strategies
- **Unit Tests for Utilities**: Focus on pure functions in packages and shared libs.
- **Integration Tests for API Routes**: Test request handlers with mocked dependencies.
- **E2E Tests for Critical Flows**: Only a few high-level tests to exercise user journeys.
