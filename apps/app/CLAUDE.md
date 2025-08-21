# arbor app: engineering guide

*"the main next.js playground where most magic happens"*

this guide documents the arbor web application - a next.js 15.3.2 app built with server components, ai streaming, and a focus on engineering-first design. it serves as the primary interface for arbor's ai-powered experiences.

## architecture overview

### technology stack
- **framework**: next.js 15.3.2 with app router and turbopack
- **authentication**: clerk for user management and auth flows
- **database**: prisma orm with postgresql
- **ai integration**: vercel ai sdk with streaming and tool calling
- **state management**: jotai for ui state, swr for server state
- **styling**: tailwind css v4 with design tokens
- **icons**: phosphor icons (duotone weight)
- **animations**: framer motion for micro-interactions

### directory structure
```
apps/app/
├── src/
│   ├── app/                    # next.js app router
│   │   ├── (authenticated)/    # protected routes
│   │   ├── (unauthenticated)/  # public routes
│   │   └── api/               # api routes
│   ├── components/            # react components
│   │   ├── app/              # feature components
│   │   ├── chat/             # chat interface
│   │   ├── code/             # code workspace
│   │   ├── layout/           # layout components
│   │   └── ui/               # base ui components
│   ├── hooks/                # custom react hooks
│   ├── atoms/                # jotai state atoms
│   └── utils/                # utility functions
```

## core patterns

### authentication flow

#### server-side auth
```typescript
// in layouts and server components
import { auth } from '@repo/auth/server';

export default async function Layout() {
  const { userId, user } = await auth();
  
  if (!userId) {
    // redirect or show sign-in
  }
  
  // fetch user data with internal id
  const internalUser = await database.user.findUnique({
    where: { clerkId: userId }
  });
}
```

#### client-side auth
```typescript
// in client components
import { useUser } from '@repo/auth/client';

export function Component() {
  const { user, isLoaded, isSignedIn } = useUser();
  
  if (!isLoaded) return <Loading />;
  if (!isSignedIn) return <SignIn />;
  
  return <Authenticated user={user} />;
}
```

#### middleware protection
```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/chat(.*)',
  '/code(.*)',
  '/settings(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});
```

### data fetching patterns

#### server components with hydration
```typescript
// layout.tsx - server component
export default async function Layout({ children }) {
  const { userId } = await auth();
  
  // fetch initial data server-side
  const chats = await database.chat.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
  
  return (
    <ChatProvider initialChats={chats}>
      {children}
    </ChatProvider>
  );
}
```

#### swr for client-side fetching
```typescript
// hooks/chats/queries.ts
export function useChats() {
  return useSWR<Chat[]>('/api/chats', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
}

// hooks/chats/mutations.ts
export function useCreateChat() {
  const { mutate } = useSWRConfig();
  
  return async (data: CreateChatData) => {
    const response = await fetch('/api/chats', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // optimistic update
    mutate('/api/chats');
    
    return response.json();
  };
}
```

### ai streaming integration

#### chat interface with useChat
```typescript
// components/chat/ChatInterface.tsx
import { useChat } from '@ai-sdk/react';

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    maxSteps: 5, // for tool calling
    onError: (error) => {
      toast.error('chat error', { description: error.message });
    },
  });
  
  return (
    <div className="flex flex-col h-full">
      <Messages messages={messages} />
      <ChatInput
        value={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        disabled={isLoading}
      />
    </div>
  );
}
```

#### api route with streaming
```typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const { userId } = await auth();
  
  // get user's api key
  const apiKey = await getUserApiKey(userId);
  const openrouter = createOpenRouter({ apiKey });
  
  const result = streamText({
    model: openrouter('anthropic/claude-3.5-sonnet'),
    messages,
    maxSteps: 5,
    tools: {
      // tool definitions
    },
  });
  
  return result.toDataStreamResponse();
}
```

### state management

