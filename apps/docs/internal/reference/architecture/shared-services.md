# Shared Services Architecture

## Overview

This document details the shared services that power both Arbor and Kumori products, providing a unified foundation for authentication, analytics, storage, and other critical platform capabilities.

## Shared Services Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Shared Services Layer                       │
├─────────────────────┬───────────────────┬──────────────────────┤
│   Authentication    │     Analytics     │      Storage         │
│      (Clerk)        │    (PostHog)      │  (Cloudflare R2)    │
├─────────────────────┼───────────────────┼──────────────────────┤
│     Monitoring      │     Database      │    AI Providers      │
│     (Sentry)        │   (Neon PG)       │  (OpenAI/Claude)    │
├─────────────────────┼───────────────────┼──────────────────────┤
│      Billing        │      Email        │      Queuing        │
│     (Stripe)        │    (Resend)       │   (Inngest/BullMQ)  │
└─────────────────────┴───────────────────┴──────────────────────┘
```

## 1. Authentication Service (Clerk)

### Architecture

```typescript
// Shared authentication service
interface AuthenticationService {
  provider: 'Clerk';
  
  configuration: {
    // Unified user model
    userModel: {
      id: string;
      email: string;
      username?: string;
      profile: {
        firstName?: string;
        lastName?: string;
        avatar?: string;
        bio?: string;
      };
      metadata: {
        products: ProductAccess[];
        preferences: UserPreferences;
        limits: UsageLimits;
      };
    };
    
    // Product-specific access
    productAccess: {
      arbor: {
        roles: ['user', 'pro', 'enterprise'];
        permissions: string[];
        quotas: ResourceQuotas;
      };
      kumori: {
        roles: ['free', 'premium', 'creator'];
        permissions: string[];
        quotas: ResourceQuotas;
      };
    };
  };
}
```

### Implementation

```typescript
// apps/packages/auth/src/index.ts
import { auth, currentUser } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';

export class SharedAuthService {
  // Get current user with product access
  async getCurrentUser() {
    const user = await currentUser();
    if (!user) return null;
    
    const metadata = await this.getUserMetadata(user.id);
    return {
      ...user,
      products: metadata.products,
      isArborUser: metadata.products.includes('arbor'),
      isKumoriUser: metadata.products.includes('kumori'),
    };
  }
  
  // Check product access
  async hasProductAccess(userId: string, product: 'arbor' | 'kumori') {
    const user = await clerkClient.users.getUser(userId);
    const metadata = user.publicMetadata as UserMetadata;
    return metadata.products?.includes(product) ?? false;
  }
  
  // Update user subscription
  async updateSubscription(
    userId: string, 
    product: 'arbor' | 'kumori',
    tier: string
  ) {
    await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        [`${product}_tier`]: tier,
        [`${product}_updated_at`]: new Date().toISOString(),
      },
    });
  }
}
```

### Features

- **Single Sign-On (SSO)**: One account for all products
- **Social Login**: Google, GitHub, Discord integration
- **Multi-Factor Authentication**: SMS, TOTP, backup codes
- **Session Management**: Secure, cross-domain sessions
- **User Management**: Profile, preferences, settings

## 2. Analytics Service (PostHog)

### Architecture

```typescript
// Shared analytics service
interface AnalyticsService {
  provider: 'PostHog';
  
  events: {
    // User events
    user: {
      signed_up: { product: string; method: string };
      logged_in: { product: string };
      upgraded: { product: string; from_tier: string; to_tier: string };
    };
    
    // Product events
    arbor: {
      agent_created: { agent_id: string; type: string };
      agent_executed: { agent_id: string; duration: number };
      tool_used: { tool_name: string; success: boolean };
    };
    
    kumori: {
      image_generated: { filter_id: string; duration: number };
      filter_applied: { filter_name: string };
      image_shared: { platform: string };
    };
  };
  
