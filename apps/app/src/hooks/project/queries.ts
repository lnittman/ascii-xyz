import type { Project } from '@repo/database/types';
import { useQuery } from '@repo/orpc/hooks';

/**
 * oRPC hooks for fetching project data
 */

// Hook to fetch a single project with fallback
export function useProject(id: string | null) {
  const { data, error, mutate, isValidating } = useQuery(
    id ? 'projects.get' : null,
    id ? { id } : undefined,
    {
      revalidateOnFocus: false,
      suspense: false,
      revalidateOnMount: true,
    }
  );

  return {
    data,
    isLoading: !error && !data && !!id,
    isValidating,
    isError: !!error,
    error,
    mutate,
  };
}

// Hook to fetch all projects
export function useProjects(initialData?: Project[]) {
  const { data, error, mutate, isValidating } = useQuery(
    'projects.list',
    undefined,
    {
      revalidateOnFocus: false,
      suspense: false,
      fallbackData: initialData,
    }
  );

  return {
    projects: data,
    isLoading: !error && !data,
    isValidating,
    isError: !!error,
    error,
    mutate,
  };
}
