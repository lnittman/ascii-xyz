# Claude Guide to Development Documentation

This directory contains development guides, setup instructions, and implementation details for working on Arbor.

## 📁 Directory Contents

### Getting Started (`getting-started.md`)
Quick start guide for new developers:
- Prerequisites
- Repository setup
- Environment configuration
- Running the dev server

### Development Setup (`development-setup.md`)
Detailed setup instructions:
- Installing dependencies
- Database setup
- Mastra configuration
- Local development tips

### Testing Strategy (`testing-strategy.md`)
Testing approach and guidelines:
- Unit testing patterns
- Integration testing
- E2E testing setup
- AI agent testing

### Implementation Guides
Specific implementation documentation:
- Adding new features
- Creating AI agents
- Building UI components
- API endpoint patterns

## 🚀 Quick Start Commands

### Initial Setup
```bash
# Clone repositories
git clone <arbor-xyz-repo>
git clone <arbor-apple-repo>

# Install dependencies
cd arbor-xyz && pnpm install

# Setup environment files
cp .env.example .env.local  # in each repo

# Setup database
cd arbor-xyz
pnpm db:push     # Create schema
pnpm db:seed     # Seed data (if available)
```

### Running Development
```bash
# Terminal 1: Start AI service (port 3999)
cd arbor-xyz/apps/ai
pnpm dev

# Terminal 2: Start main app (port 3000)
cd arbor-xyz
pnpm dev

# Optional Terminal 3: Start daemon
cd arbor-xyz/apps/daemon
pnpm tauri dev
```

## 🛠️ Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes
# Test locally
# Commit with conventional commits
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/your-feature
```

### 2. Testing Checklist
- [ ] Unit tests pass
- [ ] No TypeScript errors
- [ ] Linting passes
- [ ] Manual testing complete
- [ ] No console errors
- [ ] Performance acceptable

### 3. Common Tasks

#### Adding a New API Endpoint
```typescript
// apps/app/src/app/api/your-endpoint/route.ts
import { withAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const POST = withAuth(async (req, { user }) => {
  try {
    const data = await req.json();
    // Validate input
    // Call service
    // Return response
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});
```

#### Adding a New Agent
```typescript
// apps/ai/src/mastra/agents/your-agent/index.ts
import { Agent } from '@mastra/core/agent';
import { createModelFactory } from '../../utils/models';

const getModel = () => {
  // Lazy initialization
  return createModelFactory('model-id');
};

export const yourAgent = new Agent({
  name: 'your-agent',
  description: 'Agent description',
  instructions: loadInstructions(),
  model: getModel(),
  tools: loadTools(),
});
```

## 🔧 Environment Configuration

### arbor-xyz/.env.local
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/arbor

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# AI Service
NEXT_PUBLIC_AI_URL=http://localhost:3999

# Optional
DEBUG_MESSAGES=true
MASTRA_KEY=your-key-for-production
```

### apps/ai/.env.local
```env
# Database (same as arbor-xyz)
DATABASE_URL=postgresql://user:pass@localhost:5432/arbor

# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...

# Main App
MAIN_APP_URL=http://localhost:3000
```

## 🐛 Debugging Guide

### Common Issues

#### "Creating model factory" spam
```typescript
// Problem: Model created multiple times
// Solution: Use lazy initialization
let model;
const getModel = () => {
  if (!model) model = createModelFactory('...');
  return model;
};
```

#### Chat messages not persisting
```typescript
// Problem: Wrong resourceId
// Solution: Always use user.clerkId
const response = await agent.stream(prompt, {
  threadId,
  resourceId: user.clerkId, // NOT user.id
});
```

#### Server crashes with streaming
```typescript
// Problem: Aggressive polling
// Solution: Disable automatic revalidation
useSWR(key, fetcher, {
  refreshInterval: 0,  // No polling
  revalidateOnFocus: false,
});
```

### Debug Tools

#### Enable Verbose Logging
```typescript
// Set in .env.local
DEBUG_MESSAGES=true
DEBUG_AGENTS=true
DEBUG_TOOLS=true
```

#### Database Inspection
```bash
# Open Prisma Studio
cd arbor-xyz
pnpm db:studio
```

#### Network Monitoring
- Browser DevTools Network tab
- Check for excessive requests
- Monitor WebSocket connections

## 📋 Code Style Guide

### TypeScript
- Strict mode enabled
- Explicit return types for public APIs
- Use type imports: `import type { ... }`

### React
- Functional components only
- Custom hooks for logic
- Memoize expensive computations

### Naming Conventions
- Components: PascalCase
- Functions/variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case (except components)

### Import Order
```typescript
// 1. External imports
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. Internal packages
import { Button } from '@repo/design';
import { chatService } from '@repo/api';

// 3. Local imports
import { useChats } from '@/hooks/chat';
import type { Chat } from '@/types';

// 4. Styles (if any)
import styles from './component.module.css';
```

## 🚀 Performance Tips

1. **Use React.memo sparingly** - Only for expensive components
2. **Virtualize long lists** - Use react-window
3. **Lazy load routes** - Use Next.js dynamic imports
4. **Optimize images** - Use Next.js Image component
5. **Cache API responses** - Use SWR effectively

## 📝 Documentation Standards

When adding new features:
1. Update relevant CLAUDE.md files
2. Add JSDoc comments for public APIs
3. Include usage examples
4. Document error cases
5. Note any performance considerations

Remember: Good development practices lead to maintainable code. When in doubt, follow existing patterns in the codebase.