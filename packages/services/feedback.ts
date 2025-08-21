import { randomUUID } from 'node:crypto';
import { and, db, desc, eq, schema } from '@repo/database';
import { internalError } from './lib/errors';

// Define types based on database schema
export type FeedbackType = 'helpful' | 'not_helpful';
export type CreateFeedback = {
  chatId: string;
  messageId: string;
  type: FeedbackType;
};

export class FeedbackService {
  static async createOrUpdate(userId: string, data: CreateFeedback) {
    try {
      // Check if feedback already exists for this user and message
      const [existing] = await db
        .select()
        .from(schema.messageFeedback)
        .where(
          and(
            eq(schema.messageFeedback.userId, userId),
            eq(schema.messageFeedback.messageId, data.messageId)
          )
        )
        .limit(1);

      if (existing) {
        // Update existing feedback
        const [updated] = await db
          .update(schema.messageFeedback)
          .set({
            type: data.type,
            updatedAt: new Date(),
          })
          .where(eq(schema.messageFeedback.id, existing.id))
          .returning();

        return updated;
      }
      // Create new feedback
      const [created] = await db
        .insert(schema.messageFeedback)
        .values({
          id: randomUUID(),
          userId,
          chatId: data.chatId,
          messageId: data.messageId,
          type: data.type,
          updatedAt: new Date(),
        })
        .returning();

      return created;
    } catch (_error) {
      throw internalError('Failed to save feedback');
    }
  }

  static async get(userId: string, messageId: string) {
    try {
      const [feedback] = await db
        .select()
        .from(schema.messageFeedback)
        .where(
          and(
            eq(schema.messageFeedback.userId, userId),
            eq(schema.messageFeedback.messageId, messageId)
          )
        )
        .limit(1);

      return feedback || null;
    } catch (_error) {
      throw internalError('Failed to get feedback');
    }
  }

  static async remove(userId: string, messageId: string) {
    try {
      const [existing] = await db
        .select()
        .from(schema.messageFeedback)
        .where(
          and(
            eq(schema.messageFeedback.userId, userId),
            eq(schema.messageFeedback.messageId, messageId)
          )
        )
        .limit(1);

      if (!existing) {
        return null;
      }

      const [deleted] = await db
        .delete(schema.messageFeedback)
        .where(eq(schema.messageFeedback.id, existing.id))
        .returning();

      return deleted || null;
    } catch (_error) {
      throw internalError('Failed to remove feedback');
    }
  }

  static async getAllForChat(userId: string, chatId: string) {
    try {
      const feedbacks = await db
        .select()
        .from(schema.messageFeedback)
        .where(
          and(
            eq(schema.messageFeedback.userId, userId),
            eq(schema.messageFeedback.chatId, chatId)
          )
        )
        .orderBy(desc(schema.messageFeedback.createdAt));

      return feedbacks;
    } catch (_error) {
      throw internalError('Failed to get chat feedback');
    }
  }
}
