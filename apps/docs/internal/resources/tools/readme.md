# Development Tools and Resources

This directory contains references to tools, frameworks, and resources used in the Arbor platform development.

## Framework Documentation

### AI/ML Frameworks
- [Vercel AI SDK](./vercel-ai/) - AI SDK documentation
- [Mastra Framework](../../mastra/) - Agent orchestration framework

### UI Frameworks
- [Next.js](./nextjs/) - React framework for production
- [shadcn/ui](./shadcn/) - UI component library
- [Tailwind CSS](./tailwind/) - Utility-first CSS framework

### Development Tools
- [Next Forge](./next-forge/) - Monorepo starter template
- [TypeScript](./typescript/) - Type-safe JavaScript
- [Prisma](./prisma/) - Database ORM

## External Resources

### Documentation
- [MDN Web Docs](https://developer.mozilla.org/)
- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)

### AI Model Providers
- [OpenAI Platform](https://platform.openai.com/)
- [Anthropic Console](https://console.anthropic.com/)
- [Hugging Face](https://huggingface.co/)

### Cloud Services
- [Vercel](https://vercel.com/docs)
- [AWS Documentation](https://docs.aws.amazon.com/)
- [Google Cloud](https://cloud.google.com/docs)

### Development Services
- [GitHub](https://docs.github.com/)
- [Clerk Auth](https://clerk.com/docs)
- [Sentry](https://docs.sentry.io/)

## Tool Categories

### Code Quality
- ESLint - JavaScript linting
- Prettier - Code formatting
- TypeScript - Type checking
- Vitest - Unit testing

### Build Tools
- Turbo - Monorepo build system
- Vite - Fast build tool
- esbuild - JavaScript bundler
- SWC - Rust-based compiler

### Development Environment
- VS Code - Code editor
- Docker - Containerization
- pnpm - Package manager
- Git - Version control

### Monitoring & Analytics
- Sentry - Error tracking
- PostHog - Product analytics
- Datadog - Infrastructure monitoring
- LogRocket - Session replay

## Useful Scripts

### Development
```bash
# Start development server
pnpm dev

# Run type checking
pnpm typecheck

# Run linting
pnpm lint

# Format code
pnpm format
```

### Testing
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e
```

### Building
```bash
# Build all packages
pnpm build

# Build specific package
pnpm build --filter=web

# Clean build artifacts
pnpm clean
```

## Configuration Files

### TypeScript
- `tsconfig.json` - TypeScript configuration
- `tsconfig.base.json` - Shared configuration

### Linting
- `.eslintrc.js` - ESLint configuration
- `.prettierrc` - Prettier configuration

### Build
- `turbo.json` - Turbo configuration
- `next.config.js` - Next.js configuration

## Learning Resources

### Tutorials
- [Next.js Learn](https://nextjs.org/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Patterns](https://reactpatterns.com/)

### Courses
- [Epic React](https://epicreact.dev/)
- [Testing JavaScript](https://testingjavascript.com/)
- [CSS for JS Developers](https://css-for-js.dev/)

### Communities
- [Arbor Discord](https://discord.gg/arbor)
- [React Discord](https://discord.gg/react)
- [TypeScript Discord](https://discord.gg/typescript)

---

For detailed documentation on specific tools, explore the subdirectories or visit the official documentation sites.