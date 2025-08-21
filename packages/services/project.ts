import { cache, cacheKeys } from '@repo/cache';
import { type Project, db, desc, eq, schema } from '@repo/database';
import {
  ServiceError,
  internalError,
  notFound,
  unauthorized,
} from './lib/errors';

// Define local types for project operations
type CreateProject = {
  name: string;
  description?: string;
};

type UpdateProject = {
  name?: string;
  description?: string;
  instructions?: string;
  files?: any;
  imageUrl?: string;
};

export class ProjectService {
  /**
   * Create a new project
   */
  async createProject(userId: string, data: CreateProject): Promise<Project> {
    try {
      // Let the consuming app handle validation
      const validatedData = data;

      // Create the project
      const [newProject] = await db
        .insert(schema.projects)
        .values({
          id: crypto.randomUUID(),
          name: validatedData.name,
          description: validatedData.description ?? null,
          userId,
          updatedAt: new Date(),
        })
        .returning();

      // Invalidate user projects cache
      await cache.delete(cacheKeys.userProjects(userId));

      return newProject;
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to create project');
    }
  }

  /**
   * Delete a project and all associated data
   */
  async deleteProject(projectId: string, userId: string): Promise<void> {
    try {
      // Verify ownership
      const isOwner = await this.verifyProjectOwnership(projectId, userId);
      if (!isOwner) {
        throw unauthorized('You do not have permission to delete this project');
      }

      // Delete the project (cascade delete will handle related records)
      await db.delete(schema.projects).where(eq(schema.projects.id, projectId));

      // Invalidate caches
      await cache.delete(cacheKeys.project(projectId));
      await cache.delete(cacheKeys.userProjects(userId));
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to delete project');
    }
  }

  /**
   * Get a project by ID
   */
  async getById(projectId: string): Promise<Project & { chats?: any[] }> {
    try {
      // Check cache first
      const cacheKey = cacheKeys.project(projectId);
      const cached = await cache.get<Project & { chats?: any[] }>(cacheKey);
      if (cached) {
        return cached;
      }

      const [project] = await db
        .select()
        .from(schema.projects)
        .where(eq(schema.projects.id, projectId))
        .limit(1);

      if (!project) {
        throw notFound(`Project ${projectId} not found`);
      }

      // Get chats for the project
      const chats = await db
        .select()
        .from(schema.chats)
        .where(eq(schema.chats.projectId, projectId))
        .orderBy(desc(schema.chats.updatedAt));

      const projectWithChats = { ...project, chats };

      // Cache for 1 hour
      await cache.set(cacheKey, projectWithChats, 3600);

      return projectWithChats;
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to fetch project');
    }
  }

  /**
   * Get all projects for a user
   */
  async getProjects(userId: string): Promise<Project[]> {
    try {
      // Check cache first
      const cacheKey = cacheKeys.userProjects(userId);
      const cached = await cache.get<Project[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const projects = await db
        .select()
        .from(schema.projects)
        .where(eq(schema.projects.userId, userId))
        .orderBy(desc(schema.projects.updatedAt));

      // Cache for 5 minutes
      await cache.set(cacheKey, projects, 300);

      return projects;
    } catch (_error) {
      throw internalError('Failed to fetch user projects');
    }
  }

  /**
   * Update a project
   */
  async updateProject(
    projectId: string,
    userId: string,
    data: UpdateProject
  ): Promise<Project> {
    try {
      // Validate input data
      // Let the consuming app handle validation
      const validatedData = data;

      // Get the project
      const project = await this.getById(projectId);

      // Verify ownership or admin access
      const isOwner = await this.verifyProjectOwnership(projectId, userId);
      if (!isOwner) {
        throw unauthorized('You do not have permission to update this project');
      }

      // Update the project
      const [updatedProject] = await db
        .update(schema.projects)
        .set({
          name: validatedData.name ?? project.name,
          description: validatedData.description ?? project.description,
          updatedAt: new Date(),
        })
        .where(eq(schema.projects.id, projectId))
        .returning();

      return updatedProject;
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to update project');
    }
  }

  /**
   * Update project files
   */
  async updateProjectFiles(
    projectId: string,
    userId: string,
    files: any[]
  ): Promise<Project> {
    try {
      // Verify ownership
      const isOwner = await this.verifyProjectOwnership(projectId, userId);
      if (!isOwner) {
        throw unauthorized('You do not have permission to update this project');
      }

      // Update the project files
      const [updatedProject] = await db
        .update(schema.projects)
        .set({
          files,
          updatedAt: new Date(),
        })
        .where(eq(schema.projects.id, projectId))
        .returning();

      return updatedProject;
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to update project files');
    }
  }

  /**
   * Update project instructions
   */
  async updateProjectInstructions(
    projectId: string,
    userId: string,
    instructions: string
  ): Promise<Project> {
    try {
      // Verify ownership
      const isOwner = await this.verifyProjectOwnership(projectId, userId);
      if (!isOwner) {
        throw unauthorized('You do not have permission to update this project');
      }

      // Update the project instructions
      const [updatedProject] = await db
        .update(schema.projects)
        .set({
          instructions,
          updatedAt: new Date(),
        })
        .where(eq(schema.projects.id, projectId))
        .returning();

      return updatedProject;
    } catch (error) {
      throw error instanceof ServiceError
        ? error
        : internalError('Failed to update project instructions');
    }
  }

  /**
   * Verify if a user owns a project
   */
  async verifyProjectOwnership(
    projectId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const [project] = await db
        .select()
        .from(schema.projects)
        .where(eq(schema.projects.id, projectId))
        .limit(1);

      if (!project) {
        throw notFound('Project not found');
      }

      // Check direct ownership
      return project.userId === userId;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw internalError('Failed to verify project ownership');
    }
  }
}

export const projectService = new ProjectService();
