import { RuntimeContext } from '@mastra/core/di';

// Runtime context type for apps-ai operations
export type ArborAIRuntimeContext = {
  'chat-model'?: string;
  'openai-api-key'?: string;
  'anthropic-api-key'?: string;
  'google-api-key'?: string;
  'openrouter-api-key'?: string;
  'user-id'?: string;
  'thread-id'?: string;
  'resource-id'?: string;
  [key: string]: any;
};

/**
 * Normalizes a runtime context object to provide a consistent `.get()` method.
 * This handles both plain objects sent from client applications and Mastra's
 * internal RuntimeContext instances.
 *
 * @param runtimeContext The context object received by the agent or tool.
 * @returns An object with a reliable `get` method.
 */
export function normalizeRuntimeContext(runtimeContext: any): {
  get: <K extends keyof ArborAIRuntimeContext>(
    key: K
  ) => ArborAIRuntimeContext[K] | undefined;
} {
  if (!runtimeContext) {
    return { get: () => undefined };
  }

  // The key insight: Mastra wraps the context, but the original properties
  // are still attached directly to the instance. The instance's own `.get()`
  // method might not find them if they weren't set via `.set()`.
  // This new `get` function checks both.
  const get = <K extends keyof ArborAIRuntimeContext>(
    key: K
  ): ArborAIRuntimeContext[K] | undefined => {
    // 1. Try the official .get() method first, if it exists.
    if (typeof runtimeContext.get === 'function') {
      try {
        const value = runtimeContext.get(key);
        if (value !== undefined) {
          return value;
        }
      } catch (_e) {
        // Key might not be in the registry; this is fine.
      }
    }
    // 2. Fallback to direct property access. This is the crucial fix.
    return runtimeContext[key];
  };

  return { get };
}

interface UserData {
  id: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  googleApiKey?: string;
  openrouterApiKey?: string;
}

interface ChatData {
  selectedModelId?: string;
  threadId?: string;
  resourceId?: string;
}

/**
 * Builds runtime context for Mastra agents from user and chat data
 */
export function buildArborAIRuntimeContext(
  user: UserData,
  chat?: ChatData,
  overrides?: Partial<ArborAIRuntimeContext>
): RuntimeContext<ArborAIRuntimeContext> {
  const runtimeContext = new RuntimeContext<ArborAIRuntimeContext>();

  // Set user context
  runtimeContext.set('user-id', user.id);

  // Set API keys if available
  if (user.openaiApiKey) {
    runtimeContext.set('openai-api-key', user.openaiApiKey);
  }
  if (user.anthropicApiKey) {
    runtimeContext.set('anthropic-api-key', user.anthropicApiKey);
  }
  if (user.googleApiKey) {
    runtimeContext.set('google-api-key', user.googleApiKey);
  }
  if (user.openrouterApiKey) {
    runtimeContext.set('openrouter-api-key', user.openrouterApiKey);
  }

  // Set chat context if available
  if (chat) {
    if (chat.selectedModelId) {
      runtimeContext.set('chat-model', chat.selectedModelId);
    }
    if (chat.threadId) {
      runtimeContext.set('thread-id', chat.threadId);
    }
    if (chat.resourceId) {
      runtimeContext.set('resource-id', chat.resourceId);
    }
  }

  // Apply any overrides
  if (overrides) {
    Object.entries(overrides).forEach(([key, value]) => {
      if (value !== undefined) {
        runtimeContext.set(key as keyof ArborAIRuntimeContext, value);
      }
    });
  }

  return runtimeContext;
}

/**
 * Extracts runtime context data from an HTTP request/middleware
 */
export async function extractRuntimeContextFromRequest(
  userId: string,
  fetchUserData: (id: string) => Promise<UserData>,
  fetchChatData?: (threadId: string) => Promise<ChatData>,
  threadId?: string
): Promise<RuntimeContext<ArborAIRuntimeContext>> {
  const user = await fetchUserData(userId);
  const chat = threadId ? await fetchChatData?.(threadId) : undefined;

  return buildArborAIRuntimeContext(user, chat);
}
