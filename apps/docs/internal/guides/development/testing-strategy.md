# Testing Strategy

Automated tests use [Vitest](https://vitest.dev). Run all tests from the repo root:

```bash
pnpm test
```

To run tests for a specific workspace:

```bash
pnpm --filter <name> test
```

New packages should include a `test` script in `package.json` that invokes `vitest run`.
Existing tests cover environment keys and API error helpers.
