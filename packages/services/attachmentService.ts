import {
  and,
  db as database,
  desc,
  eq,
  or,
  schema,
  sqlOperator as sql,
} from '@repo/database';
// RAG service will be implemented separately
import { ServiceError, internalError, notFound } from './lib/errors';

export interface AttachmentMetadata {
  name: string;
  type: string;
  size: number;
  mimeType: string;
  url?: string;
}

export interface CreateAttachmentParams {
  chatId: string;
  messageId?: string;
  name: string;
  type: string;
  size: number;
  mimeType: string;
  content?: string;
  url?: string;
}

/**
 * Domain service for attachment business logic
 * Handles database operations and coordinates with Mastra for RAG
 */
export class AttachmentService {
  /**
   * Create an attachment record in the database
   */
  async createAttachment(params: CreateAttachmentParams) {
    try {
      // Create database record
      const [attachment] = await database
        .insert(schema.attachments)
        .values({
          id: crypto.randomUUID(),
          chatId: params.chatId,
          messageId: params.messageId || params.chatId, // Use chatId as fallback
          name: params.name,
          type: params.type,
          size: params.size,
          mimeType: params.mimeType,
          content: params.content || null,
          metadata: {
            processed: false,
            createdAt: new Date(),
            url: params.url,
          },
          updatedAt: new Date(),
        })
        .returning();

      // TODO: Implement RAG processing when content is provided

      return attachment;
    } catch (_error) {
      throw internalError('Failed to create attachment');
    }
  }

  /**
   * Get attachments for a chat
   */
  async getChatAttachments(chatId: string) {
    try {
      const attachments = await database
        .select()
        .from(schema.attachments)
        .where(eq(schema.attachments.chatId, chatId))
        .orderBy(desc(schema.attachments.createdAt));

      return attachments;
    } catch (_error) {
      throw internalError('Failed to fetch attachments');
    }
  }

  /**
   * Get attachment by ID
   */
  async getAttachment(attachmentId: string) {
    try {
      const [attachment] = await database
        .select()
        .from(schema.attachments)
        .where(eq(schema.attachments.id, attachmentId))
        .limit(1);

      if (!attachment) {
        throw notFound('Attachment not found');
      }

      return attachment;
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to fetch attachment');
    }
  }

  /**
   * Search attachments using semantic similarity
   * Delegates to Mastra RAG service
   */
  async searchAttachments(query: string, chatId: string, limit = 5) {
    try {
      // For now, just use text search
      const results: any[] = [];

      if (results.length === 0) {
        const attachments = await database
          .select()
          .from(schema.attachments)
          .where(
            and(
              eq(schema.attachments.chatId, chatId),
              or(
                sql`LOWER(${schema.attachments.name}) LIKE LOWER(${`%${query}%`})`,
                sql`LOWER(${schema.attachments.content}) LIKE LOWER(${`%${query}%`})`
              )
            )
          )
          .limit(limit);

        return attachments.map((att) => ({
          attachmentId: att.id,
          chatId: att.chatId,
          score: 0.5, // Fixed score for text search
          content: att.content || '',
          metadata: att.metadata,
        }));
      }

      return results;
    } catch (_error) {
      // Fall back to empty results
      return [];
    }
  }

  /**
   * Delete an attachment
   */
  async deleteAttachment(attachmentId: string) {
    try {
      // Delete from database
      await database
        .delete(schema.attachments)
        .where(eq(schema.attachments.id, attachmentId));

      // TODO: Delete from RAG when implemented
    } catch (_error) {
      throw internalError('Failed to delete attachment');
    }
  }

  /**
   * Delete all attachments for a chat
   */
  async deleteChatAttachments(chatId: string) {
    try {
      // Delete from database
      await database
        .delete(schema.attachments)
        .where(eq(schema.attachments.chatId, chatId));

      // TODO: Clear from RAG when implemented
    } catch (_error) {
      throw internalError('Failed to delete attachments');
    }
  }

  /**
   * Update attachment metadata
   */
  async updateAttachment(attachmentId: string, metadata: any) {
    try {
      const [attachment] = await database
        .update(schema.attachments)
        .set({
          metadata: {
            ...(metadata || {}),
            updatedAt: new Date(),
          },
        })
        .where(eq(schema.attachments.id, attachmentId))
        .returning();

      return attachment;
    } catch (_error) {
      throw internalError('Failed to update attachment');
    }
  }
}

export const attachmentService = new AttachmentService();
