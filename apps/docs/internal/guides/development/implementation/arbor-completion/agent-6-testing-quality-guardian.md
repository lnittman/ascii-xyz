# agent 6: testing & quality guardian
*"ensuring excellence through verification"*

## scope

this agent implements comprehensive test coverage across the arbor ecosystem, establishes quality gates, and ensures every feature works flawlessly. the goal is catching issues before users do and maintaining confidence in every deployment.

## packages to modify

- all packages and apps - test files and coverage
- `.github/workflows/` - ci/cd pipeline enhancements
- `vitest.config.ts` files - test configuration
- `playwright.config.ts` - e2e test setup

## implementation details

### 1. unit test coverage

#### a. critical service tests
```typescript
// packages/api/services/__tests__/chat.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatService } from '../chat';
import { database } from '@repo/database';
import { mastraAgentService } from '../mastra/agent';

vi.mock('@repo/database');
vi.mock('../mastra/agent');

describe('ChatService', () => {
  let chatService: ChatService;
  
  beforeEach(() => {
    chatService = new ChatService();
    vi.clearAllMocks();
  });
  
  describe('syncWithMastra', () => {
    it('should sync messages from mastra to database', async () => {
      const mockMessages = [
        { id: '1', content: 'hello', role: 'user', toolCalls: null },
        { id: '2', content: 'hi there', role: 'assistant', toolCalls: null }
      ];
      
      vi.mocked(mastraAgentService.getThreadMessages).mockResolvedValue(mockMessages);
      vi.mocked(database.message.upsert).mockResolvedValue({} as any);
      
      await chatService.syncWithMastra('chat-1', 'user-clerk-id');
      
      expect(mastraAgentService.getThreadMessages).toHaveBeenCalledWith(
        'chat-1',
        'user-clerk-id'
      );
      
      expect(database.message.upsert).toHaveBeenCalledTimes(2);
      expect(database.message.upsert).toHaveBeenCalledWith({
        where: { mastraMessageId: '1' },
        create: expect.objectContaining({
          content: 'hello',
          role: 'user'
        }),
        update: expect.objectContaining({
          content: 'hello'
        })
      });
    });
    
    it('should handle mastra connection errors gracefully', async () => {
      vi.mocked(mastraAgentService.getThreadMessages).mockRejectedValue(
        new Error('connection refused')
      );
      
      await expect(
        chatService.syncWithMastra('chat-1', 'user-clerk-id')
      ).rejects.toThrow('Failed to sync with Mastra');
    });
  });
});
```

#### b. hook testing with testing library
```typescript
// apps/app/src/hooks/chat/__tests__/queries.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { useChat, useChats } from '../queries';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ dedupingInterval: 0 }}>
    {children}
  </SWRConfig>
);

describe('useChat', () => {
  it('should fetch and return chat data', async () => {
    const mockChat = {
      id: 'chat-1',
      title: 'test chat',
      messages: []
    };
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockChat })
    });
    
    const { result } = renderHook(() => useChat('chat-1'), { wrapper });
    
    await waitFor(() => {
      expect(result.current.data).toEqual(mockChat);
    });
    
    expect(fetch).toHaveBeenCalledWith(
      '/api/chats/chat-1',
      expect.any(Object)
    );
  });
  
  it('should handle loading and error states', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network error'));
    
    const { result } = renderHook(() => useChat('chat-1'), { wrapper });
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeUndefined();
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeDefined();
    });
  });
});
```

### 2. integration tests

