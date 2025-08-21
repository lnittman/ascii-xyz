// import { revalidateTag } from 'next/cache';

// Cache tags for different data types
export const CACHE_TAGS = {
  USER_DATA: 'user-data',
  CHAT: (id: string) => `chat-${id}`,
  CHATS: 'chats',
  PROJECT: (id: string) => `project-${id}`,
  PROJECTS: 'projects',
  SETTINGS: 'settings',
  AI_SETTINGS: 'ai-settings',
  MODELS: 'models',
  LOGS_SETTINGS: 'logs-settings',
  LOGS_REPOS: 'logs-repos',
} as const;

// Helper to revalidate multiple tags at once
export function revalidateTags(_tags: string[]) {}

// Invalidation helpers for specific operations
export const cacheInvalidation = {
  // Chat operations
  chat: {
    create: () => revalidateTags([CACHE_TAGS.CHATS, CACHE_TAGS.USER_DATA]),
    update: (id: string) =>
      revalidateTags([CACHE_TAGS.CHAT(id), CACHE_TAGS.CHATS]),
    delete: (id: string) =>
      revalidateTags([
        CACHE_TAGS.CHAT(id),
        CACHE_TAGS.CHATS,
        CACHE_TAGS.USER_DATA,
      ]),
  },

  // Project operations
  project: {
    create: () => revalidateTags([CACHE_TAGS.PROJECTS, CACHE_TAGS.USER_DATA]),
    update: (id: string) =>
      revalidateTags([CACHE_TAGS.PROJECT(id), CACHE_TAGS.PROJECTS]),
    delete: (id: string) =>
      revalidateTags([
        CACHE_TAGS.PROJECT(id),
        CACHE_TAGS.PROJECTS,
        CACHE_TAGS.USER_DATA,
      ]),
  },

  // Settings operations
  settings: {
    updateAI: () =>
      revalidateTags([CACHE_TAGS.AI_SETTINGS, CACHE_TAGS.SETTINGS]),
    updateModels: () =>
      revalidateTags([CACHE_TAGS.MODELS, CACHE_TAGS.AI_SETTINGS]),
  },

  // User operations
  user: {
    update: () => revalidateTags([CACHE_TAGS.USER_DATA]),
  },

  // Logs operations
  logs: {
    settings: () => revalidateTags([CACHE_TAGS.LOGS_SETTINGS]),
    repos: () => revalidateTags([CACHE_TAGS.LOGS_REPOS]),
  },
};
