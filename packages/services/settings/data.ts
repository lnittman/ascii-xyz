import { randomUUID } from 'node:crypto';
import {
  db,
  eq,
  insertDataSettingsSchema,
  schema,
  selectDataSettingsSchema,
} from '@repo/database';
import type { DataSettings } from '@repo/database';
import { z } from 'zod';
import { badRequest, internalError } from '../lib/errors';

// Define types
export type UpdateDataSettingsRequest = Partial<
  Omit<DataSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>;

// Create update schema from insert schema
const updateDataSettingsSchema = insertDataSettingsSchema
  .omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();

class DataSettingsService {
  /**
   * Get or create data settings for a user
   */
  async getOrCreateDataSettings(userId: string): Promise<DataSettings> {
    try {
      const [settings] = await db
        .select()
        .from(schema.dataSettings)
        .where(eq(schema.dataSettings.userId, userId))
        .limit(1);

      if (!settings) {
        const [newSettings] = await db
          .insert(schema.dataSettings)
          .values({
            id: randomUUID(),
            userId,
            updatedAt: new Date(),
          })
          .returning();

        return selectDataSettingsSchema.parse(newSettings);
      }

      return selectDataSettingsSchema.parse(settings);
    } catch (_error) {
      throw internalError('Failed to get data settings');
    }
  }

  /**
   * Update data settings for a user
   */
  async updateDataSettings(
    userId: string,
    data: UpdateDataSettingsRequest
  ): Promise<DataSettings> {
    try {
      // Validate the update data
      const validatedData = updateDataSettingsSchema.parse(data);

      // Ensure settings exist first
      await this.getOrCreateDataSettings(userId);

      const [updated] = await db
        .update(schema.dataSettings)
        .set({
          ...validatedData,
          updatedAt: new Date(),
        })
        .where(eq(schema.dataSettings.userId, userId))
        .returning();

      return selectDataSettingsSchema.parse(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw badRequest('Invalid data settings');
      }
      throw internalError('Failed to update data settings');
    }
  }

  /**
   * Delete data settings for a user
   */
  async deleteDataSettings(userId: string): Promise<void> {
    try {
      await db
        .delete(schema.dataSettings)
        .where(eq(schema.dataSettings.userId, userId));
    } catch (error) {
      // If settings don't exist, that's fine
      if (
        error instanceof Error &&
        error.message.includes('Record to delete does not exist')
      ) {
        return;
      }
      throw internalError('Failed to delete data settings');
    }
  }
}

export const dataSettingsService = new DataSettingsService();
