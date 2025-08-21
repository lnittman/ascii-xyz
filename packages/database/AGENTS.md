# @repo/database Contributor Guide

## Package Overview
Provides Prisma schema and database access utilities used across all apps.

## Dev Environment
- Install deps: `pnpm install`
- Format and generate client: `pnpm build`
- Apply schema changes: `pnpm migrate`

## Key Files and Directories
- `prisma/schema.prisma` – data models
- `index.ts` – database client re-export

## Testing
- Database integration tests are not yet implemented

## Known Issues
- Ensure `DATABASE_URL` is set before running migrations
