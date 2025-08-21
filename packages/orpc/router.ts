import { os, ORPCError } from '@orpc/server';
import { auth } from '@repo/auth/server';
import { db, eq, schema } from '@repo/database';
import {
  FeedbackService,
  aiSettingsService,
  appearanceSettingsService,
  chatService,
  dataSettingsService,
  llmProviderService,
  logsService,
  modelsService,
  notificationSettingsService,
  outputService,
  profileSettingsService,
  projectService,
  shareService,
  taskService,
  userService,
  workspaceService,
} from '@repo/services';
import type { CreateSharedLinkRequest } from '@repo/services/share';
import { z } from 'zod';
import type { Context, ProtectedContext } from './context';
import { cacheInvalidation } from './lib/cache';

// Create base schema with context
const baseSchema = os.$context<Context>();

// Protected procedure with authentication middleware
const protectedProcedure = baseSchema.use(async ({ context, next }) => {
  // For server actions, get auth from runtime context
  let clerkId = context.clerkId;

  // If no clerkId in context, try to get from auth() for server actions
  if (!clerkId) {
    const authResult = await auth();
    clerkId = authResult.userId || undefined;
  }

  if (!clerkId) {
    throw new ORPCError('UNAUTHORIZED', {
      message: 'Authentication required',
    });
  }

  // Get internal user ID from clerk ID
  const user = await userService.getUserByClerkId(clerkId);
  if (!user) {
    throw new ORPCError('UNAUTHORIZED', {
      message: 'User not found',
    });
  }

  return next({
    context: {
      ...context,
      userId: user.id,
      clerkId: clerkId,
    } as ProtectedContext,
  });
});

const settingsRouter = baseSchema.router({
  data: {
    get: protectedProcedure.handler(async ({ context }) => {
      const ctx = context as ProtectedContext;
      return dataSettingsService.getOrCreateDataSettings(ctx.userId);
    }),

    update: protectedProcedure
      .input(
        z.object({
          hideSharedWarning: z.boolean().optional(),
          dataRetention: z.enum(['7d', '30d', '90d', 'forever']).optional(),
          usageAnalyticsEnabled: z.boolean().optional(),
        })
      )
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        return dataSettingsService.updateDataSettings(ctx.userId, input);
      })
      .actionable(),
  },

  ai: {
    get: protectedProcedure.handler(async ({ context }) => {
      const ctx = context as ProtectedContext;
      return aiSettingsService.getOrCreateAISettings(ctx.userId);
    }),

    update: protectedProcedure
      .input(
        z.object({
          defaultModelId: z.string().optional(),
          customInstructions: z.string().optional(),
          branchFormat: z.string().optional(),
          allowTraining: z.boolean().optional(),
          openaiApiKey: z.string().optional(),
          anthropicApiKey: z.string().optional(),
          googleApiKey: z.string().optional(),
          openrouterApiKey: z.string().optional(),
          enabledModels: z.record(z.any()).optional(),
        })
      )
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        const result = await aiSettingsService.updateAISettings(
          ctx.userId,
          input
        );
        cacheInvalidation.settings.updateAI();
        return result;
      })
      .actionable(),

    // Toggle a specific model's enabled state
    toggleModel: protectedProcedure
      .input(
        z.object({
          modelId: z.string(),
          provider: z.enum(['openai', 'anthropic', 'google', 'openrouter']),
          enabled: z.boolean(),
        })
      )
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        const settings = await aiSettingsService.getOrCreateAISettings(
          ctx.userId
        );

        // Get current enabled models or initialize empty structure
        const currentEnabledModels = (settings.enabledModels as any) || {
          openai: [],
          anthropic: [],
          google: [],
          openrouter: [],
        };

        const providerModels = currentEnabledModels[input.provider] || [];

        let updatedModels;
        if (input.enabled && !providerModels.includes(input.modelId)) {
          updatedModels = [...providerModels, input.modelId];
        } else if (!input.enabled && providerModels.includes(input.modelId)) {
          updatedModels = providerModels.filter(
            (id: string) => id !== input.modelId
          );
        } else {
          updatedModels = providerModels; // No change needed
        }

        const newEnabledModels = {
          ...currentEnabledModels,
          [input.provider]: updatedModels,
        };

        await aiSettingsService.updateAISettings(ctx.userId, {
          enabledModels: newEnabledModels,
        });

        cacheInvalidation.settings.updateAI();

        return { success: true, enabledModels: newEnabledModels };
      })
      .actionable(), // This is a mutation

    // Verify an API key for a provider
    verifyApiKey: protectedProcedure
      .input(
        z.object({
          provider: z.string(),
          apiKey: z.string(),
        })
      )
      .handler(async ({ input }) => {
        return llmProviderService.verifyApiKey(input.provider, input.apiKey);
      })
      .actionable(), // This is a mutation (makes external API call)
  },

  appearance: {
    get: protectedProcedure.handler(async ({ context }) => {
      const ctx = context as ProtectedContext;
      return appearanceSettingsService.getOrCreateAppearanceSettings(
        ctx.userId
      );
    }),

    update: protectedProcedure
      .input(
        z.object({
          fontFamily: z.string().optional(),
        })
      )
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        return appearanceSettingsService.updateAppearanceSettings(
          ctx.userId,
          input
        );
      })
      .actionable(),
  },

  notification: {
    get: protectedProcedure.handler(async ({ context }) => {
      const ctx = context as ProtectedContext;
      return notificationSettingsService.getOrCreateNotificationSettings(
        ctx.userId
      );
    }),

    update: protectedProcedure
      .input(
        z.object({
          notifyProcessingComplete: z.boolean().optional(),
          notifyProcessingFailed: z.boolean().optional(),
          notifyWeeklySummary: z.boolean().optional(),
          notifyFeatureUpdates: z.boolean().optional(),
        })
      )
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        return notificationSettingsService.updateNotificationSettings(
          ctx.userId,
          input
        );
      })
      .actionable(),
  },

  profile: {
    get: protectedProcedure.handler(async ({ context }) => {
      const ctx = context as ProtectedContext;
      return profileSettingsService.getOrCreateProfileSettings(ctx.userId);
    }),

    update: protectedProcedure
      .input(
        z.object({
          displayName: z.string().optional(),
          bio: z.string().optional(),
          avatarUrl: z.string().url().optional(),
          publicProfile: z.boolean().optional(),
        })
      )
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        return profileSettingsService.updateProfileSettings(ctx.userId, input);
      })
      .actionable(),
  },
});

