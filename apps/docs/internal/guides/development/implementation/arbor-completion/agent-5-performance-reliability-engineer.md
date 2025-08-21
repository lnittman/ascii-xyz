# agent 5: performance & reliability engineer
*"making every interaction feel instant"*

## scope

this agent optimizes streaming performance, implements robust error handling, and ensures graceful recovery from failures. the goal is to make arbor feel instantaneous and bulletproof, maintaining user trust through reliable performance.

## packages to modify

- `apps/app` - streaming optimizations, error boundaries, retry logic
- `packages/api` - response caching, connection pooling
- `apps/ai` - model fallbacks, timeout handling
- `packages/design` - loading states, error ui components

## implementation details

### 1. streaming optimizations

#### a. chunk batching and throttling
```typescript
// apps/app/src/hooks/chat/useOptimizedChat.ts
import { useChat as useBaseChat } from '@ai-sdk/react';

export function useOptimizedChat(options: UseChatOptions) {
  const [bufferedMessages, setBufferedMessages] = useState<Message[]>([]);
  const batchTimeoutRef = useRef<NodeJS.Timeout>();
  
  const baseChat = useBaseChat({
    ...options,
    experimental_throttle: 50, // throttle updates to 50ms
    onFinish: (message, { usage, finishReason }) => {
      // track performance metrics
      trackChatMetrics({
        messageId: message.id,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        finishReason,
        streamDuration: Date.now() - streamStartRef.current
      });
      
      options.onFinish?.(message, { usage, finishReason });
    }
  });
  
  // batch message updates
  useEffect(() => {
    if (baseChat.messages.length > bufferedMessages.length) {
      clearTimeout(batchTimeoutRef.current);
      
      batchTimeoutRef.current = setTimeout(() => {
        setBufferedMessages(baseChat.messages);
      }, 16); // ~60fps update rate
    }
  }, [baseChat.messages]);
  
  return {
    ...baseChat,
    messages: bufferedMessages
  };
}
```

#### b. virtual scrolling for long conversations
```typescript
// apps/app/src/components/chat/VirtualMessageList.tsx
import { VirtualList } from '@tanstack/react-virtual';

export function VirtualMessageList({ messages }: { messages: Message[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 120, []), // estimated message height
    overscan: 5,
    onChange: (instance) => {
      // detect if user scrolled up
      const element = instance.scrollElement;
      if (element) {
        const isAtBottom = 
          element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
        setShouldAutoScroll(isAtBottom);
      }
    }
  });
  
  // auto-scroll to bottom on new messages
  useEffect(() => {
    if (shouldAutoScroll && messages.length > 0) {
      virtualizer.scrollToIndex(messages.length - 1, {
        behavior: 'smooth'
      });
    }
  }, [messages.length, shouldAutoScroll]);
  
  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const message = messages[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`
              }}
            >
              <MessageComponent message={message} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### 2. intelligent error handling

#### a. error boundary with recovery
```typescript
// apps/app/src/components/ErrorBoundary.tsx
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorCount: 0,
      lastErrorTime: 0
    };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const now = Date.now();
    const state = {
      hasError: true,
      error,
      errorCount: 1,
      lastErrorTime: now
    };
    
    // detect error loops
    const storedState = sessionStorage.getItem('errorBoundaryState');
    if (storedState) {
      const { errorCount, lastErrorTime } = JSON.parse(storedState);
      if (now - lastErrorTime < 5000) { // within 5 seconds
        state.errorCount = errorCount + 1;
      }
    }
    
    sessionStorage.setItem('errorBoundaryState', JSON.stringify(state));
    return state;
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // log to monitoring service
    logError(error, {
      ...errorInfo,
      errorCount: this.state.errorCount,
      userId: this.props.userId
    });
  }
  
  render() {
    if (this.state.hasError) {
      // catastrophic failure after multiple errors
      if (this.state.errorCount > 3) {
        return <CatastrophicError onReset={this.handleReset} />;
      }
      
      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          onReset={this.handleReset}
        />
      );
    }
    
    return this.props.children;
  }
  
  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };
  
  handleReset = () => {
    sessionStorage.removeItem('errorBoundaryState');
    window.location.reload();
  };
}
```

