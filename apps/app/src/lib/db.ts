import { db as prismaDb } from '@repo/database';
import { pgTable, text, boolean, timestamp, json } from 'drizzle-orm/pg-core';

// Re-export database client
export const db = prismaDb;

// Define logs-specific tables
export const repositories = pgTable('repositories', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  repoId: text('repoId').notNull().unique(),
  owner: text('owner').notNull(),
  name: text('name').notNull(),
  fullName: text('fullName').notNull(),
  description: text('description'),
  language: text('language'),
  scope: text('scope').notNull().default('github'),
  isPrivate: boolean('isPrivate').default(false),
  defaultBranch: text('defaultBranch').default('main'),
  analysisEnabled: boolean('analysisEnabled').default(false),
  lastActivity: timestamp('lastActivity', { mode: 'date' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});

export const userPreferences = pgTable('userPreferences', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  userId: text('userId').notNull().unique(),
  globalLogsEnabled: boolean('globalLogsEnabled').default(true),
  metadata: json('metadata'),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});

// Types for logs system
export interface ActivityLog {
  id: string;
  userId: string;
  date: Date;
  summary: string;
  totalCommits: number;
  totalPullRequests: number;
  totalIssues: number;
  repositories: string[];
  metadata?: {
    totalCommits?: number;
    totalPullRequests?: number;
    totalIssues?: number;
    totalRepos?: number;
    languages?: string[];
  };
  bullets?: string[];
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityDetail {
  id: string;
  logId: string;
  type: 'commit' | 'pull_request' | 'issue' | 'comment' | 'review';
  time: string;
  repository: string;
  description: string;
  title?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface Repository {
  id: string;
  userId: string;
  name: string;
  fullName: string;
  enabled: boolean;
  lastSynced?: Date;
  createdAt: Date;
  updatedAt: Date;
}