import { randomUUID } from 'node:crypto';
import {
  db,
  eq,
  schema,
  selectNotificationSettingsSchema,
} from '@repo/database';
import type { NotificationSettings } from '@repo/database';
import { ServiceError, internalError } from '../lib/errors';

// Define update type
export type UpdateNotificationSettings = Partial<
  Omit<NotificationSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>;

export class NotificationSettingsService {
  /**
   * Get or create notification settings for a user
   */
  async getOrCreateNotificationSettings(clerkUserId: string) {
    try {
      const [notificationSettings] = await db
        .select()
        .from(schema.notificationSettings)
        .where(eq(schema.notificationSettings.userId, clerkUserId))
        .limit(1);

      if (!notificationSettings) {
        const [newSettings] = await db
          .insert(schema.notificationSettings)
          .values({
            id: randomUUID(),
            userId: clerkUserId,
            notifyProcessingComplete: true,
            notifyProcessingFailed: true,
            notifyWeeklySummary: false,
            notifyFeatureUpdates: false,
            updatedAt: new Date(),
          })
          .returning();

        return selectNotificationSettingsSchema.parse(newSettings);
      }

      return selectNotificationSettingsSchema.parse(notificationSettings);
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to get notification settings');
    }
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(
    clerkUserId: string,
    data: UpdateNotificationSettings
  ) {
    try {
      // Let the consuming app handle validation
      const validatedData = data;

      // Ensure notification settings exist
      await this.getOrCreateNotificationSettings(clerkUserId);

      const [updatedSettings] = await db
        .update(schema.notificationSettings)
        .set({
          ...validatedData,
          updatedAt: new Date(),
        })
        .where(eq(schema.notificationSettings.userId, clerkUserId))
        .returning();

      return selectNotificationSettingsSchema.parse(updatedSettings);
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to update notification settings');
    }
  }
}

export const notificationSettingsService = new NotificationSettingsService();