#### a. api route integration tests
```typescript
// apps/app/src/app/api/chat/__tests__/route.test.ts
import { POST } from '../route';
import { auth } from '@repo/auth/server';
import { mastraAgentService } from '@repo/api';

vi.mock('@repo/auth/server');
vi.mock('@repo/api');

describe('POST /api/chat', () => {
  it('should stream chat response with proper auth', async () => {
    vi.mocked(auth).mockResolvedValue({ 
      userId: 'user-123',
      user: { id: 'internal-1', clerkId: 'user-123' }
    });
    
    const mockStream = new ReadableStream();
    vi.mocked(mastraAgentService.streamMessage).mockResolvedValue(
      new Response(mockStream)
    );
    
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'hello' }],
        threadId: 'thread-1',
        selectedModelId: 'gpt-4'
      })
    });
    
    const response = await POST(request);
    
    expect(response).toBeInstanceOf(Response);
    expect(response.headers.get('content-type')).toContain('stream');
    
    expect(mastraAgentService.streamMessage).toHaveBeenCalledWith('chat', {
      messages: [{ role: 'user', content: 'hello' }],
      threadId: 'thread-1',
      resourceId: 'user-123',
      runtimeContext: expect.objectContaining({
        'chat-model': 'gpt-4'
      })
    });
  });
  
  it('should handle mastra unavailability with fallback', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: 'user-123' });
    vi.mocked(mastraAgentService.streamMessage).mockRejectedValue({
      cause: { code: 'ECONNREFUSED' }
    });
    
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [] })
    });
    
    const response = await POST(request);
    
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.error).toContain('temporarily unavailable');
  });
});
```

#### b. component integration tests
```typescript
// apps/app/src/components/chat/__tests__/ChatInterface.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInterface } from '../ChatInterface';

// mock useChat hook
vi.mock('@ai-sdk/react', () => ({
  useChat: () => ({
    messages: [
      { id: '1', role: 'user', content: 'hello' },
      { id: '2', role: 'assistant', content: 'hi there!' }
    ],
    input: '',
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    isLoading: false
  })
}));

describe('ChatInterface', () => {
  it('should render messages and input', () => {
    render(<ChatInterface />);
    
    expect(screen.getByText('hello')).toBeInTheDocument();
    expect(screen.getByText('hi there!')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('type a message...')).toBeInTheDocument();
  });
  
  it('should handle message submission', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      input: 'test message',
      handleInputChange: vi.fn(),
      handleSubmit,
      isLoading: false
    });
    
    render(<ChatInterface />);
    
    const input = screen.getByPlaceholderText('type a message...');
    await user.type(input, '{enter}');
    
    expect(handleSubmit).toHaveBeenCalled();
  });
});
```

### 3. end-to-end tests

#### a. critical user flows
```typescript
// e2e/chat-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Chat Flow', () => {
  test.beforeEach(async ({ page }) => {
    // login
    await page.goto('/signin');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });
  
  test('should complete full chat interaction with tool calls', async ({ page }) => {
    // start new chat
    await page.click('button:has-text("new chat")');
    
    // send message
    await page.fill('input[placeholder="type a message..."]', 'what is the weather in san francisco?');
    await page.press('input[placeholder="type a message..."]', 'Enter');
    
    // wait for response
    await expect(page.locator('text=searching for weather information')).toBeVisible();
    
    // verify tool call
    await expect(page.locator('[data-tool-name="web_search"]')).toBeVisible();
    
    // verify final response
    await expect(page.locator('text=/\\d+°[CF]/')).toBeVisible({ timeout: 10000 });
    
    // verify persistence
    await page.reload();
    await expect(page.locator('text=what is the weather in san francisco?')).toBeVisible();
  });
  
  test('should handle output creation and versioning', async ({ page }) => {
    await page.goto('/');
    
    // create output
    await page.fill('input[placeholder="type a message..."]', 'write a python hello world script');
    await page.press('input[placeholder="type a message..."]', 'Enter');
    
    // wait for output
    await expect(page.locator('[data-output-type="code"]')).toBeVisible({ timeout: 10000 });
    
    // edit output
    await page.click('button:has-text("edit")');
    await page.fill('textarea', 'print("hello, arbor!")');
    await page.click('button:has-text("save version")');
    
    // verify version history
    await page.click('button:has-text("version history")');
    await expect(page.locator('text=v1')).toBeVisible();
    await expect(page.locator('text=v2')).toBeVisible();
  });
});
```

