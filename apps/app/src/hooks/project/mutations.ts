import {
  createProject as createProjectAction,
  deleteProject as deleteProjectAction,
  updateProject as updateProjectAction,
  updateProjectFiles as updateProjectFilesAction,
  updateProjectInstructions as updateProjectInstructionsAction,
} from '@repo/orpc/actions';
import { invokeServerAction } from '@repo/orpc/server-action-wrapper';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { mutate } from 'swr';

// Using oRPC server actions with manual loading state management

export function useCreateProjectMutation() {
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<Error | null>(null);

  const createProject = async (
    data: Parameters<typeof createProjectAction>[0]
  ) => {
    setIsCreating(true);
    setCreateError(null);
    try {
      const result = await invokeServerAction(createProjectAction, data);
      await mutate('/api/projects');
      return result;
    } catch (error) {
      setCreateError(error as Error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return { createProject, isCreating, createError };
}

export function useUpdateProjectMutation() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<Error | null>(null);

  const updateProject = async (
    arg: Parameters<typeof updateProjectAction>[0]
  ) => {
    setIsUpdating(true);
    setUpdateError(null);
    try {
      const result = await invokeServerAction(updateProjectAction, arg);
      await mutate('/api/projects');
      await mutate(`/api/projects/${arg.id}`);
      return result;
    } catch (error) {
      setUpdateError(error as Error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateProject, isUpdating, updateError };
}

export function useUpdateProjectFilesMutation() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<Error | null>(null);

  const updateProjectFiles = async (arg: { id: string; files: any[] }) => {
    setIsUpdating(true);
    setUpdateError(null);
    try {
      // Update project with files array
      const result = await invokeServerAction(updateProjectFilesAction, {
        id: arg.id,
        files: arg.files,
      });
      await mutate('/api/projects');
      await mutate(`/api/projects/${arg.id}`);
      return result;
    } catch (error) {
      setUpdateError(error as Error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateProjectFiles, isUpdating, updateError };
}

export function useUpdateProjectInstructionsMutation() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<Error | null>(null);

  const updateProjectInstructions = async (arg: {
    id: string;
    instructions: string;
  }) => {
    setIsUpdating(true);
    setUpdateError(null);
    try {
      const result = await invokeServerAction(updateProjectInstructionsAction, {
        id: arg.id,
        instructions: arg.instructions,
      });
      await mutate('/api/projects');
      await mutate(`/api/projects/${arg.id}`);
      return result;
    } catch (error) {
      setUpdateError(error as Error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateProjectInstructions, isUpdating, updateError };
}

export function useDeleteProjectMutation() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<Error | null>(null);

  const deleteProject = async ({ id }: { id: string }) => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const result = await invokeServerAction(deleteProjectAction, { id });
      await mutate('/api/projects');
      return result;
    } catch (error) {
      setDeleteError(error as Error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteProject, isDeleting, deleteError };
}

// --- Navigation & Combined Mutation Hook ---

export function useProjectMutations() {
  const router = useRouter();

  const { createProject, isCreating, createError } = useCreateProjectMutation();
  const { updateProject, isUpdating, updateError } = useUpdateProjectMutation();
  const {
    updateProjectFiles,
    isUpdating: isUpdatingFiles,
    updateError: updateFilesError,
  } = useUpdateProjectFilesMutation();
  const {
    updateProjectInstructions,
    isUpdating: isUpdatingInstructions,
    updateError: updateInstructionsError,
  } = useUpdateProjectInstructionsMutation();
  const { deleteProject, isDeleting, deleteError } = useDeleteProjectMutation();

  // Create a new project and navigate
  const createAndNavigate = async (name: string) => {
    try {
      const newProject = await createProject({ name });

      if (newProject && typeof newProject === 'object' && 'id' in newProject) {
        router.push(`/p/${(newProject as any).id}`);
        return (newProject as any).id;
      }

      throw new Error('Project creation failed');
    } catch (_error) {
      return null;
    }
  };

  // Update a project and invalidate cache
  const updateAndInvalidate = async (id: string, name: string) => {
    try {
      await updateProject({ id, name });
      // Cache invalidation is handled by mutate calls above
      return true;
    } catch (_error) {
      return false;
    }
  };

  // Delete a project, invalidate cache, and navigate if necessary
  const deleteAndInvalidate = async (id: string) => {
    try {
      await deleteProject({ id });
      // Cache invalidation is handled by mutate calls above
      return true;
    } catch (_error) {
      return false;
    }
  };

  // Update project files and invalidate cache
  const updateFilesAndInvalidate = async (id: string, files: any[]) => {
    try {
      await updateProjectFiles({ id, files });
      // Cache invalidation is handled by mutate calls above
      return true;
    } catch (_error) {
      return false;
    }
  };

  // Update project instructions and invalidate cache
  const updateInstructionsAndInvalidate = async (
    id: string,
    instructions: string
  ) => {
    try {
      await updateProjectInstructions({ id, instructions });
      // Cache invalidation is handled by mutate calls above
      return true;
    } catch (_error) {
      return false;
    }
  };

  return {
    // Individual mutations
    createProject,
    updateProject,
    updateProjectFiles,
    updateProjectInstructions,
    deleteProject,

    // Combined operations with navigation/cache invalidation
    createAndNavigate,
    updateAndInvalidate,
    deleteAndInvalidate,
    updateFilesAndInvalidate,
    updateInstructionsAndInvalidate,

    // Loading states
    isCreating,
    isUpdating: isUpdating || isUpdatingFiles || isUpdatingInstructions,
    isDeleting,

    // Errors
    createError,
    updateError: updateError || updateFilesError || updateInstructionsError,
    deleteError,
  };
}
