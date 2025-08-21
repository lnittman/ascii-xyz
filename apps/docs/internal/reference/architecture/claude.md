# Claude Guide to Architecture Documentation

This directory contains architectural decisions, system design, and technical documentation for Arbor.

## 📁 Directory Contents

### System Overview (`system-overview.md`)
High-level architecture of the Arbor platform:
- Three-repository structure
- Service boundaries
- Communication patterns
- Technology choices

### Platform Architecture (`platform-architecture.md`)
Detailed technical architecture:
- Next.js App Router patterns
- API design principles
- Database schema design
- Authentication flow
- Real-time features

### Data Flow (`data-flow.md`)
How data moves through the system:
- User input → API → AI Service → Response
- WebSocket connections for daemon
- Streaming AI responses
- Cache layers

### Deployment Architecture (`deployment-architecture.md`)
Production deployment strategy:
- Vercel for web apps
- Mastra Cloud for AI service
- PostgreSQL hosting
- CDN and edge functions

### Technical Decisions (`technical-decisions.md`)
Key architectural choices and rationale:
- Why Mastra over LangChain
- Why PostgreSQL with pgvector
- Why SWR over React Query
- Why Clerk for auth

## 🏗️ Core Architecture Principles

### 1. Separation of Concerns
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Presentation  │     │     Domain      │     │  Infrastructure │
│  (apps/app UI)  │ --> │  (packages/api) │ --> │  (apps/ai)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 2. Clean Architecture Layers
- **UI Layer**: React components, hooks, pages
- **Application Layer**: API routes, middleware
- **Domain Layer**: Business logic, services
- **Infrastructure Layer**: Database, external APIs

### 3. Service Boundaries
```
arbor-xyz (Port 3000)
├── Web UI
├── API Routes
└── Business Logic

apps/ai (Port 3999)
├── AI Agents
├── Memory System
└── Tool Execution

arbor-daemon (Port 3456)
├── File System Access
├── Local Integration
└── WebSocket Server
```

## 🔄 Request Flow

### Chat Message Flow
```
1. User types message in UI
2. UI calls POST /api/chats/:id/messages
3. API validates and forwards to Mastra
4. Mastra agent processes with memory
5. Response streams back through layers
6. UI renders streaming response
```

### Attachment Processing
```
1. User uploads file
2. API stores metadata in database
3. Async job queued to apps/ai
4. File processed and embedded
5. Available for RAG search
```

## 🎯 Design Patterns

### Repository Pattern
```typescript
// Encapsulate data access
class ChatRepository {
  async findByUser(userId: string) {
    return prisma.chat.findMany({
      where: { userId },
      include: { project: true }
    });
  }
}
```

### Service Layer Pattern
```typescript
// Business logic abstraction
class ChatService {
  constructor(
    private repo: ChatRepository,
    private ai: MastraService
  ) {}
  
  async createChat(data: CreateChatDto) {
    const chat = await this.repo.create(data);
    await this.ai.createThread(chat.id);
    return chat;
  }
}
```

### Factory Pattern
```typescript
// Lazy initialization
const createModelFactory = (modelId: string) => {
  let instance: Model;
  return () => {
    if (!instance) {
      instance = new Model(modelId);
    }
    return instance;
  };
};
```

## 🔒 Security Architecture

### Authentication
- Clerk handles all auth
- JWT tokens for API access
- Session management
- OAuth providers

### Authorization
- Row-level security via userId
- API route protection
- Resource ownership checks

### Data Protection
- Environment variables for secrets
- No sensitive data in logs
- Encrypted database connections
- HTTPS everywhere

## 📊 Performance Architecture

### Caching Strategy
- Redis for hot data
- SWR for client-side cache
- Database query optimization
- CDN for static assets

### Scaling Considerations
- Stateless API design
- Horizontal scaling ready
- Connection pooling
- Background job queues

## 🚨 Anti-Patterns to Avoid

1. **Direct Database Access from UI**
   ```typescript
   // Bad: UI component with Prisma
   // Good: Use API routes
   ```

2. **Synchronous AI Calls**
   ```typescript
   // Bad: Blocking AI requests
   // Good: Streaming responses
   ```

3. **Tight Coupling**
   ```typescript
   // Bad: UI knows about AI details
   // Good: Clean service interfaces
   ```

## 📝 Architecture Documentation Standards

When documenting architecture:
1. Use diagrams for complex flows
2. Include rationale for decisions
3. Document trade-offs
4. Keep it up to date
5. Link to implementation examples

Remember: Good architecture enables change. Document the "why" not just the "what".