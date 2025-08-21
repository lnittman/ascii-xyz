import {
  and,
  db,
  desc,
  eq,
  schema,
  selectWorkspaceSchema,
} from '@repo/database';
import { ServiceError, internalError, notFound } from './lib/errors';

// Define types based on database schema
export type CreateWorkspace = {
  name: string;
  daemonId?: string | null;
  localPath?: string | null;
};

export type UpdateWorkspace = Partial<CreateWorkspace>;

export const workspaceService = {
  async getWorkspaces(clerkUserId: string) {
    try {
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.clerkId, clerkUserId))
        .limit(1);

      if (!user) {
        throw notFound('User not found');
      }

      // Get workspaces for the user
      const workspaces = await db
        .select()
        .from(schema.workspaces)
        .where(eq(schema.workspaces.userId, user.id))
        .orderBy(desc(schema.workspaces.createdAt));

      return workspaces.map((ws) => selectWorkspaceSchema.parse(ws));
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to get workspaces');
    }
  },

  // Simple getById without auth check for internal use
  async getById(workspaceId: string) {
    try {
      const [workspace] = await db
        .select()
        .from(schema.workspaces)
        .where(eq(schema.workspaces.id, workspaceId))
        .limit(1);

      return workspace ? selectWorkspaceSchema.parse(workspace) : null;
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to get workspace');
    }
  },

  async getByIdWithAuth(workspaceId: string, clerkUserId: string) {
    try {
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.clerkId, clerkUserId))
        .limit(1);

      if (!user) {
        throw notFound('User not found');
      }

      const [workspace] = await db
        .select()
        .from(schema.workspaces)
        .where(
          and(
            eq(schema.workspaces.id, workspaceId),
            eq(schema.workspaces.userId, user.id)
          )
        )
        .limit(1);

      if (!workspace) {
        throw notFound('Workspace not found');
      }

      return selectWorkspaceSchema.parse(workspace);
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to get workspace');
    }
  },

  async createWorkspace(clerkUserId: string, data: CreateWorkspace) {
    try {
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.clerkId, clerkUserId))
        .limit(1);

      if (!user) {
        throw notFound('User not found');
      }

      // Let the consuming app handle validation
      const validated = data;

      const [workspace] = await db
        .insert(schema.workspaces)
        .values({
          id: crypto.randomUUID(),
          name: validated.name,
          daemonId: validated.daemonId,
          localPath: validated.localPath,
          userId: user.id,
          updatedAt: new Date(),
        })
        .returning();

      return selectWorkspaceSchema.parse(workspace);
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to create workspace');
    }
  },

  async updateWorkspace(
    workspaceId: string,
    clerkUserId: string,
    data: UpdateWorkspace
  ) {
    try {
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.clerkId, clerkUserId))
        .limit(1);

      if (!user) {
        throw notFound('User not found');
      }

      // Verify workspace belongs to user
      const [workspace] = await db
        .select()
        .from(schema.workspaces)
        .where(
          and(
            eq(schema.workspaces.id, workspaceId),
            eq(schema.workspaces.userId, user.id)
          )
        )
        .limit(1);

      if (!workspace) {
        throw notFound('Workspace not found');
      }

      // Let the consuming app handle validation
      const validated = data;

      const [updated] = await db
        .update(schema.workspaces)
        .set({ ...validated, updatedAt: new Date() })
        .where(eq(schema.workspaces.id, workspaceId))
        .returning();

      return selectWorkspaceSchema.parse(updated);
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to update workspace');
    }
  },

  async deleteWorkspace(workspaceId: string, clerkUserId: string) {
    try {
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.clerkId, clerkUserId))
        .limit(1);

      if (!user) {
        throw notFound('User not found');
      }

      // Verify workspace belongs to user
      const [workspace] = await db
        .select()
        .from(schema.workspaces)
        .where(
          and(
            eq(schema.workspaces.id, workspaceId),
            eq(schema.workspaces.userId, user.id)
          )
        )
        .limit(1);

      if (!workspace) {
        throw notFound('Workspace not found');
      }

      await db
        .delete(schema.workspaces)
        .where(eq(schema.workspaces.id, workspaceId));
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to delete workspace');
    }
  },

  async updateDaemonStatus(
    workspaceId: string,
    status: 'connected' | 'disconnected'
  ) {
    const [updated] = await db
      .update(schema.workspaces)
      .set({
        daemonStatus: status,
        lastDaemonHeartbeat: status === 'connected' ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(schema.workspaces.id, workspaceId))
      .returning();

    return selectWorkspaceSchema.parse(updated);
  },
};