#### ui state with jotai
```typescript
// atoms/ui.ts
import { atom } from 'jotai';

export const sidebarOpenAtom = atom(true);
export const currentChatIdAtom = atom<string | null>(null);
export const isGeneratingAtom = atom(false);

// usage in components
import { useAtom } from 'jotai';

export function Sidebar() {
  const [isOpen, setIsOpen] = useAtom(sidebarOpenAtom);
  
  return (
    <aside data-open={isOpen}>
      {/* sidebar content */}
    </aside>
  );
}
```

#### server state with swr
```typescript
// never store server data in jotai
// always use swr for caching and synchronization

export function useWorkspaces() {
  const { data, error, mutate } = useSWR('/api/workspaces', fetcher);
  
  return {
    workspaces: data?.data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
```

### component patterns

#### mobile-first with responsive sheets
```typescript
// components/ui/responsive-modal.tsx
export function ResponsiveModal({ children, ...props }) {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return (
      <Sheet {...props}>
        <SheetContent side="bottom" className="h-[80vh]">
          {children}
        </SheetContent>
      </Sheet>
    );
  }
  
  return (
    <Dialog {...props}>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}
```

#### consistent error handling
```typescript
// utils/api.ts
export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new ApiError(data.error || 'request failed', response.status);
    }
    
    return { success: true, data };
  } catch (error) {
    toast.error('error', { 
      description: error instanceof ApiError ? error.message : 'unknown error' 
    });
    throw error;
  }
}
```

## design system integration

### color tokens
```css
/* following arbor's paper-like aesthetic */
:root {
  --background: #faf9f7; /* warm paper-like off-white */
  --foreground: oklch(0.2 0.01 85);
  --primary: oklch(0.22 0.01 85);
  --muted: oklch(0.94 0.01 85);
  --border: oklch(0.9 0.01 85);
}

.dark {
  --background: #0a0a0a;
  --foreground: oklch(0.94 0.01 60);
  --primary: oklch(0.9 0.01 60);
}
```

### typography
```css
/* lowercase, minimal, engineering-first */
.font-title {
  font-family: 'IosevkaTerm-Regular', monospace;
  letter-spacing: 0.01em;
  font-weight: 400;
  text-transform: lowercase;
}
```

### icon system
```typescript
// always use phosphor icons with duotone weight
import { Plus, ChatDots, CaretRight } from '@phosphor-icons/react';

<Plus weight="duotone" size={20} />
```

### animation principles
```typescript
// subtle micro-interactions only
const variants = {
  enter: { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

// no bouncy or playful animations
// focus on functional transitions
```

## api patterns

### route organization
```
app/api/
├── auth/          # clerk webhooks
├── chat/          # ai chat endpoints
├── code/          # workspace operations
├── cron/          # scheduled jobs
└── webhooks/      # external integrations
```

### consistent response format
```typescript
// utils/api-response.ts
export function successResponse<T>(data: T) {
  return Response.json({ success: true, data });
}

export function errorResponse(error: string, status = 400) {
  return Response.json({ success: false, error }, { status });
}

// usage
export async function GET() {
  try {
    const data = await fetchData();
    return successResponse(data);
  } catch (error) {
    return errorResponse(error.message);
  }
}
```

### authentication in routes
```typescript
export async function POST(req: Request) {
  const { userId } = await auth();
  
  if (!userId) {
    return errorResponse('unauthorized', 401);
  }
  
  // get internal user
  const user = await database.user.findUnique({
    where: { clerkId: userId }
  });
  
  if (!user) {
    return errorResponse('user not found', 404);
  }
  
  // proceed with authenticated request
}
```

## performance optimizations

### server component strategies
```typescript
// prefer server components for initial data
// use client components only for interactivity

// good - server component
export default async function Page() {
  const data = await fetchData();
  return <DataDisplay data={data} />;
}

// client component only when needed
'use client';
export function InteractiveFeature() {
  const [state, setState] = useState();
  // interactive logic
}
```

