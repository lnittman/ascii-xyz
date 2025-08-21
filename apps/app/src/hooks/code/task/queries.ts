import { type ApiResponse, fetcher } from '@/lib/fetcher';
import type { Task } from '@repo/database/types';
import useSWR from 'swr';

export function useTasks() {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Task[]>>(
    '/api/tasks',
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );
  return {
    tasks: data?.data ?? [],
    isLoading,
    error,
    mutate,
  };
}

export function useTask(taskId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Task>>(
    taskId ? `/api/tasks/${taskId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );
  return {
    task: data?.data,
    isLoading,
    error,
    mutate,
  };
}

export function useWorkspaceTasks(workspaceId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Task[]>>(
    workspaceId ? `/api/workspaces/${workspaceId}/tasks` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );
  return {
    tasks: data?.data ?? [],
    isLoading,
    error,
    mutate,
  };
}
