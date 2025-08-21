import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

// Import server actions
import {
  createOutput as createOutputAction,
  deleteOutput as deleteOutputAction,
  updateOutput as updateOutputAction,
} from '@repo/orpc/actions';
import { invokeServerAction } from '@repo/orpc/server-action-wrapper';

// The hook is using direct service calls via server actions, not oRPC
// Define the expected types based on what the service expects
interface CreateOutput {
  chatId: string;
  messageId: string;
  title: string;
  type: string;
  content: string;
  metadata?: Record<string, any>;
  isPinned?: boolean;
}

interface UpdateOutput {
  title?: string;
  content?: string;
  metadata?: Record<string, any>;
  isPinned?: boolean;
}

export function useCreateOutput() {
  const { mutate } = useSWRConfig();

  const { trigger, isMutating, error } = useSWRMutation(
    'create-output',
    async (_, { arg }: { arg: CreateOutput }) => {
      // The oRPC action expects specific fields
      const result = await invokeServerAction(createOutputAction, {
        chatId: arg.chatId,
        name: arg.title,
        content: arg.content,
        language: arg.type,
      });
      return result;
    }
  );

  const createWithCacheInvalidation = async (arg: CreateOutput) => {
    const result = await trigger(arg);

    if (result && typeof result === 'object' && 'id' in result) {
      // Invalidate chat outputs cache
      await mutate(`/api/chats/${arg.chatId}/outputs`);
    }

    return result;
  };

  return {
    createOutput: createWithCacheInvalidation,
    isCreating: isMutating,
    createError: error,
  };
}

export function useUpdateOutput() {
  const { mutate } = useSWRConfig();

  const { trigger, isMutating, error } = useSWRMutation(
    'update-output',
    async (_, { arg }: { arg: UpdateOutput & { id: string } }) => {
      const { id, title, content } = arg;
      const result = await invokeServerAction(updateOutputAction, {
        id,
        name: title,
        content,
      });
      return result;
    }
  );

  const updateWithCacheInvalidation = async (
    arg: UpdateOutput & { id: string; chatId: string }
  ) => {
    const result = await trigger(arg);

    if (result) {
      // Invalidate both specific output and chat outputs cache
      await Promise.all([
        mutate(`/api/outputs/${arg.id}`),
        mutate(`/api/chats/${arg.chatId}/outputs`),
      ]);
    }

    return result;
  };

  return {
    updateOutput: updateWithCacheInvalidation,
    isUpdating: isMutating,
    updateError: error,
  };
}

export function useDeleteOutput() {
  const { mutate } = useSWRConfig();

  const { trigger, isMutating, error } = useSWRMutation(
    'delete-output',
    async (_, { arg }: { arg: { id: string } }) => {
      await invokeServerAction(deleteOutputAction, { id: arg.id });
      return true;
    }
  );

  const deleteWithCacheInvalidation = async (arg: {
    id: string;
    chatId: string;
  }) => {
    const result = await trigger(arg);

    if (result) {
      // Invalidate chat outputs cache
      await mutate(`/api/chats/${arg.chatId}/outputs`);
    }

    return result;
  };

  return {
    deleteOutput: deleteWithCacheInvalidation,
    isDeleting: isMutating,
    deleteError: error,
  };
}