#### b. api error recovery
```typescript
// packages/api/utils/resilientFetch.ts
export async function resilientFetch<T>(
  url: string,
  options?: RequestInit,
  retryOptions?: RetryOptions
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryableStatuses = [408, 429, 500, 502, 503, 504]
  } = retryOptions || {};
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(30000) // 30s timeout
      });
      
      if (!response.ok && retryableStatuses.includes(response.status)) {
        throw new RetryableError(
          `HTTP ${response.status}`,
          response.status
        );
      }
      
      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}`,
          response.status
        );
      }
      
      return await response.json();
      
    } catch (error: any) {
      lastError = error;
      
      // don't retry non-retryable errors
      if (!(error instanceof RetryableError) && attempt === maxRetries) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        const delay = Math.min(
          initialDelay * Math.pow(backoffFactor, attempt),
          maxDelay
        );
        
        console.warn(
          `retry ${attempt + 1}/${maxRetries} after ${delay}ms:`,
          error.message
        );
        
        await sleep(delay);
      }
    }
  }
  
  throw lastError || new Error('max retries exceeded');
}
```

### 3. model fallback system

#### a. intelligent model switching
```typescript
// apps/ai/src/mastra/utils/modelFallback.ts
export class ModelFallbackManager {
  private modelTiers = [
    // primary tier
    ['anthropic/claude-sonnet-4', 'openai/gpt-4o'],
    // fallback tier
    ['anthropic/claude-3-haiku', 'openai/gpt-3.5-turbo'],
    // emergency tier
    ['google/gemini-2.0-flash', 'meta/llama-3.3-70b']
  ];
  
  async executeWithFallback(
    fn: (model: string) => Promise<any>,
    context: { runtimeContext: ModelRuntimeContext }
  ): Promise<any> {
    const errors: Array<{ model: string; error: Error }> = [];
    
    for (const tier of this.modelTiers) {
      for (const model of tier) {
        try {
          // check if user has api key for this provider
          if (!this.hasApiKeyForModel(model, context.runtimeContext)) {
            continue;
          }
          
          console.log(`attempting with model: ${model}`);
          const result = await fn(model);
          
          // track successful model
          trackModelUsage({ model, success: true });
          
          return result;
          
        } catch (error: any) {
          errors.push({ model, error });
          
          // immediate retry for rate limits with backoff
          if (error.status === 429) {
            const retryAfter = error.headers?.['retry-after'];
            if (retryAfter) {
              await sleep(parseInt(retryAfter) * 1000);
              continue;
            }
          }
          
          trackModelUsage({ model, success: false, error: error.message });
        }
      }
    }
    
    // all models failed
    throw new AggregateError(
      errors.map(e => e.error),
      'all models failed: ' + errors.map(e => `${e.model}: ${e.error.message}`).join(', ')
    );
  }
  
  private hasApiKeyForModel(model: string, context: ModelRuntimeContext): boolean {
    const provider = getProvider(model);
    const keyMap = {
      'openai': context['openai-api-key'],
      'anthropic': context['anthropic-api-key'],
      'google': context['google-api-key'],
      'openrouter': context['openrouter-api-key']
    };
    
    return !!keyMap[provider as keyof typeof keyMap];
  }
}
```

#### b. graceful degradation
```typescript
// apps/app/src/app/api/chat/route.ts
export const POST = withErrorHandling(
  withAuthenticatedUser(async function handleChatRequest(
    request: NextRequest,
    context: { user: AuthenticatedUser }
  ): Promise<Response> {
    try {
      // primary path with full features
      return await mastraAgentService.streamMessage('chat', {
        messages,
        threadId,
        resourceId,
        runtimeContext
      });
      
    } catch (error: any) {
      // fallback to basic streaming without memory
      if (error.code === 'MASTRA_UNAVAILABLE') {
        console.warn('mastra unavailable, using fallback');
        
        return streamText({
          model: openrouter('anthropic/claude-3-haiku'),
          messages: convertToCoreMessages(messages),
          maxSteps: 1 // disable tool calling in degraded mode
        }).toDataStreamResponse();
      }
      
      throw error;
    }
  })
);
```

### 4. connection resilience

#### a. websocket reconnection manager
```typescript
// apps/app/src/lib/websocket/ReconnectingWebSocket.ts
export class ReconnectingWebSocket extends EventTarget {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageQueue: any[] = [];
  
