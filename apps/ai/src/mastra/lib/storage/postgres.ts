import { PgVector, PostgresStore } from '@mastra/pg';

/**
 * Create PostgreSQL storage for Mastra
 * Uses Neon with pgvector extension for full semantic recall support
 */
export const createPostgresStorage = (_env?: any) => {
  // TEMPORARY: Hardcode for testing
  // Using pooler endpoint for better connection management
  const connectionString =
    'postgresql://neondb_owner:npg_usS7rkAW5yxo@ep-aged-bush-aezodqxf-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
  const store = new PostgresStore({
    connectionString,
  });

  return store;
};

/**
 * Create PostgreSQL vector store for semantic recall
 * Requires pgvector extension to be enabled in the database
 */
export const createPostgresVector = (_env?: any) => {
  // TEMPORARY: Hardcode for testing
  const connectionString =
    'postgresql://neondb_owner:npg_usS7rkAW5yxo@ep-aged-bush-aezodqxf-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
  const vector = new PgVector({
    connectionString,
  });

  return vector;
};
