import { z } from 'zod';

import { type User, db, eq, schema, selectUserSchema } from '@repo/database';
import { ServiceError, badRequest, internalError } from './lib/errors';

/**
 * Input schema for creating a user
 */
const createUserSchema = z.object({
  clerkId: z.string(),
});
type CreateUserInput = z.infer<typeof createUserSchema>;

export class UserService {
  /**
   * Get a user by their Clerk ID, creating them if they don't exist
   * This automatically handles user creation during authentication
   */
  async getUserByClerkId(clerkId: string): Promise<User> {
    try {
      // First try to find the existing user
      const [existingUser] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.clerkId, clerkId))
        .limit(1);

      if (existingUser) {
        return selectUserSchema.parse(existingUser);
      }

      // If user doesn't exist, create them automatically
      try {
        const [newUser] = await db
          .insert(schema.users)
          .values({
            clerkId,
            id: crypto.randomUUID(), // Generate ID explicitly
            updatedAt: new Date(),
          })
          .returning();

        return selectUserSchema.parse(newUser);
      } catch (insertError: any) {
        // Handle race condition where another request created the user
        if (insertError.code === '23505') {
          // Unique constraint violation
          // Try to fetch the user again
          const [racedUser] = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.clerkId, clerkId))
            .limit(1);

          if (racedUser) {
            return selectUserSchema.parse(racedUser);
          }
        }
        throw insertError;
      }
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to fetch or create user');
    }
  }

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(clerkId: string): Promise<User> {
    return this.getUserByClerkId(clerkId);
  }

  /**
   * Get all users (admin operation)
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const users = await db
        .select()
        .from(schema.users)
        .orderBy(schema.users.createdAt);

      return users.map((user) => selectUserSchema.parse(user));
    } catch (_error) {
      throw internalError('Failed to fetch users');
    }
  }

  /**
   * Create a new user (admin operation)
   */
  async createUser(data: CreateUserInput): Promise<User> {
    try {
      // Validate input data
      // Let the consuming app handle validation
      const validatedData = data;

      // Check if user already exists
      const [existingUser] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.clerkId, validatedData.clerkId))
        .limit(1);

      if (existingUser) {
        throw badRequest('User with this Clerk ID already exists');
      }

      // Create new user
      const [newUser] = await db
        .insert(schema.users)
        .values({
          id: crypto.randomUUID(),
          clerkId: validatedData.clerkId,
          updatedAt: new Date(),
        })
        .returning();

      return selectUserSchema.parse(newUser);
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to create user');
    }
  }

  /**
   * Get or create a user record for the authenticated user
   * This is useful during onboarding or initial authentication
   */
  async getOrCreateUser(clerkId: string): Promise<User> {
    // Delegate to getUserByClerkId which now handles creation automatically
    return this.getUserByClerkId(clerkId);
  }

  /**
   * Update user's active model
   */
  async updateActiveModel(userId: string, modelId: string): Promise<User> {
    try {
      const [updatedUser] = await db
        .update(schema.users)
        .set({
          activeModel: modelId,
          updatedAt: new Date(),
        })
        .where(eq(schema.users.id, userId))
        .returning();

      return selectUserSchema.parse(updatedUser);
    } catch (_error) {
      throw internalError('Failed to update user active model');
    }
  }
}

export const userService = new UserService();