  constructor(
    private url: string,
    private options: ReconnectOptions = {}
  ) {
    super();
    this.connect();
  }
  
  private connect() {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        console.log('websocket connected');
        this.dispatchEvent(new Event('open'));
        
        // flush queued messages
        while (this.messageQueue.length > 0) {
          const message = this.messageQueue.shift();
          this.send(message);
        }
        
        this.startHeartbeat();
      };
      
      this.ws.onclose = (event) => {
        this.dispatchEvent(new CloseEvent('close', event));
        this.scheduleReconnect();
      };
      
      this.ws.onerror = (event) => {
        this.dispatchEvent(new Event('error'));
      };
      
      this.ws.onmessage = (event) => {
        this.resetHeartbeat();
        this.dispatchEvent(new MessageEvent('message', event));
      };
      
    } catch (error) {
      this.scheduleReconnect();
    }
  }
  
  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      // queue message for later
      this.messageQueue.push(data);
      
      // limit queue size
      if (this.messageQueue.length > 100) {
        this.messageQueue.shift();
      }
    }
  }
  
  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    
    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts),
      30000
    );
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }
}
```

### 5. performance monitoring

#### a. client-side metrics
```typescript
// apps/app/src/lib/monitoring/performance.ts
export class PerformanceMonitor {
  private metrics = new Map<string, PerformanceMetric>();
  
  startTimer(name: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
    };
  }
  
  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        count: 0,
        total: 0,
        min: Infinity,
        max: -Infinity,
        values: []
      });
    }
    
    const metric = this.metrics.get(name)!;
    metric.count++;
    metric.total += value;
    metric.min = Math.min(metric.min, value);
    metric.max = Math.max(metric.max, value);
    metric.values.push(value);
    
    // keep last 100 values
    if (metric.values.length > 100) {
      metric.values.shift();
    }
    
    // report to analytics
    if (metric.count % 10 === 0) {
      this.reportMetrics(name, metric);
    }
  }
  
  private reportMetrics(name: string, metric: PerformanceMetric) {
    const p50 = this.percentile(metric.values, 0.5);
    const p95 = this.percentile(metric.values, 0.95);
    const p99 = this.percentile(metric.values, 0.99);
    
    analytics.track('performance_metric', {
      name,
      count: metric.count,
      mean: metric.total / metric.count,
      min: metric.min,
      max: metric.max,
      p50,
      p95,
      p99
    });
  }
}

// usage in components
export function ChatInterface() {
  const monitor = usePerformanceMonitor();
  
  const handleSubmit = async () => {
    const endTimer = monitor.startTimer('chat_response_time');
    
    try {
      await sendMessage();
    } finally {
      endTimer();
    }
  };
}
```

#### b. server-side tracing
```typescript
// packages/api/middleware/tracing.ts
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

export function withTracing(name: string) {
  return function decorator(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const tracer = trace.getTracer('arbor-api');
      const span = tracer.startSpan(name);
      
      return context.with(
        trace.setSpan(context.active(), span),
        async () => {
          try {
            const result = await originalMethod.apply(this, args);
            span.setStatus({ code: SpanStatusCode.OK });
            return result;
          } catch (error: any) {
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: error.message
            });
            span.recordException(error);
            throw error;
          } finally {
            span.end();
          }
        }
      );
    };
    
    return descriptor;
  };
}
```

## dependencies

- all agents: integration testing with optimizations
- coordinates with agent 3 for websocket patterns

## testing strategy

### unit tests
- retry logic with various failure modes
- model fallback scenarios
- performance metric calculations

### integration tests
- full error recovery flows
- streaming performance
- connection resilience

### load tests
- 100+ concurrent users
- message streaming at scale
- error recovery under load

## security considerations

- prevent error message leakage
- rate limit retry attempts
- validate websocket connections
- sanitize error logs
- protect against dos via errors

## effort estimate

**5-6 developer days**

### breakdown:
- day 1-2: streaming optimizations
- day 2-3: error handling system
- day 3-4: model fallbacks
- day 4-5: connection resilience
- day 5-6: monitoring and testing

## success metrics

- [ ] <100ms ui response time
- [ ] <2s time to first token
- [ ] 99.9% uptime with fallbacks
- [ ] zero unhandled errors
- [ ] automatic recovery from all failure modes
- [ ] p95 latency <500ms
- [ ] memory usage <200mb