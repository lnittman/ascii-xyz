import 'server-only';
import { createId } from '@paralleldrive/cuid2';
import { database as db } from '@repo/database';

interface ProcessAttachmentOptions {
  chatId: string;
  messageId: string;
  type: string;
  name: string;
  size: number;
  mimeType: string;
  content: string;
  metadata?: Record<string, any>;
}

/**
 * Simplified attachment service that stores attachments without embeddings
 * This avoids the FastEmbed build issues in production
 */
export class AttachmentRAGServiceSimple {
  /**
   * Process an attachment without generating embeddings
   * Stores the attachment for later processing
   */
  async processAttachment(options: ProcessAttachmentOptions) {
    const { chatId, messageId, type, name, size, mimeType, content, metadata } =
      options;

    // Create attachment record
    const attachment = await db.attachment.create({
      data: {
        id: createId(),
        chatId,
        messageId,
        type,
        name,
        size,
        mimeType,
        content: type === 'text' || type === 'code' ? content : null,
        metadata,
        updatedAt: new Date(),
      },
    });

    return attachment;
  }

  /**
   * Simple text-based search without embeddings
   * Falls back to basic text matching
   */
  async searchAttachments(chatId: string, query: string, topK = 5) {
    // Simple text search in stored attachments
    const attachments = await db.attachment.findMany({
      where: {
        chatId,
        content: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: topK,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return attachments.map((attachment) => ({
      attachment,
      score: 1, // Simple scoring
      metadata: {
        text: attachment.content?.slice(0, 200) || '',
      },
    }));
  }

  /**
   * Get all attachments for a message
   */
  async getMessageAttachments(messageId: string) {
    return db.attachment.findMany({
      where: { messageId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Delete attachments
   */
  async deleteAttachments(attachmentIds: string[]) {
    await db.attachment.deleteMany({
      where: { id: { in: attachmentIds } },
    });
  }

  /**
   * Search attachments using pre-computed embedding
   * This will be implemented when we add pgvector support
   */
  async searchAttachmentsWithEmbedding(
    chatId: string,
    _queryEmbedding: number[],
    topK = 5
  ) {
    // Get all attachments for the chat
    const attachments = await db.attachment.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      take: topK * 2, // Get more to simulate ranking
    });

    // Return with mock similarity scores
    return attachments.slice(0, topK).map((attachment) => ({
      attachment,
      score: 0.8, // Mock score for now
      metadata: {
        text: attachment.content?.slice(0, 200) || '',
      },
    }));
  }
}

// Export singleton instance
let attachmentRAGServiceInstance: AttachmentRAGServiceSimple | null = null;

export function getAttachmentRAGService(): AttachmentRAGServiceSimple {
  if (!attachmentRAGServiceInstance) {
    attachmentRAGServiceInstance = new AttachmentRAGServiceSimple();
  }
  return attachmentRAGServiceInstance;
}
