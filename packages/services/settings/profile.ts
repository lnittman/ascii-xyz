import { randomUUID } from 'node:crypto';
import { db, eq, schema, selectProfileSettingsSchema } from '@repo/database';
import type { ProfileSettings } from '@repo/database';
import { ServiceError, internalError } from '../lib/errors';

// Define update type
export type UpdateProfileSettings = Partial<
  Omit<ProfileSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>;

export class ProfileSettingsService {
  /**
   * Get or create profile settings for a user
   */
  async getOrCreateProfileSettings(clerkUserId: string) {
    try {
      const [profileSettings] = await db
        .select()
        .from(schema.profileSettings)
        .where(eq(schema.profileSettings.userId, clerkUserId))
        .limit(1);

      if (!profileSettings) {
        const [newSettings] = await db
          .insert(schema.profileSettings)
          .values({
            id: randomUUID(),
            userId: clerkUserId,
            tier: 'free',
            updatedAt: new Date(),
          })
          .returning();

        return selectProfileSettingsSchema.parse(newSettings);
      }

      return selectProfileSettingsSchema.parse(profileSettings);
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to get profile settings');
    }
  }

  /**
   * Update profile settings
   */
  async updateProfileSettings(
    clerkUserId: string,
    data: UpdateProfileSettings
  ) {
    try {
      // Let the consuming app handle validation
      const validatedData = data;

      // Ensure profile settings exist
      await this.getOrCreateProfileSettings(clerkUserId);

      const [updatedSettings] = await db
        .update(schema.profileSettings)
        .set({
          ...validatedData,
          updatedAt: new Date(),
        })
        .where(eq(schema.profileSettings.userId, clerkUserId))
        .returning();

      return selectProfileSettingsSchema.parse(updatedSettings);
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to update profile settings');
    }
  }
}

export const profileSettingsService = new ProfileSettingsService();