  dashboards: {
    platform_overview: MetricsDashboard;
    product_analytics: MetricsDashboard;
    user_journey: MetricsDashboard;
  };
}
```

### Implementation

```typescript
// packages/analytics/src/index.ts
import { PostHog } from 'posthog-node';

export class SharedAnalytics {
  private posthog: PostHog;
  
  constructor() {
    this.posthog = new PostHog(process.env.POSTHOG_API_KEY!, {
      host: process.env.POSTHOG_HOST,
    });
  }
  
  // Track cross-product events
  async trackEvent(event: AnalyticsEvent) {
    const enrichedEvent = {
      ...event,
      timestamp: new Date(),
      environment: process.env.NODE_ENV,
      version: process.env.APP_VERSION,
    };
    
    await this.posthog.capture(enrichedEvent);
  }
  
  // User identification
  async identifyUser(userId: string, traits: UserTraits) {
    await this.posthog.identify({
      distinctId: userId,
      properties: {
        ...traits,
        products: traits.products,
        total_spend: await this.calculateTotalSpend(userId),
        lifetime_value: await this.calculateLTV(userId),
      },
    });
  }
  
  // Feature flags
  async getFeatureFlags(userId: string): Promise<FeatureFlags> {
    return await this.posthog.getAllFlags(userId);
  }
}
```

### Key Metrics

```yaml
# Platform-wide metrics
metrics:
  user_metrics:
    - daily_active_users
    - monthly_active_users
    - user_retention_rate
    - churn_rate
    - lifetime_value
    
  product_metrics:
    arbor:
      - agents_created_per_user
      - average_session_duration
      - tool_usage_frequency
      - api_calls_per_user
      
    kumori:
      - images_generated_per_user
      - filter_popularity
      - generation_success_rate
      - share_rate
      
  business_metrics:
    - monthly_recurring_revenue
    - average_revenue_per_user
    - customer_acquisition_cost
    - conversion_rate
```

## 3. Storage Services

### Cloudflare R2 (Object Storage)

```typescript
// Shared object storage service
interface ObjectStorageService {
  provider: 'Cloudflare R2';
  
  buckets: {
    // Shared assets
    'platform-assets': {
      purpose: 'Shared images, logos, resources';
      access: 'public-read';
      lifecycle: 'permanent';
    };
    
    // Arbor storage
    'arbor-artifacts': {
      purpose: 'Agent outputs, documents, files';
      access: 'private';
      lifecycle: {
        hot: '0-30 days';
        warm: '31-90 days';
        cold: '91+ days';
      };
    };
    
    // Kumori storage
    'kumori-images': {
      purpose: 'Generated images';
      access: 'private';
      cdn: true;
      lifecycle: {
        hot: '0-7 days';
        warm: '8-30 days';
        cold: '31+ days';
      };
    };
  };
}
```

### Implementation

```typescript
// packages/storage/src/r2-client.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class R2StorageClient {
  private client: S3Client;
  
  constructor() {
    this.client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  
  // Upload file with metadata
  async uploadFile(
    bucket: string,
    key: string,
    data: Buffer | Uint8Array | string,
    metadata?: Record<string, string>
  ) {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: data,
      Metadata: {
        ...metadata,
        uploadedAt: new Date().toISOString(),
        product: this.detectProduct(bucket),
      },
    });
    
    return await this.client.send(command);
  }
  
  // Generate signed URL for secure access
  async getSignedUrl(bucket: string, key: string, expiresIn = 3600) {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    
    return await getSignedUrl(this.client, command, { expiresIn });
  }
}
```

### Vercel Blob Storage

```typescript
// Temporary file storage
interface BlobStorageService {
  provider: 'Vercel Blob';
  
  usage: {
    'temp-uploads': 'User uploads before processing';
    'preview-files': 'Temporary preview generation';
    'export-queue': 'Files awaiting export';
  };
  
  configuration: {
    maxFileSize: '50MB';
    ttl: '24 hours';
    regions: ['iad1', 'sfo1'];
  };
}
```

## 4. Database Service (Neon PostgreSQL)

### Architecture

```sql
-- Shared database schemas
CREATE SCHEMA shared;
CREATE SCHEMA arbor;
CREATE SCHEMA kumori;