### lazy loading
```typescript
// lazy load heavy components
const Editor = dynamic(() => import('./Editor'), {
  loading: () => <EditorSkeleton />,
  ssr: false,
});

// lazy load modals and sheets
const SettingsModal = dynamic(() => import('./SettingsModal'));
```

### image optimization
```typescript
import Image from 'next/image';

// always use next/image for optimization
<Image
  src={url}
  alt={description}
  width={400}
  height={300}
  className="rounded-lg"
  priority={isAboveFold}
/>
```

## testing approach

### component testing
```typescript
// __tests__/components/ChatInput.test.tsx
import { render, fireEvent } from '@testing-library/react';
import { ChatInput } from '@/components/chat/ChatInput';

test('submits message on enter', () => {
  const onSubmit = vi.fn();
  const { getByRole } = render(
    <ChatInput onSubmit={onSubmit} />
  );
  
  const input = getByRole('textbox');
  fireEvent.change(input, { target: { value: 'test message' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  
  expect(onSubmit).toHaveBeenCalledWith('test message');
});
```

### api testing
```typescript
// __tests__/api/chat.test.ts
import { POST } from '@/app/api/chat/route';

vi.mock('@repo/auth/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: 'test-user' })
}));

test('streams chat response', async () => {
  const request = new Request('http://localhost/api/chat', {
    method: 'POST',
    body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }] })
  });
  
  const response = await POST(request);
  expect(response.status).toBe(200);
  expect(response.headers.get('content-type')).toContain('text/event-stream');
});
```

## deployment considerations

### environment variables
```env
# required
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=

# optional
NEXT_PUBLIC_POSTHOG_KEY=
SENTRY_DSN=
```

### vercel configuration
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/daily-summary",
    "schedule": "0 9 * * *"
  }]
}
```

### performance monitoring
```typescript
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./instrumentation.node');
  }
}

// with sentry or other apm
```

## security practices

### api protection
```typescript
// always validate input
const schema = z.object({
  message: z.string().min(1).max(1000),
  chatId: z.string().uuid(),
});

const validated = schema.parse(await req.json());
```

### csrf protection
```typescript
// clerk handles csrf automatically
// additional protection for sensitive operations
const csrfToken = await generateCSRFToken();
response.headers.set('X-CSRF-Token', csrfToken);
```

### rate limiting
```typescript
// use vercel edge config or redis
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});

const { success } = await ratelimit.limit(userId);
if (!success) {
  return errorResponse('rate limit exceeded', 429);
}
```

## common pitfalls

### avoid these patterns

#### storing server data in jotai
```typescript
// bad - server data in atoms
const usersAtom = atom<User[]>([]);

// good - use swr
const { data: users } = useSWR('/api/users');
```

#### blocking in server components
```typescript
// bad - sequential fetches
const user = await getUser();
const posts = await getPosts(user.id);
const comments = await getComments(posts);

// good - parallel fetches
const [user, posts, comments] = await Promise.all([
  getUser(),
  getPosts(userId),
  getComments(userId),
]);
```

#### overusing client components
```typescript
// bad - entire page as client component
'use client';
export default function Page() {
  // everything is client-side
}

// good - compose server and client
export default async function Page() {
  const data = await fetchData();
  return (
    <>
      <ServerContent data={data} />
      <ClientInteraction />
    </>
  );
}
```

## debugging tips

### development tools
```bash
# run with turbopack for fast refresh
pnpm dev

# analyze bundle size
pnpm analyze

# type checking
pnpm typecheck
```

### common issues

#### "hydration mismatch"
- ensure server and client render same content
- use suppressHydrationWarning sparingly
- check for date/time rendering differences

#### "unauthorized" errors
- verify clerk middleware configuration
- check auth() is awaited in server components
- ensure api routes validate auth

#### slow initial load
- check for blocking data fetches
- use streaming and suspense
- optimize server component granularity

the arbor app embodies engineering-first design: fast, minimal, and focused on what matters - creating seamless ai experiences.