import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

export function useCreateWorkspace() {
  const { mutate } = useSWRConfig();

  const { trigger, isMutating, error } = useSWRMutation(
    'create-workspace',
    async (_, { arg }: { arg: { name: string; repoUrl?: string } }) => {
      const { createWorkspace } = await import('@repo/orpc/actions');
      const result = await createWorkspace({
        name: arg.name,
        path: arg.repoUrl,
      });

      // Revalidate the workspaces list
      mutate('/api/workspaces');
      return result;
    }
  );

  return {
    createWorkspace: trigger,
    isCreating: isMutating,
    error,
  };
}

export function useUpdateWorkspace() {
  const { mutate } = useSWRConfig();

  const { trigger, isMutating, error } = useSWRMutation(
    'update-workspace',
    async (
      _,
      {
        arg,
      }: {
        arg: { workspaceId: string; data: { name?: string; repoUrl?: string } };
      }
    ) => {
      const { updateWorkspace } = await import('@repo/orpc/actions');
      const result = await updateWorkspace({
        id: arg.workspaceId,
        ...arg.data,
      });

      // Revalidate both the workspace list and the specific workspace
      mutate('/api/workspaces');
      mutate(`/api/workspaces/${arg.workspaceId}`);
      return result;
    }
  );

  return {
    updateWorkspace: (
      workspaceId: string,
      data: { name?: string; repoUrl?: string }
    ) => trigger({ workspaceId, data }),
    isUpdating: isMutating,
    error,
  };
}

export function useDeleteWorkspace() {
  const { mutate } = useSWRConfig();

  const { trigger, isMutating, error } = useSWRMutation(
    'delete-workspace',
    async (_, { arg }: { arg: string }) => {
      const { deleteWorkspace } = await import('@repo/orpc/actions');
      const result = await deleteWorkspace({ id: arg });

      // Revalidate the workspaces list
      mutate('/api/workspaces');
      return result;
    }
  );

  return {
    deleteWorkspace: trigger,
    isDeleting: isMutating,
    error,
  };
}