// Main router
export const router = baseSchema.router({
  settings: settingsRouter,

  chat: {
    create: protectedProcedure
      .input(
        z.object({
          prompt: z.string(),
          projectId: z.string().optional(),
          workspaceId: z.string().optional(),
          attachments: z
            .array(
              z.object({
                id: z.string(),
                name: z.string(),
                type: z.string(),
                url: z.string().optional(),
                content: z.string().optional(),
                size: z.number().optional(),
              })
            )
            .optional(),
        })
      )
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        // Create chat with title from prompt (first 50 chars)
        const title =
          input.prompt.slice(0, 50) + (input.prompt.length > 50 ? '...' : '');
        const chat = await chatService.create(
          ctx.userId,
          title,
          input.projectId || null
        );

        // Invalidate cache after creation
        cacheInvalidation.chat.create();

        // Return the chat with the initial prompt data for client to use
        return {
          ...chat,
          initialPrompt: input.prompt,
          attachments: input.attachments,
        };
      })
      .actionable(), // Server action for chat creation
  },

  chats: {
    list: protectedProcedure.handler(async ({ context }) => {
      const ctx = context as ProtectedContext;
      return chatService.getChats(ctx.userId);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        const chat = await chatService.getById(input.id);
        // Verify ownership
        if (chat.userId !== ctx.userId) {
          throw new ORPCError('FORBIDDEN', {
            message: 'You do not have permission to view this chat',
          });
        }
        return chat;
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          projectId: z.string().optional(),
          workspaceId: z.string().optional(),
          model: z.string().optional(),
        })
      )
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        const result = await chatService.create(
          ctx.userId,
          input.name,
          input.projectId || null
        );
        cacheInvalidation.chat.create();
        return result;
      })
      .actionable(), // Server action for mutations

    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().optional(),
          model: z.string().optional(),
        })
      )
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        const { id, name, model } = input;
        let result;
        if (name) {
          result = await chatService.rename(id, ctx.userId, name);
        } else if (model) {
          result = await chatService.updateActiveModel(id, ctx.userId, model);
        } else {
          throw new ORPCError('BAD_REQUEST', {
            message: 'No update fields provided',
          });
        }
        cacheInvalidation.chat.update(id);
        return result;
      })
      .actionable(), // Server action for mutations

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        const result = await chatService.delete(input.id, ctx.userId);
        cacheInvalidation.chat.delete(input.id);
        return result;
      })
      .actionable(), // Server action for mutations

    archive: protectedProcedure
      .input(z.object({ id: z.string() }))
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        const chat = await chatService.getById(input.id);

        if (chat.userId !== ctx.userId) {
          throw new ORPCError('FORBIDDEN', {
            message: 'You do not have permission to archive this chat',
          });
        }

        // Delete the chat (hard delete since no soft delete field exists)
        await db.delete(schema.chats).where(eq(schema.chats.id, input.id));

        return { success: true };
      })
      .actionable(), // Server action for mutations

    syncTitle: protectedProcedure
      .input(z.object({ id: z.string() }))
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        return chatService.syncTitleFromMastra(input.id, ctx.userId);
      })
      .actionable(), // Server action for specialized Mastra sync

    messages: protectedProcedure
      .input(z.object({ chatId: z.string() }))
      .handler(async ({ input, context }) => {
        const _ctx = context as ProtectedContext;
        return chatService.getChatMessages(input.chatId);
      }),
  },

  projects: {
    list: protectedProcedure.handler(async ({ context }) => {
      const ctx = context as ProtectedContext;
      return projectService.getProjects(ctx.userId);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        const project = await projectService.getById(input.id);
        // Verify ownership
        if (project.userId !== ctx.userId) {
          throw new ORPCError('FORBIDDEN', {
            message: 'You do not have permission to view this project',
          });
        }
        return project;
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          icon: z.string().optional(),
          instructions: z.string().optional(),
        })
      )
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        const result = await projectService.createProject(ctx.userId, {
          name: input.name,
          description: input.instructions,
        });
        cacheInvalidation.project.create();
        return result;
      })
      .actionable(), // Server action for mutations

    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().optional(),
          icon: z.string().optional(),
          instructions: z.string().optional(),
        })
      )
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        const { id, ...data } = input;
        const result = await projectService.updateProject(id, ctx.userId, data);
        cacheInvalidation.project.update(id);
        return result;
      })
      .actionable(), // Server action for mutations

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        const result = await projectService.deleteProject(input.id, ctx.userId);
        cacheInvalidation.project.delete(input.id);
        return result;
      })
      .actionable(), // Server action for mutations

    archive: protectedProcedure
      .input(z.object({ id: z.string() }))
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        const project = await projectService.getById(input.id);

        if (project.userId !== ctx.userId) {
          throw new ORPCError('FORBIDDEN', {
            message: 'You do not have permission to archive this project',
          });
        }

        // Delete the project (hard delete since no soft delete field exists)
        await db
          .delete(schema.projects)
          .where(eq(schema.projects.id, input.id));

        return { success: true };
      })
      .actionable(), // Server action for mutations

    updateFiles: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          files: z.array(z.any()),
        })
      )
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        return projectService.updateProjectFiles(
          input.id,
          ctx.userId,
          input.files
        );
      })
      .actionable(), // Server action for mutations

    updateInstructions: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          instructions: z.string(),
        })
      )
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        return projectService.updateProjectInstructions(
          input.id,
          ctx.userId,
          input.instructions
        );
      })
      .actionable(), // Server action for mutations
  },

  tasks: {
    list: protectedProcedure
      .input(
        z.object({
          status: z.enum(['pending', 'completed', 'archived']).optional(),
          workspaceId: z.string().optional(),
        })
      )
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        if (input.workspaceId) {
          return taskService.getWorkspaceTasks(input.workspaceId);
        }
        return taskService.getTasks(ctx.userId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .handler(async ({ input, context }) => {
        const _ctx = context as ProtectedContext;
        return taskService.getById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          content: z.string().optional(),
          workspaceId: z.string().optional(),
        })
      )
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        return taskService.createTask(ctx.userId, {
          workspaceId: input.workspaceId || '',
          title: input.title,
          description: input.content,
          prompt: input.title || input.content || '',
        });
      })
      .actionable(),

    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          title: z.string().optional(),
          content: z.string().optional(),
          status: z
            .enum(['pending', 'running', 'completed', 'failed'])
            .optional(),
        })
      )
      .handler(async ({ input, context }) => {
        const _ctx = context as ProtectedContext;
        const { id, ...data } = input;
        return taskService.updateTask(id, data);
      })
      .actionable(),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .handler(async ({ input, context }) => {
        const _ctx = context as ProtectedContext;
        return taskService.deleteTask(input.id);
      })
      .actionable(),
  },

  workspaces: {
    list: protectedProcedure.handler(async ({ context }) => {
      const ctx = context as ProtectedContext;
      return workspaceService.getWorkspaces(ctx.clerkId);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        return workspaceService.getByIdWithAuth(input.id, ctx.clerkId);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          path: z.string(),
          gitUrl: z.string().optional(),
        })
      )
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        return workspaceService.createWorkspace(ctx.clerkId, {
          name: input.name,
          localPath: input.path,
          daemonId: null,
        });
      })
      .actionable(),

    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().optional(),
          isDaemonConnected: z.boolean().optional(),
        })
      )
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        const { id, ...data } = input;
        return workspaceService.updateWorkspace(id, ctx.clerkId, data);
      })
      .actionable(),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        return workspaceService.deleteWorkspace(input.id, ctx.clerkId);
      })
      .actionable(),
  },

  outputs: {
    list: protectedProcedure
      .input(
        z.object({
          chatId: z.string().optional(),
        })
      )
      .handler(async ({ input, context }) => {
        const _ctx = context as ProtectedContext;
        if (input.chatId) {
          return outputService.getChatOutputs(input.chatId);
        }
        throw new ORPCError('BAD_REQUEST', {
          message: 'chatId is required',
        });
      }),

    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .handler(async ({ input, context }) => {
        const _ctx = context as ProtectedContext;
        return outputService.getById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          chatId: z.string(),
          name: z.string(),
          content: z.string(),
          language: z.string(),
        })
      )
      .handler(async ({ input, context }) => {
        const _ctx = context as ProtectedContext;
        // Generate a fake messageId since it's required but not in input
        const messageId = `msg-${Date.now()}`;
        return outputService.createOutput(
          input.chatId,
          messageId,
          input.name,
          input.language || 'code',
          input.content,
          {},
          false
        );
      })
      .actionable(),

    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          name: z.string().optional(),
          content: z.string().optional(),
        })
      )
      .handler(async ({ input, context }) => {
        const _ctx = context as ProtectedContext;
        const { id, ...data } = input;
        return outputService.updateOutput(id, data);
      })
      .actionable(),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .handler(async ({ input, context }) => {
        const _ctx = context as ProtectedContext;
        return outputService.deleteOutput(input.id);
      })
      .actionable(),
  },

  feedback: {
    create: protectedProcedure
      .input(
        z.object({
          chatId: z.string(),
          messageId: z.string(),
          type: z.enum(['helpful', 'not_helpful']),
          comment: z.string().optional(),
        })
      )
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        return FeedbackService.createOrUpdate(ctx.userId, {
          chatId: input.chatId,
          messageId: input.messageId,
          type: input.type,
        });
      })
      .actionable(),

    // Remove feedback for a message
    remove: protectedProcedure
      .input(
        z.object({
          messageId: z.string(),
        })
      )
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        return FeedbackService.remove(ctx.userId, input.messageId);
      })
      .actionable(),

    // Get feedback for a message
    get: protectedProcedure
      .input(
        z.object({
          messageId: z.string(),
        })
      )
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        return FeedbackService.get(ctx.userId, input.messageId);
      }),
  },

  share: {
    create: protectedProcedure
      .input(
        z.object({
          chatId: z.string(),
          expiresAt: z.date().optional(),
        })
      )
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        let expiresIn: CreateSharedLinkRequest['expiresIn'] = 'never';
        if (input.expiresAt) {
          const now = new Date();
          const diffDays = Math.ceil(
            (input.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (diffDays <= 1) {
            expiresIn = '1d';
          } else if (diffDays <= 7) {
            expiresIn = '7d';
          } else if (diffDays <= 30) {
            expiresIn = '30d';
          }
        }
        return shareService.createSharedLink(ctx.userId, {
          chatId: input.chatId,
          expiresIn,
        });
      })
      .actionable(),

    get: protectedProcedure
      .input(z.object({ token: z.string() }))
      .handler(async ({ input }) => {
        return shareService.getSharedChat(input.token);
      }),

    revoke: protectedProcedure
      .input(z.object({ id: z.string() }))
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        return shareService.deleteSharedLink(ctx.userId, input.id);
      })
      .actionable(),

    // Update shared link (e.g., deactivate)
    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          isActive: z.boolean().optional(),
        })
      )
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        return shareService.updateSharedLink(ctx.userId, input.id, {
          isActive: input.isActive,
        });
      })
      .actionable(),

    // Get all shared links for the current user
    list: protectedProcedure.handler(async ({ context }) => {
      const ctx = context as ProtectedContext;
      return shareService.getUserSharedLinks(ctx.userId);
    }),
  },

  user: {
    current: protectedProcedure.handler(async ({ context }) => {
      const ctx = context as ProtectedContext;
      // Get user by internal ID
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, ctx.userId))
        .limit(1);
      return user;
    }),

    update: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
          image: z.string().optional(),
        })
      )
      .handler(async ({ input, context }) => {
        const _ctx = context as ProtectedContext;
        // Update user is not implemented in UserService
        throw new ORPCError('NOT_IMPLEMENTED', {
          message: 'Update user not implemented',
        });
      })
      .actionable(),

    updateActiveModel: protectedProcedure
      .input(
        z.object({
          modelId: z.string(),
        })
      )
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        return userService.updateActiveModel(ctx.userId, input.modelId);
      })
      .actionable(), // Server action for mutations
  },

  // Models endpoints
  models: {
    // Get all available models for the current user based on their API keys
    list: protectedProcedure.handler(async ({ context }) => {
      const ctx = context as ProtectedContext;
      return modelsService.getModelsForUser(ctx.userId);
    }),
  },

  // Logs endpoints
  logs: {
    // Get logs settings
    getSettings: protectedProcedure.handler(async ({ context }) => {
      const ctx = context as ProtectedContext;
      return logsService.getSettings(ctx.userId);
    }),

    // Connect GitHub
    connectGitHub: protectedProcedure
      .input(z.object({ accessToken: z.string() }))
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        const result = await logsService.connectGitHub(ctx.userId, input.accessToken);
        cacheInvalidation.logs.settings();
        return result;
      })
      .actionable(),

    // Fetch GitHub repositories
    fetchRepos: protectedProcedure
      .handler(async ({ context }) => {
        const ctx = context as ProtectedContext;
        const result = await logsService.fetchGitHubRepos(ctx.userId);
        cacheInvalidation.logs.repos();
        return result;
      })
      .actionable(),

    // Toggle repository analysis
    toggleRepository: protectedProcedure
      .input(z.object({ 
        repoId: z.string(), 
        enabled: z.boolean() 
      }))
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        const result = await logsService.toggleRepository(
          ctx.userId, 
          input.repoId, 
          input.enabled
        );
        cacheInvalidation.logs.repos();
        return result;
      })
      .actionable(),

    // Toggle global logs
    toggleGlobalLogs: protectedProcedure
      .input(z.object({ enabled: z.boolean() }))
      .handler(async ({ input, context }) => {
        const ctx = context as ProtectedContext;
        const result = await logsService.toggleGlobalLogs(ctx.userId, input.enabled);
        cacheInvalidation.logs.settings();
        return result;
      })
      .actionable(),
  },
});

// Export router type for client usage
export type Router = typeof router;