-- Shared tables
CREATE TABLE shared.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE shared.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES shared.users(id),
    product VARCHAR(50) NOT NULL,
    tier VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE TABLE shared.usage_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES shared.users(id),
    product VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    value NUMERIC NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

### Connection Management

```typescript
// packages/database/src/index.ts
import { Pool } from '@neondatabase/serverless';

export class SharedDatabase {
  private pools: Map<string, Pool> = new Map();
  
  constructor() {
    // Initialize connection pools
    this.pools.set('shared', this.createPool('shared'));
    this.pools.set('arbor', this.createPool('arbor'));
    this.pools.set('kumori', this.createPool('kumori'));
  }
  
  private createPool(schema: string): Pool {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: true,
      options: `-c search_path=${schema},public`,
    });
  }
  
  // Get pool for specific schema
  getPool(schema: 'shared' | 'arbor' | 'kumori'): Pool {
    return this.pools.get(schema)!;
  }
  
  // Shared user operations
  async getOrCreateUser(clerkId: string, email: string) {
    const pool = this.getPool('shared');
    
    const result = await pool.query(
      `INSERT INTO users (clerk_id, email) 
       VALUES ($1, $2) 
       ON CONFLICT (clerk_id) 
       DO UPDATE SET updated_at = NOW() 
       RETURNING *`,
      [clerkId, email]
    );
    
    return result.rows[0];
  }
}
```

## 5. AI Provider Service

### Architecture

```typescript
// Centralized AI provider management
interface AIProviderService {
  providers: {
    openai: {
      models: ['gpt-4-turbo', 'gpt-3.5-turbo', 'dall-e-3'];
      rateLimit: { rpm: 10000; tpm: 1000000 };
    };
    
    anthropic: {
      models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'];
      rateLimit: { rpm: 5000; tpm: 500000 };
    };
    
    replicate: {
      models: ['sdxl', 'controlnet', 'whisper'];
      billing: 'per-second';
    };
  };
  
  routing: {
    strategy: 'cost-optimized' | 'performance' | 'balanced';
    fallbacks: boolean;
    caching: boolean;
  };
}
```

### Implementation

```typescript
// packages/ai/src/provider-manager.ts
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import Replicate from 'replicate';

export class AIProviderManager {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private replicate: Replicate;
  private usage: Map<string, UsageMetrics> = new Map();
  
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
  }
  
  // Intelligent routing
  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const provider = this.selectProvider(request);
    
    try {
      const response = await this.executeWithProvider(provider, request);
      await this.trackUsage(provider, request, response);
      return response;
    } catch (error) {
      // Fallback to alternative provider
      if (request.allowFallback) {
        const fallbackProvider = this.getFallbackProvider(provider);
        return await this.executeWithProvider(fallbackProvider, request);
      }
      throw error;
    }
  }
  
  // Cost-optimized provider selection
  private selectProvider(request: CompletionRequest): AIProvider {
    const { complexity, maxTokens, urgency } = request;
    
    // Simple requests -> cheaper models
    if (complexity === 'low' && maxTokens < 1000) {
      return { provider: 'openai', model: 'gpt-3.5-turbo' };
    }
    
    // Complex requests -> powerful models
    if (complexity === 'high' || maxTokens > 4000) {
      return { provider: 'anthropic', model: 'claude-3-opus' };
    }
    
    // Balanced approach
    return { provider: 'anthropic', model: 'claude-3-sonnet' };
  }
}
```

## 6. Monitoring Service (Sentry)

### Configuration

```typescript
// Shared error tracking and performance monitoring
interface MonitoringService {
  provider: 'Sentry';
  
  configuration: {
    dsn: {
      arbor: process.env.SENTRY_DSN_ARBOR;
      kumori: process.env.SENTRY_DSN_KUMORI;
    };
    
    features: {
      errorTracking: true;
      performanceMonitoring: true;
      sessionReplay: true;
      profilesSampling: 0.1;
    };
    
    integrations: [
      'Next.js',
      'Prisma',
      'tRPC',
      'Node',
    ];
  };
}
```

