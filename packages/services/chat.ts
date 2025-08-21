import { cache, cacheKeys } from '@repo/cache';
import { db, desc, eq, schema } from '@repo/database';
import type { Chat } from '@repo/database';

import {
  ServiceError,
  internalError,
  notFound,
  unauthorized,
} from './lib/errors';
import { projectService } from './project';

export class ChatService {
  /**
   * Create a new chat
   */
  async create(
    userId: string,
    title: string,
    projectId: string | null
  ): Promise<Chat> {
    try {
      // Create the chat
      const [newChat] = await db
        .insert(schema.chats)
        .values({
          id: crypto.randomUUID(),
          userId,
          title: title,
          projectId: projectId,
          updatedAt: new Date(),
        })
        .returning();

      // Note: Mastra will create the thread automatically when messages are sent
      // using the chat ID as the thread ID

      // Invalidate user chats cache
      await cache.delete(cacheKeys.userChats(userId));
      if (projectId) {
        await cache.delete(cacheKeys.projectChats(projectId));
      }

      return newChat;
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to create chat');
    }
  }

  /**
   * Delete a chat and all its messages
   */
  async delete(chatId: string, userId: string): Promise<void> {
    try {
      // Get the chat
      const chat = await this.getById(chatId);

      // Verify ownership
      if (chat.userId !== userId) {
        throw unauthorized('You do not have permission to delete this chat');
      }

      // Delete the chat (will cascade delete messages due to database foreign keys)
      await db.delete(schema.chats).where(eq(schema.chats.id, chatId));

      // Invalidate caches
      await cache.delete(cacheKeys.chat(chatId));
      await cache.delete(cacheKeys.userChats(userId));
      if (chat.projectId) {
        await cache.delete(cacheKeys.projectChats(chat.projectId));
      }
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to delete chat');
    }
  }

  /**
   * Get a chat by ID
   */
  async getById(chatId: string): Promise<Chat> {
    try {
      // Check cache first
      const cacheKey = cacheKeys.chat(chatId);
      const cached = await cache.get<Chat>(cacheKey);
      if (cached) {
        return cached;
      }

      const [chat] = await db
        .select()
        .from(schema.chats)
        .where(eq(schema.chats.id, chatId))
        .limit(1);

      if (!chat) {
        throw notFound(`Chat ${chatId} not found`);
      }

      // Cache for 1 hour
      await cache.set(cacheKey, chat, 3600);

      return chat;
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to fetch chat');
    }
  }

  /**
   * Get all chats for a project
   */
  async getProjectChats(projectId: string): Promise<Chat[]> {
    try {
      // Check cache first
      const cacheKey = cacheKeys.projectChats(projectId);
      const cached = await cache.get<Chat[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const chats = await db
        .select()
        .from(schema.chats)
        .where(eq(schema.chats.projectId, projectId))
        .orderBy(desc(schema.chats.updatedAt));

      // Cache for 5 minutes
      await cache.set(cacheKey, chats, 300);

      return chats;
    } catch (_error) {
      throw internalError('Failed to fetch project chats');
    }
  }

  /**
   * Get all chats for a user
   */
  async getChats(userId: string): Promise<Chat[]> {
    try {
      // Check cache first
      const cacheKey = cacheKeys.userChats(userId);
      const cached = await cache.get<Chat[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const chats = await db
        .select()
        .from(schema.chats)
        .where(eq(schema.chats.userId, userId))
        .orderBy(desc(schema.chats.updatedAt));

      // Cache for 5 minutes
      await cache.set(cacheKey, chats, 300);

      return chats;
    } catch (_error) {
      throw internalError('Failed to fetch user chats');
    }
  }

  /**
   * Get chat messages - placeholder for now
   * Messages are stored in Mastra's memory system, not our database
   * This should be called through the AI service API
   */
  async getChatMessages(chatId: string): Promise<any[]> {
    try {
      // Verify chat exists and get user info
      const chat = await this.getById(chatId);

      // Get the user to access clerkId
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, chat.userId))
        .limit(1);

      if (!user) {
        throw notFound('User not found');
      }

      // For new chats, return empty array
      // Messages will be loaded from the AI service
      return [];
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to fetch messages');
    }
  }

  /**
   * Rename a chat
   */
  async rename(chatId: string, userId: string, title: string) {
    try {
      // Verify chat exists and user has access
      const chat = await this.getById(chatId);

      // Verify ownership
      if (chat.userId !== userId) {
        throw unauthorized('You do not have permission to rename this chat');
      }

      const [updatedChat] = await db
        .update(schema.chats)
        .set({ title })
        .where(eq(schema.chats.id, chatId))
        .returning();

      return updatedChat;
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to rename chat');
    }
  }

  // Note: saveMessage method removed - Mastra handles message persistence automatically
  // Messages are saved when streaming through the chat agent

  /**
   * Update a chat's project assignment
   */
  async updateProject(
    chatId: string,
    userId: string,
    projectId: string | null
  ): Promise<Chat> {
    try {
      // Verify chat exists and user has access
      const chat = await this.getById(chatId);

      // Verify ownership
      if (chat.userId !== userId) {
        throw unauthorized('You do not have permission to update this chat');
      }

      // If projectId is provided, verify it exists and user has access
      if (projectId) {
        const hasAccess = await projectService.verifyProjectOwnership(
          projectId,
          userId
        );

        if (!hasAccess) {
          throw unauthorized(
            'You do not have permission to assign this project'
          );
        }
      }

      // Update the chat's project
      const [updatedChat] = await db
        .update(schema.chats)
        .set({ projectId })
        .where(eq(schema.chats.id, chatId))
        .returning();

      return updatedChat;
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to update chat project');
    }
  }

  /**
   * Update a chat's active model
   */
  async updateActiveModel(
    chatId: string,
    userId: string,
    modelId: string
  ): Promise<Chat> {
    try {
      // Verify chat exists and user has access
      const chat = await this.getById(chatId);

      // Verify ownership
      if (chat.userId !== userId) {
        throw unauthorized('You do not have permission to update this chat');
      }

      // Update the chat's active model
      const [updatedChat] = await db
        .update(schema.chats)
        .set({
          activeModel: modelId,
          updatedAt: new Date(),
        })
        .where(eq(schema.chats.id, chatId))
        .returning();

      return updatedChat;
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to update chat model');
    }
  }

  /**
   * Sync chat title from Mastra's auto-generated title
   * Note: This is now just a placeholder - actual title sync should happen
   * after the AI generates a response and updates the title
   */
  async syncTitleFromMastra(
    chatId: string,
    userId: string
  ): Promise<Chat | null> {
    try {
      // Verify chat exists and user has access
      const chat = await this.getById(chatId);

      // Verify ownership
      if (chat.userId !== userId) {
        throw unauthorized(
          'You do not have permission to sync this chat title'
        );
      }

      // For now, just return the existing chat
      // The actual title update will happen through a separate API call
      // after the AI service generates a title
      return chat;
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to sync chat title');
    }
  }
}

export const chatService = new ChatService();
