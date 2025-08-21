import { fetcher } from '@/lib/fetcher';
import useSWR from 'swr';

export function useOutputVersions(outputId: string | null) {
  const { data, error, isLoading } = useSWR(
    outputId ? `/api/outputs/${outputId}/versions` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    versions: data?.data || [],
    isLoading,
    error,
  };
}

export function useOutputDiff(
  outputId: string | null,
  version1: number | null,
  version2: number | null
) {
  const { data, error, isLoading } = useSWR(
    outputId && version1 && version2
      ? `/api/outputs/${outputId}/compare?v1=${version1}&v2=${version2}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    diff: data?.data,
    isLoading,
    error,
  };
}
