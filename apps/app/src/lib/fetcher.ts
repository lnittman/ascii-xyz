// Type-safe API response wrapper used throughout the app
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Centralized SWR fetcher with error handling
 * Automatically parses JSON and handles HTTP errors
 */
export const fetcher = async (url: string) => {
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    // Extract error message from response or use default
    const errorMessage = data.error || `HTTP ${res.status}: ${res.statusText}`;
    throw new Error(errorMessage);
  }

  return data;
};

/**
 * Fetcher with custom headers (e.g., for authenticated requests)
 */
export const fetcherWithHeaders =
  (headers: HeadersInit) => async (url: string) => {
    const res = await fetch(url, { headers });
    const data = await res.json();

    if (!res.ok) {
      const errorMessage =
        data.error || `HTTP ${res.status}: ${res.statusText}`;
      throw new Error(errorMessage);
    }

    return data;
  };

/**
 * Fetcher for POST/PUT/PATCH requests with body
 */
export const mutationFetcher = async (url: string, { arg }: { arg: any }) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  });

  const data = await res.json();

  if (!res.ok) {
    const errorMessage = data.error || `HTTP ${res.status}: ${res.statusText}`;
    throw new Error(errorMessage);
  }

  return data;
};
