import { workspacesAtom } from '@/atoms/workspace';
import { type ApiResponse, fetcher } from '@/lib/fetcher';
import type { Workspace } from '@repo/database/types';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import useSWR from 'swr';

export function useWorkspaces(initialData?: Workspace[]) {
  const setWorkspaces = useSetAtom(workspacesAtom);

  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Workspace[]>>(
    '/api/workspaces',
    fetcher,
    {
      fallbackData: initialData
        ? { success: true, data: initialData }
        : undefined,
      revalidateOnFocus: false,
    }
  );

  // Sync workspaces data to Jotai atom for global state
  useEffect(() => {
    if (data?.data) {
      setWorkspaces(data.data);
    }
  }, [data?.data, setWorkspaces]);

  return {
    workspaces: data?.data || [],
    isLoading,
    isError: !!error,
    error,
    refetch: mutate,
  };
}

export function useWorkspace(workspaceId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse<Workspace>>(
    workspaceId ? `/api/workspaces/${workspaceId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    workspace: data?.data,
    isLoading,
    isError: !!error,
    error,
    refetch: mutate,
  };
}
