// Discriminated union for query states
export type QueryState<T> =
  | { status: "loading"; data: undefined }
  | { status: "ready"; data: T }
  | { status: "empty"; data: T }; // For arrays when length === 0

// State for action-based queries
export type ActionState<T> =
  | { status: "idle"; data: undefined; error: undefined }
  | { status: "loading"; data: undefined; error: undefined }
  | { status: "ready"; data: T; error: undefined }
  | { status: "error"; data: undefined; error: Error };

// Helper to create query state from Convex useQuery result
export function createQueryState<T>(result: T | undefined): QueryState<T> {
  if (result === undefined) {
    return { status: "loading", data: undefined };
  }
  if (Array.isArray(result) && result.length === 0) {
    return { status: "empty", data: result };
  }
  return { status: "ready", data: result };
}

// Helper to create query state for nullable single items
export function createSingleQueryState<T>(result: T | null | undefined): QueryState<T | null> {
  if (result === undefined) {
    return { status: "loading", data: undefined };
  }
  if (result === null) {
    return { status: "empty", data: null };
  }
  return { status: "ready", data: result };
}