### Implementation

```typescript
// packages/monitoring/src/index.ts
import * as Sentry from '@sentry/nextjs';

export class SharedMonitoring {
  static initialize(product: 'arbor' | 'kumori') {
    Sentry.init({
      dsn: process.env[`SENTRY_DSN_${product.toUpperCase()}`],
      environment: process.env.NODE_ENV,
      
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: 0.1,
      
      integrations: [
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      
      beforeSend(event, hint) {
        // Filter sensitive data
        if (event.request?.cookies) {
          delete event.request.cookies;
        }
        return event;
      },
    });
  }
  
  // Custom error context
  static setUserContext(user: User) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
      products: user.products,
    });
  }
  
  // Performance tracking
  static startTransaction(name: string, op: string) {
    return Sentry.startTransaction({ name, op });
  }
}
```

## 7. Email Service (Resend)

### Architecture

```typescript
// Shared email service
interface EmailService {
  provider: 'Resend';
  
  templates: {
    // Shared templates
    welcome: { subject: 'Welcome to our platform!' };
    passwordReset: { subject: 'Reset your password' };
    
    // Product templates
    arbor: {
      agentComplete: { subject: 'Your agent has finished processing' };
      quotaWarning: { subject: 'API quota warning' };
    };
    
    kumori: {
      generationComplete: { subject: 'Your image is ready!' };
      newFollower: { subject: 'You have a new follower' };
    };
  };
  
  configuration: {
    from: 'noreply@platform.com';
    replyTo: 'support@platform.com';
    batchSize: 1000;
  };
}
```

### Implementation

```typescript
// packages/email/src/index.ts
import { Resend } from 'resend';
import { render } from '@react-email/render';

export class SharedEmailService {
  private resend: Resend;
  
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }
  
  // Send transactional email
  async sendEmail(params: EmailParams) {
    const { to, template, data, product } = params;
    
    // Load and render template
    const Template = await this.loadTemplate(template, product);
    const html = render(<Template {...data} />);
    
    // Add tracking
    const trackingData = {
      product,
      template,
      userId: data.userId,
      timestamp: new Date().toISOString(),
    };
    
    return await this.resend.emails.send({
      from: this.getFromAddress(product),
      to,
      subject: this.getSubject(template, data),
      html,
      headers: {
        'X-Entity-Ref-ID': trackingData.userId,
      },
    });
  }
  
  // Batch email sending
  async sendBatch(emails: EmailParams[]) {
    const batches = this.chunk(emails, 1000);
    
    for (const batch of batches) {
      await this.resend.batch.send(
        batch.map(email => this.prepareEmail(email))
      );
    }
  }
}
```

## 8. Queue Service (Inngest/BullMQ)

### Architecture

```typescript
// Shared queue service for background jobs
interface QueueService {
  providers: {
    inngest: 'Long-running workflows';
    bullmq: 'High-throughput jobs';
  };
  
  queues: {
    // Shared queues
    email: { provider: 'bullmq'; concurrency: 100 };
    webhooks: { provider: 'bullmq'; concurrency: 50 };
    
    // Arbor queues
    agentExecution: { provider: 'inngest'; timeout: '30m' };
    memoryProcessing: { provider: 'bullmq'; concurrency: 20 };
    
    // Kumori queues
    imageGeneration: { provider: 'inngest'; timeout: '5m' };
    thumbnailCreation: { provider: 'bullmq'; concurrency: 50 };
  };
}
```

### Implementation

