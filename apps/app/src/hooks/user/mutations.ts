import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';

// Import server actions
import { updateUserModel } from '@repo/orpc/actions';

export function useUpdateUserModel() {
  const { mutate } = useSWRConfig();

  const { trigger, isMutating, error } = useSWRMutation(
    'update-user-model',
    async (_, { arg }: { arg: string }) => {
      return updateUserModel(arg);
    }
  );

  const updateUserModelWithCacheInvalidation = async (modelId: string) => {
    const result = await trigger(modelId);
    if (result) {
      // Invalidate user cache
      await mutate('/api/users/me');
    }
    return result;
  };

  return {
    updateUserModel: updateUserModelWithCacheInvalidation,
    isUpdatingUserModel: isMutating,
    updateUserModelError: error,
  };
}
