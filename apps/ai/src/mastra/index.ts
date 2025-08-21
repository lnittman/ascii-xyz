/**
 * Mastra Configuration
 * Using PostgreSQL with pgvector for memory storage
 */

import { Mastra } from '@mastra/core';
import { PinoLogger } from '@mastra/loggers';

// Import agent creators
import { createChatAgent } from './agents/chat/index.js';
import { createCodeAgent } from './agents/code/index.js';
import { createSummarizerAgent } from './agents/summarizer/index.js';

// Import workflows
import { urlSummaryWorkflow } from './workflows/url-summary/index.js';

// Configure structured logging
const logger = new PinoLogger({
  name: 'apps-ai',
  level: 'debug',
});

/**
 * Create Mastra instance with environment support
 */
export const mastra = new Mastra({
  // Register agents with env
  agents: {
    chat: createChatAgent(process.env),
    code: createCodeAgent(process.env),
    summarizer: createSummarizerAgent(process.env),
  },

  // Register workflows
  workflows: {
    urlSummary: urlSummaryWorkflow,
  },

  // Logging configuration
  logger,

  // AI SDK compatibility - set to v4 for now
  aiSdkCompat: 'v4',
});