#### b. error recovery tests
```typescript
// e2e/error-recovery.spec.ts
test.describe('Error Recovery', () => {
  test('should recover from network disconnection', async ({ page, context }) => {
    await page.goto('/');
    
    // simulate offline
    await context.setOffline(true);
    
    // try to send message
    await page.fill('input', 'test message');
    await page.press('input', 'Enter');
    
    // verify offline indicator
    await expect(page.locator('text=offline')).toBeVisible();
    
    // go back online
    await context.setOffline(false);
    
    // verify reconnection
    await expect(page.locator('text=connected')).toBeVisible({ timeout: 5000 });
    
    // verify message sends
    await expect(page.locator('text=test message')).toBeVisible();
  });
  
  test('should handle api errors gracefully', async ({ page, route }) => {
    // intercept api calls
    await route('/api/chat', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'internal server error' })
      });
    });
    
    await page.goto('/');
    await page.fill('input', 'test');
    await page.press('input', 'Enter');
    
    // verify error display
    await expect(page.locator('text=something went wrong')).toBeVisible();
    
    // verify retry button
    await expect(page.locator('button:has-text("retry")')).toBeVisible();
  });
});
```

### 4. performance tests

#### a. load testing with k6
```javascript
// tests/load/chat-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // ramp up
    { duration: '2m', target: 100 },  // sustained load
    { duration: '30s', target: 0 },   // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    errors: ['rate<0.01'],            // error rate under 1%
  },
};

export default function () {
  const payload = JSON.stringify({
    messages: [{ role: 'user', content: 'hello' }],
    threadId: `thread-${__VU}-${__ITER}`,
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.API_TOKEN}`,
    },
  };
  
  const res = http.post('http://localhost:3000/api/chat', payload, params);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  errorRate.add(res.status !== 200);
  
  sleep(1);
}
```

### 5. quality gates

#### a. ci/cd pipeline
```yaml
# .github/workflows/quality-gates.yml
name: Quality Gates

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Type check
        run: pnpm turbo typecheck
        
      - name: Lint
        run: pnpm lint
        
      - name: Unit tests with coverage
        run: pnpm turbo test -- --coverage
        
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          
      - name: Check coverage thresholds
        run: |
          coverage=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$coverage < 80" | bc -l) )); then
            echo "Coverage $coverage% is below 80% threshold"
            exit 1
          fi

  e2e:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Playwright
        run: pnpm playwright install --with-deps
        
      - name: Run E2E tests
        run: pnpm playwright test
        env:
          CI: true
          
      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-results
          path: test-results/

  performance:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - name: Run load tests
        run: |
          docker run --rm \
            -v $PWD:/scripts \
            grafana/k6 run /scripts/tests/load/chat-load.js
```

#### b. pre-commit hooks
```typescript
// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# run type check
pnpm typecheck

# run affected tests
pnpm turbo test --affected

# check test coverage for changed files
pnpm test:coverage --changedSince=main
```

### 6. monitoring and alerting

#### a. test result tracking
```typescript
// tests/utils/reporter.ts
export class TestReporter {
  async onTestComplete(test: TestResult) {
    // send to monitoring service
    await fetch('https://api.monitoring.com/test-results', {
      method: 'POST',
      body: JSON.stringify({
        name: test.name,
        duration: test.duration,
        status: test.status,
        errors: test.errors,
        timestamp: new Date().toISOString()
      })
    });
  }
  
  async onRunComplete(results: TestSuite) {
    const summary = {
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      duration: results.duration,
      coverage: results.coverage
    };
    
    // alert on failures
    if (results.failed > 0) {
      await this.sendAlert({
        type: 'test_failure',
        severity: 'high',
        summary
      });
    }
  }
}
```

## dependencies

- all agents: requires their implementations for testing
- runs in parallel during development

## testing strategy

### test pyramid
- unit tests: 60% (fast, isolated)
- integration tests: 30% (api and component)
- e2e tests: 10% (critical paths only)

### coverage goals
- overall: 85%+ coverage
- critical paths: 95%+ coverage
- new code: 90%+ coverage

## security considerations

- test with security scenarios
- verify auth in all tests
- test input validation
- check for data leaks in errors
- penetration testing quarterly

## effort estimate

**4-5 developer days**

### breakdown:
- day 1: unit test implementation
- day 2: integration tests
- day 3: e2e test suite
- day 4: ci/cd and quality gates
- day 5: performance testing and monitoring

## success metrics

- [ ] 85%+ overall test coverage
- [ ] all critical paths tested
- [ ] <5 min ci/cd pipeline
- [ ] zero flaky tests
- [ ] automated quality gates
- [ ] performance regression detection
- [ ] test results dashboard