export interface Context {
  clerkId?: string; // Clerk user ID
  headers?: Headers;
}

export interface ProtectedContext extends Context {
  userId: string; // Internal user ID
  clerkId: string; // Clerk user ID (required)
}
