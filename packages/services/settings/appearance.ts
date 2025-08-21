import { randomUUID } from 'node:crypto';
import { db, eq, schema, selectAppearanceSettingsSchema } from '@repo/database';
import type { AppearanceSettings } from '@repo/database';
import { ServiceError, internalError } from '../lib/errors';

// Define update type
export type UpdateAppearanceSettings = Partial<
  Omit<AppearanceSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>;

export class AppearanceSettingsService {
  /**
   * Get or create appearance settings for a user
   */
  async getOrCreateAppearanceSettings(clerkUserId: string) {
    try {
      const [appearanceSettings] = await db
        .select()
        .from(schema.appearanceSettings)
        .where(eq(schema.appearanceSettings.userId, clerkUserId))
        .limit(1);

      if (!appearanceSettings) {
        const [newSettings] = await db
          .insert(schema.appearanceSettings)
          .values({
            id: randomUUID(),
            userId: clerkUserId,
            fontFamily: 'iosevka-term',
            updatedAt: new Date(),
          })
          .returning();

        return selectAppearanceSettingsSchema.parse(newSettings);
      }

      return selectAppearanceSettingsSchema.parse(appearanceSettings);
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to get appearance settings');
    }
  }

  /**
   * Update appearance settings
   */
  async updateAppearanceSettings(
    clerkUserId: string,
    data: UpdateAppearanceSettings
  ) {
    try {
      // Let the consuming app handle validation
      const validatedData = data;

      // Ensure appearance settings exist
      await this.getOrCreateAppearanceSettings(clerkUserId);

      const [updatedSettings] = await db
        .update(schema.appearanceSettings)
        .set({
          ...validatedData,
          updatedAt: new Date(),
        })
        .where(eq(schema.appearanceSettings.userId, clerkUserId))
        .returning();

      return selectAppearanceSettingsSchema.parse(updatedSettings);
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to update appearance settings');
    }
  }
}

export const appearanceSettingsService = new AppearanceSettingsService();
