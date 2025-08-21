# arbor: engineering-minded design manifesto

*"design is just good engineering" - jesper kouthoofd*

this document guides how we build. it's about constraints, experimentation, and making complex things feel simple. we go slow to go far.

## design principles

### constraints breed creativity
- **one typeface, lowercase** - except acronyms (JSON, API, UI)
- **limited color palette** - 6-8 colors max, connected to a grid system
- **engineering-first** - if it works beautifully, it looks beautiful
- **democratic design** - remove technical barriers, no one should need a manual
- **quality over speed** - "go slow, really slow and think long-term"
- **experiment constantly** - fail, learn, iterate
- **connections over features** - products create human connections

## project architecture

### apps/
- **app/** - your main next.js playground (where most magic happens)
- **ai/** - mastra AI agents (runs as separate service)
- **email/** - react email templates

### packages/
- **@repo/api** - backend logic, schemas, services (the engine)
- **@repo/database** - prisma schema (your data foundation)
- **@repo/design** - UI components, constrained design system
- **@repo/auth** - authentication (clerk)
- **@repo/analytics** - tracking utilities

*other utility packages handle configs*

---

## building features: the experimental approach

*"you can't control your output, you can only control the input"*

### 1. start with data (engineering foundation)

**file:** `packages/database/prisma/schema.prisma`

```prisma
// example: posts
model Post {
  id        String   @id @default(uuid())
  title     String
  content   String?  @db.Text
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([authorId])
}
```

**action:** run `pnpm migrate` - let prisma generate the client

### 2. define contracts (remove friction)

**directory:** `packages/api/schemas/`

create schemas that make sense to humans:

```typescript
// packages/api/schemas/post.ts
import { z } from 'zod';

export const postSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string().nullish(),
  published: z.boolean(),
  authorId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createPostSchema = z.object({
  title: z.string().min(1, "title required"),
  content: z.string().optional(),
  published: z.boolean().optional().default(false),
});
```

### 3. implement services (the engineering)

**directory:** `packages/api/services/`

keep it simple, make it work:

```typescript
// packages/api/services/postService.ts
import { database as db } from '@repo/database';
import { ApiError } from '@repo/api/utils/error';

class PostService {
  async createPost(userId: string, data: CreatePostRequest) {
    const post = await db.post.create({
      data: { ...data, authorId: userId }
    });
    return post;
  }
  
  async getPosts(userId: string) {
    return db.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const postService = new PostService();
```

### 4. expose via routes (democratic access)

**directory:** `apps/app/src/app/api/`

make it accessible:

```typescript
// apps/app/src/app/api/posts/route.ts
export const GET = withErrorHandling(
  withAuthenticatedUser(async (req, { user }) => {
    const posts = await postService.getPosts(user.id);
    return successResponse(posts);
  })
);
```

### 5. frontend (where design meets engineering)

**hooks:** `apps/app/src/hooks/`
```typescript
export function usePosts() {
  const { data, error, isLoading } = useSWR('/api/posts', fetcher);
  return { posts: data?.data, error, isLoading };
}
```

**components:** keep them simple, focused
**pages:** minimal, let components do the work

### 6. AI integration (when applicable)

*if AI enhances the human experience:*

1. **define agent & prompt** (`apps/ai/src/mastra/agents/yourFeatureAgent/`)
   - create `index.ts` for the agent logic
   - create `instructions.xml` for the prompt
   - configure `memory.ts` if it needs specific memory handling
   - register the agent in `apps/ai/src/mastra/index.ts`

2. **define tools** (`apps/ai/src/mastra/tools/`)
   - if the agent needs external APIs, define as mastra tools (XML for MCP, or custom code)

3. **create API proxy** (`apps/app/src/app/api/ai/[featureName]/route.ts`)
   - takes user input for the AI feature
   - uses `@repo/ai`'s `mastra` client to call the agent in `apps/ai`
   - streams the AI's response back to frontend
   - saves relevant interactions to database via `@repo/api/services/`

4. **frontend interaction** (`apps/app/src/components/app/[feature]/AIComponent.tsx`)
   - use `@ai-sdk/react`'s `useChat` hook, pointing to your new AI API proxy
   - build UI for input and displaying AI responses (streaming text, tool calls, etc.)

---

## technical map (the engineering details)

### adding a new API endpoint
1. `packages/api/schemas/` - define zod schemas for request/response
2. `packages/api/services/` - implement business logic  
3. `apps/app/src/app/api/...` - create the route handler

### adding a cron job
1. `apps/app/src/app/api/cron/[job-name]/route.ts` - create a `GET` handler
2. `apps/app/vercel.json` - define the schedule
3. implement the job's logic, likely calling services from `@repo/api`

### interacting with an LLM
1. **agent definition:** `apps/ai/src/mastra/agents/`
2. **API proxy:** `apps/app/src/app/api/chat/` (or feature-specific AI endpoint)
3. **frontend:** `apps/app/src/components/app/chat/` (using `useChat`)
4. **client library:** `@repo/ai` (mastra client)

### modifying database schema
1. `packages/database/prisma/schema.prisma`
2. run `pnpm migrate`
3. update corresponding zod schemas in `packages/api/schemas/`
4. update service methods in `packages/api/services/`

### adding a new shared UI component
1. `packages/design/components/ui/` (if extending shadcn/ui) or `packages/design/components/` (for custom shared components)
2. export from `packages/design/index.tsx` if needed globally

### adding a new page route
1. `apps/app/src/app/(authenticated)/.../page.tsx` (or `(unauthenticated)`)
2. consider an accompanying `layout.tsx` if needed

### adding client-side state
1. `apps/app/src/atoms/` - define jotai atoms

### adding client-side data fetching
1. `apps/app/src/hooks/[entity]/queries.ts` - SWR query hooks
2. `apps/app/src/hooks/[entity]/mutations.ts` - SWR mutation hooks

---

## design principles reminder

- **lowercase everything** (except acronyms)
- **one font, limited colors**
- **remove friction** - if it needs explanation, redesign it
- **experiment** - build bad versions to find the good one
- **go slow** - quality over speed
- **connections** - every feature should bring people together

### the teenage engineering way
*"if you have the will to try things, chances are that it works"*

we're not building software. we're creating instruments for human connection.

---

## important reminders

- do what's asked; nothing more, nothing less
- NEVER create files unless absolutely necessary
- ALWAYS prefer editing existing files
- NEVER proactively create documentation (*.md) files
- keep it simple, keep it lowercase, keep it human