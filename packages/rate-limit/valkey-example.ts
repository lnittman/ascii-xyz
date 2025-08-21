import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from 'ioredis'; // Works with Valkey!

// Valkey is 100% Redis protocol compatible
// So you can use any Redis client library
const valkey = new Redis({
  host: process.env.VALKEY_HOST || 'localhost',
  port: 6379,
  // Valkey supports all Redis features
  maxRetriesPerRequest: 3,
});

// Custom adapter for @upstash/ratelimit to use Valkey
class ValkeyAdapter {
  constructor(private client: Redis) {}

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async eval(script: string, keys: string[], args: any[]): Promise<any> {
    return this.client.eval(script, keys.length, ...keys, ...args);
  }

  async zadd(key: string, ...args: any[]): Promise<number> {
    return this.client.zadd(key, ...args);
  }

  async zremrangebyscore(key: string, min: number, max: number): Promise<number> {
    return this.client.zremrangebyscore(key, min, max);
  }

  async zcard(key: string): Promise<number> {
    return this.client.zcard(key);
  }
}

// Now you can use Valkey with @upstash/ratelimit algorithms
export const createValkeyRateLimiter = () => {
  const adapter = new ValkeyAdapter(valkey);
  
  return {
    api: new Ratelimit({
      redis: adapter as any,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      prefix: 'logs:api',
    }),
    
    chat: new Ratelimit({
      redis: adapter as any,
      limiter: Ratelimit.slidingWindow(20, '1 m'),
      prefix: 'logs:chat',
    }),
    
    ai: new Ratelimit({
      redis: adapter as any,
      limiter: Ratelimit.tokenBucket(10, '1 h', 10),
      prefix: 'logs:ai',
    }),
  };
};