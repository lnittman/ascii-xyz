# Development Setup Guide

This guide will help you set up your local development environment for the Arbor platform.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (v8 or higher) - [Installation guide](https://pnpm.io/installation)
- **Git** (latest version)
- **PostgreSQL** (v14 or higher) or Docker for database
- **Redis** (v6 or higher) or Docker for caching

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/arbor/arbor-xyz.git
cd arbor-xyz
```

### 2. Install Dependencies

From the repository root, run:

```bash
pnpm install
```

This will install all dependencies for the monorepo.

### 3. Environment Configuration

Copy the example environment files and configure them:

```bash
# Copy all .env.example files
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env.local
cp packages/database/.env.example packages/database/.env.local
```

Key environment variables to configure:

#### Database Configuration
```env
DATABASE_URL="postgresql://user:password@localhost:5432/arbor"
```

#### Redis Configuration
```env
REDIS_URL="redis://localhost:6379"
```

#### Authentication (Clerk)
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
```

#### AI Model Keys
```env
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
```

### 4. Database Setup

Initialize the database:

```bash
# Run migrations
pnpm db:migrate

# Seed initial data (optional)
pnpm db:seed
```

### 5. Start Development Servers

Start all services:

```bash
pnpm dev
```

This will start:
- Web app: http://localhost:3000
- API server: http://localhost:3001
- Documentation: http://localhost:3002

## Service-Specific Setup

### Kumori (Image Generation)

Additional setup for image generation features:

1. Configure GPU support (if available)
2. Download required model files
3. Set up image storage (S3 or local)

```bash
# Download models
pnpm kumori:setup
```

### Arbor (Chat & Agents)

Setup for chat and agent features:

1. Configure Mastra framework
2. Set up vector database for memory
3. Install MCP servers (optional)

```bash
# Initialize Mastra
pnpm mastra:init
```

## Docker Setup (Alternative)

For a containerized setup:

```bash
# Start all services with Docker Compose
docker-compose up -d

# Run migrations
docker-compose exec api pnpm db:migrate
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill processes on specific ports
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

#### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Verify user permissions

#### Missing Dependencies
```bash
# Clear cache and reinstall
pnpm store prune
rm -rf node_modules
pnpm install
```

## Development Workflow

### Code Style
- Run linting: `pnpm lint`
- Format code: `pnpm format`
- Type checking: `pnpm typecheck`

### Testing
- Run all tests: `pnpm test`
- Run specific package tests: `pnpm test --filter=@arbor/api`
- Watch mode: `pnpm test:watch`

### Building
- Build all packages: `pnpm build`
- Build specific app: `pnpm build --filter=web`

## IDE Setup

### VS Code
Recommended extensions:
- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense

### Settings
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Next Steps

1. Review the [Architecture Documentation](../architecture/)
2. Explore the [API Reference](../api/)
3. Check out [Example Implementations](../examples/)
4. Join our [Discord Community](https://discord.gg/arbor)

## Support

If you encounter issues:
1. Check the [Troubleshooting Guide](./troubleshooting.md)
2. Search [GitHub Issues](https://github.com/arbor/arbor-xyz/issues)
3. Ask in [Discord](https://discord.gg/arbor)
4. Email: dev@arbor.xyz

---

Last Updated: June 22, 2025