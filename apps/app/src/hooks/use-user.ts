"use client";

import { useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { useConvexAuth } from "convex/react";

// Hook to get current user from Convex database
export function useCurrentUser() {
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(
    api.functions.queries.users.current,
    isAuthenticated ? {} : "skip"
  );
  return user;
}

// Hook to check authentication status
export function useAuthStatus() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const user = useCurrentUser();
  
  return {
    isLoading: isLoading || (isAuthenticated && !user),
    isAuthenticated: isAuthenticated && !!user,
    user,
  };
}

// Example usage:
/*
function UserProfile() {
  const { isLoading, isAuthenticated, user } = useAuthStatus();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }
  
  return (
    <div>
      <h2>Welcome, {user.name}!</h2>
      <p>{user.email}</p>
      <img src={user.imageUrl} alt={user.name} />
    </div>
  );
}
*/
