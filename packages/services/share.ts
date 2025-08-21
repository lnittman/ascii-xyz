import { randomUUID } from 'node:crypto';

import {
  and,
  db,
  desc,
  eq,
  gt,
  inArray,
  isNull,
  or,
  schema,
} from '@repo/database';
import {
  ServiceError,
  internalError,
  notFound,
  unauthorized,
} from './lib/errors';

// Define types based on database schema
export type CreateSharedLinkRequest = {
  chatId: string;
  expiresIn?: '1d' | '7d' | '30d' | 'never';
};

export type SharedLinkResponse = {
  id: string;
  chatId: string;
  chatTitle: string;
  accessToken: string;
  messageCountAtShare: number;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date | null;
  isActive: boolean;
};

export type SharedChatContent = {
  id: string;
  chat: {
    id: string;
    title: string;
    messages: Array<{
      id: string;
      content: string;
      role: string;
      createdAt: Date;
    }>;
  };
  owner: {
    id: string;
  };
  messageCountAtShare: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date | null;
};

export class ShareService {
  /**
   * Create a new shared link for a chat
   */
  async createSharedLink(
    userId: string,
    data: CreateSharedLinkRequest
  ): Promise<SharedLinkResponse> {
    try {
      // Let the consuming app handle validation
      const validatedData = data;

      // Check if the chat exists and belongs to the user (using DB userId)
      const [chat] = await db
        .select()
        .from(schema.chats)
        .where(
          and(
            eq(schema.chats.id, validatedData.chatId),
            eq(schema.chats.userId, userId)
          )
        )
        .limit(1);

      if (!chat) {
        // Check if chat exists at all before throwing auth error
        const [chatExists] = await db
          .select()
          .from(schema.chats)
          .where(eq(schema.chats.id, validatedData.chatId))
          .limit(1);
        if (!chatExists) {
          throw notFound('Chat not found');
        }
        // If chat exists but user doesn't own it
        throw unauthorized('You do not own this chat.');
      }

      // Get message count for the chat
      // For now, we'll use a default count since mastra_messages is managed by Mastra
      // TODO: Integrate with Mastra API to get actual message count
      const messageCountNumber = 100;

      // Calculate expiration date if provided
      let expiresAt = null;
      if (validatedData.expiresIn && validatedData.expiresIn !== 'never') {
        expiresAt = new Date();
        if (validatedData.expiresIn === '1d') {
          expiresAt.setDate(expiresAt.getDate() + 1);
        } else if (validatedData.expiresIn === '7d') {
          expiresAt.setDate(expiresAt.getDate() + 7);
        } else if (validatedData.expiresIn === '30d') {
          expiresAt.setDate(expiresAt.getDate() + 30);
        }
      }

      // Create a new shared link
      const accessToken = randomUUID().replace(/-/g, '');
      const [sharedLink] = await db
        .insert(schema.sharedLinks)
        .values({
          id: randomUUID(),
          chatId: chat.id,
          ownerId: userId,
          accessToken,
          messageCountAtShare: messageCountNumber,
          expiresAt,
          updatedAt: new Date(),
        })
        .returning();

      // Return the formatted response
      return {
        id: sharedLink.id,
        chatId: sharedLink.chatId,
        chatTitle: chat.title,
        accessToken: sharedLink.accessToken,
        messageCountAtShare: sharedLink.messageCountAtShare,
        url: `/share/${sharedLink.accessToken}`,
        createdAt: sharedLink.createdAt,
        updatedAt: sharedLink.updatedAt,
        expiresAt: sharedLink.expiresAt,
        isActive: sharedLink.isActive,
      };
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to create shared link');
    }
  }

