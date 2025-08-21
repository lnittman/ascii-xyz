import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

// Import server actions
import {
  createTask as createTaskAction,
  deleteTask as deleteTaskAction,
  updateTask as updateTaskAction,
} from '@repo/orpc/actions';

export function useCreateTask() {
  const { mutate } = useSWRConfig();

  const { trigger, isMutating, error } = useSWRMutation(
    'create-task',
    async (_, { arg }: { arg: { workspaceId: string; prompt: string } }) => {
      const result = await createTaskAction({
        title: arg.prompt,
        content: arg.prompt,
        workspaceId: arg.workspaceId,
      });

      // Revalidate relevant caches
      mutate('/api/tasks');
      mutate(`/api/workspaces/${arg.workspaceId}/tasks`);

      return result;
    }
  );

  return { createTask: trigger, isCreating: isMutating, error };
}

export function useUpdateTask() {
  const { mutate } = useSWRConfig();

  const { trigger, isMutating, error } = useSWRMutation(
    'update-task',
    async (
      _,
      {
        arg,
      }: {
        arg: {
          taskId: string;
          data: {
            status?: 'pending' | 'running' | 'completed' | 'failed';
            result?: any;
          };
        };
      }
    ) => {
      const result = await updateTaskAction({
        id: arg.taskId,
        ...arg.data,
      });

      // Revalidate relevant caches
      mutate('/api/tasks');
      mutate(`/api/tasks/${arg.taskId}`);
      // Note: workspace tasks will be revalidated by the action

      return result;
    }
  );

  return {
    updateTask: (
      taskId: string,
      data: {
        status?: 'pending' | 'running' | 'completed' | 'failed';
        result?: any;
      }
    ) => trigger({ taskId, data }),
    isUpdating: isMutating,
    error,
  };
}

export function useDeleteTask() {
  const { mutate } = useSWRConfig();

  const { trigger, isMutating, error } = useSWRMutation(
    'delete-task',
    async (_, { arg }: { arg: string }) => {
      const result = await deleteTaskAction({ id: arg });

      // Revalidate relevant caches
      mutate('/api/tasks');
      // Note: workspace tasks will be revalidated by the action

      return result;
    }
  );

  return { deleteTask: trigger, isDeleting: isMutating, error };
}