```typescript
// packages/queue/src/index.ts
import { Inngest } from 'inngest';
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

export class SharedQueueService {
  private inngest: Inngest;
  private redis: Redis;
  private queues: Map<string, Queue> = new Map();
  
  constructor() {
    this.inngest = new Inngest({ id: 'platform' });
    this.redis = new Redis(process.env.REDIS_URL!);
  }
  
  // Define Inngest function for long-running tasks
  defineWorkflow(name: string, handler: WorkflowHandler) {
    return this.inngest.createFunction(
      { id: name, retries: 3 },
      { event: `${name}.requested` },
      handler
    );
  }
  
  // Create BullMQ queue for high-throughput
  createQueue(name: string, processor: JobProcessor) {
    const queue = new Queue(name, { connection: this.redis });
    this.queues.set(name, queue);
    
    // Create worker
    new Worker(name, processor, {
      connection: this.redis,
      concurrency: this.getConcurrency(name),
    });
    
    return queue;
  }
  
  // Add job with product context
  async addJob(queueName: string, data: any, product: string) {
    const queue = this.queues.get(queueName);
    if (!queue) throw new Error(`Queue ${queueName} not found`);
    
    return await queue.add(`${product}:${queueName}`, {
      ...data,
      _metadata: {
        product,
        timestamp: Date.now(),
        version: process.env.APP_VERSION,
      },
    });
  }
}
```

## 9. Billing Service (Stripe)

### Architecture

```typescript
// Unified billing across products
interface BillingService {
  provider: 'Stripe';
  
  products: {
    arbor: {
      tiers: ['free', 'pro', 'enterprise'];
      billing: 'usage-based';
      metrics: ['api_calls', 'agents', 'storage'];
    };
    
    kumori: {
      tiers: ['free', 'premium', 'creator'];
      billing: 'subscription';
      features: ['generations', 'filters', 'export_quality'];
    };
  };
  
  features: {
    unifiedBilling: true;
    multiProductDiscounts: true;
    usageTracking: true;
    invoicing: true;
  };
}
```

### Implementation

```typescript
// packages/billing/src/index.ts
import Stripe from 'stripe';

export class SharedBillingService {
  private stripe: Stripe;
  
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20',
    });
  }
  
  // Create unified customer
  async createCustomer(user: User) {
    const customer = await this.stripe.customers.create({
      email: user.email,
      metadata: {
        userId: user.id,
        products: JSON.stringify(user.products),
      },
    });
    
    return customer;
  }
  
  // Handle multi-product subscriptions
  async createSubscription(
    customerId: string,
    products: ProductSubscription[]
  ) {
    const items = products.map(product => ({
      price: this.getPriceId(product.product, product.tier),
      quantity: 1,
      metadata: {
        product: product.product,
        tier: product.tier,
      },
    }));
    
    return await this.stripe.subscriptions.create({
      customer: customerId,
      items,
      expand: ['latest_invoice.payment_intent'],
    });
  }
  
  // Track usage for billing
  async recordUsage(
    subscriptionItemId: string,
    quantity: number,
    product: string
  ) {
    return await this.stripe.subscriptionItems.createUsageRecord(
      subscriptionItemId,
      {
        quantity,
        timestamp: Math.floor(Date.now() / 1000),
        action: 'increment',
      }
    );
  }
}
```

## Best Practices

### 1. Service Isolation
- Each service has its own configuration and secrets
- Services communicate through well-defined interfaces
- Failure in one service doesn't cascade

### 2. Monitoring & Observability
- All services emit structured logs
- Metrics are collected consistently
- Distributed tracing across services

### 3. Cost Management
- Resource pooling for efficiency
- Usage tracking and alerts
- Regular optimization reviews

### 4. Security
- Service-to-service authentication
- Encrypted communication
- Regular security audits

### 5. Scalability
- Horizontal scaling for all services
- Auto-scaling based on metrics
- Performance benchmarking

## Conclusion

These shared services provide a robust foundation for both Arbor and Kumori, enabling:
- **Unified User Experience**: Single account, consistent features
- **Operational Efficiency**: Shared monitoring, logging, and alerts
- **Cost Optimization**: Resource pooling and bulk pricing
- **Rapid Development**: Reusable components and services
- **Platform Synergies**: Cross-product features and insights