  /**
   * Get a shared chat by its access token
   */
  async getSharedChat(token: string): Promise<SharedChatContent> {
    try {
      // Find the shared link by token
      const [sharedLink] = await db
        .select()
        .from(schema.sharedLinks)
        .where(
          and(
            eq(schema.sharedLinks.accessToken, token),
            eq(schema.sharedLinks.isActive, true),
            or(
              isNull(schema.sharedLinks.expiresAt),
              gt(schema.sharedLinks.expiresAt, new Date())
            )
          )
        )
        .limit(1);

      if (!sharedLink) {
        throw notFound('Shared chat not found or link has expired');
      }

      // Get the chat data
      const [chat] = await db
        .select()
        .from(schema.chats)
        .where(eq(schema.chats.id, sharedLink.chatId))
        .limit(1);

      if (!chat) {
        throw notFound('Chat not found');
      }

      // Get the messages limited to the count at sharing time from mastra_messages
      // TODO: Integrate with Mastra API to get messages
      // For now, return empty messages array
      const messages = {
        rows: [] as Array<{
          id: string;
          content: string;
          role: string;
          createdAt: Date;
        }>,
      };

      return {
        id: sharedLink.id,
        chat: {
          id: chat.id,
          title: chat.title,
          messages: messages.rows.map((msg) => {
            let parsedContent = msg.content;

            // Parse content if it's stored as JSON string
            if (typeof msg.content === 'string') {
              const trimmed = msg.content.trim();
              if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
                try {
                  const parsed = JSON.parse(msg.content);

                  // If it's an array of parts (AI SDK format)
                  if (Array.isArray(parsed)) {
                    const textParts = parsed.filter(
                      (part: any) => part?.type === 'text'
                    );
                    if (textParts.length > 0) {
                      parsedContent = textParts
                        .map((part: any) => part.text || '')
                        .join('');
                    }
                  }
                  // If it's an object with parts property
                  else if (parsed?.parts && Array.isArray(parsed.parts)) {
                    const textParts = parsed.parts.filter(
                      (part: any) => part?.type === 'text'
                    );
                    if (textParts.length > 0) {
                      parsedContent = textParts
                        .map((part: any) => part.text || '')
                        .join('');
                    }
                  }
                } catch (_e) {
                  // If parsing fails, use content as-is
                }
              }
            }

            return {
              id: msg.id,
              content: parsedContent,
              role: msg.role,
              createdAt: msg.createdAt,
            };
          }),
        },
        owner: {
          id: sharedLink.ownerId,
        },
        messageCountAtShare: sharedLink.messageCountAtShare,
        createdAt: sharedLink.createdAt,
        updatedAt: sharedLink.updatedAt,
        expiresAt: sharedLink.expiresAt,
      };
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to fetch shared chat');
    }
  }
  /**
   * Get all shared links for a user
   */
  async getUserSharedLinks(userId: string): Promise<SharedLinkResponse[]> {
    try {
      // Get all shared links owned by the user (using DB userId)
      const sharedLinks = await db
        .select()
        .from(schema.sharedLinks)
        .where(
          and(
            eq(schema.sharedLinks.ownerId, userId),
            eq(schema.sharedLinks.isActive, true)
          )
        )
        .orderBy(desc(schema.sharedLinks.createdAt));

      // Get chat titles for all links
      const chatIds = [...new Set(sharedLinks.map((link) => link.chatId))];
      const chats =
        chatIds.length > 0
          ? await db
              .select({
                id: schema.chats.id,
                title: schema.chats.title,
              })
              .from(schema.chats)
              .where(inArray(schema.chats.id, chatIds))
          : [];
      const chatTitleMap = new Map(chats.map((chat) => [chat.id, chat.title]));

      // Format the response
      return sharedLinks.map((link) => ({
        id: link.id,
        chatId: link.chatId,
        chatTitle: chatTitleMap.get(link.chatId) || 'Untitled Chat',
        accessToken: link.accessToken,
        messageCountAtShare: link.messageCountAtShare,
        url: `/share/${link.accessToken}`,
        createdAt: link.createdAt,
        updatedAt: link.updatedAt,
        expiresAt: link.expiresAt,
        isActive: link.isActive,
      }));
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to fetch shared links');
    }
  }

  /**
   * Update a shared link (e.g., deactivate it)
   */
  async updateSharedLink(
    userId: string,
    linkId: string,
    data: { isActive?: boolean }
  ): Promise<void> {
    try {
      // Verify ownership
      const [sharedLink] = await db
        .select()
        .from(schema.sharedLinks)
        .where(
          and(
            eq(schema.sharedLinks.id, linkId),
            eq(schema.sharedLinks.ownerId, userId)
          )
        )
        .limit(1);

      if (!sharedLink) {
        throw notFound(
          'Shared link not found or you do not have permission to update it'
        );
      }

      // Update the shared link
      await db
        .update(schema.sharedLinks)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(schema.sharedLinks.id, linkId));
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to update shared link');
    }
  }

  /**
   * Delete a shared link
   */
  async deleteSharedLink(userId: string, linkId: string): Promise<void> {
    try {
      // Verify ownership
      const [sharedLink] = await db
        .select()
        .from(schema.sharedLinks)
        .where(
          and(
            eq(schema.sharedLinks.id, linkId),
            eq(schema.sharedLinks.ownerId, userId)
          )
        )
        .limit(1);

      if (!sharedLink) {
        throw notFound(
          'Shared link not found or you do not have permission to delete it'
        );
      }

      // Delete the shared link
      await db
        .delete(schema.sharedLinks)
        .where(eq(schema.sharedLinks.id, linkId));
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to delete shared link');
    }
  }
}

export const shareService = new ShareService();
