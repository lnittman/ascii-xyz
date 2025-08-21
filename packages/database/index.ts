import 'server-only';

import * as path from 'node:path';
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { keys } from './keys';

// Re-export schema
export * as schema from './src/schema';
export * from './src/schema';

// Export generated Zod schemas and types
export * from './src/generated-zod';

// Type for Cloudflare environment with Hyperdrive
interface CloudflareEnv {
  HYPERDRIVE?: {
    connectionString: string;
  };
  DATABASE_URL?: string;
}

// Type for edge runtime context (Vercel Edge, Cloudflare Workers, etc.)
interface EdgeContext {
  env?: CloudflareEnv;
  waitUntil?: (promise: Promise<any>) => void;
}

// Global context that might contain Cloudflare environment
declare global {
  var __env: CloudflareEnv | undefined;
  var __edgeContext: EdgeContext | undefined;
}

// Load environment variables from .env files (for non-Cloudflare environments)
if (typeof process !== 'undefined' && process.env) {
  dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
  dotenv.config({ path: path.resolve(process.cwd(), '../../.env.local') });
}

// Get database URL from keys() for consistency with existing code
const databaseUrl = keys().DATABASE_URL;

// Create singleton instance for postgres connection
const globalForPostgres = global as unknown as { sql: postgres.Sql };

function createPostgresConnection() {
  // In Cloudflare Workers with Hyperdrive
  if (globalThis.__env?.HYPERDRIVE?.connectionString) {
    return postgres(globalThis.__env.HYPERDRIVE.connectionString, {
      max: 1,
      fetch_types: false,
      idle_timeout: 0,
      connect_timeout: 10,
    });
  }

  // Standard connection for non-Cloudflare environments
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  return postgres(databaseUrl, {
    max: 1, // Minimal connections for edge runtime
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

const sql = globalForPostgres.sql || createPostgresConnection();

if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
  globalForPostgres.sql = sql;
}

// Create Drizzle instance
export const db = drizzle(sql);

// Export db as database for backward compatibility
export { db as database };

// Export database as prisma temporarily for services that haven't been updated yet
export { db as prisma };

// Helper to get a db instance for Hyperdrive (used in Cloudflare Workers)
export function getDb(hyperdrive?: { connectionString: string }) {
  if (hyperdrive?.connectionString) {
    const sql = postgres(hyperdrive.connectionString, {
      max: 1,
      fetch_types: false,
      idle_timeout: 0,
      connect_timeout: 10,
    });
    return drizzle(sql);
  }
  return db;
}

// Helper to initialize database with Cloudflare bindings
export function initializeDb(env: CloudflareEnv) {
  if (env.HYPERDRIVE) {
    globalThis.__env = env;
    // Force recreation of the connection with Hyperdrive
    (globalForPostgres as any).sql = null;
    const newSql = createPostgresConnection();
    (globalForPostgres as any).sql = newSql;
    return drizzle(newSql);
  }
  return db;
}

// Export Drizzle ORM functions that are commonly used
export {
  eq,
  and,
  or,
  not,
  sql as sqlOperator,
  desc,
  asc,
  inArray,
  isNull,
  isNotNull,
  gt,
  gte,
  lt,
  lte,
} from 'drizzle-orm';

// Note: Message type is now managed by Mastra storage
// Messages are stored in mastra_messages table
