import { createORPCHooks } from '@/hooks/use-orpc';
import { orpcClient } from '@/lib/orpc-client';

// Import your oRPC procedures
import type { Router } from '@repo/orpc/router';

// Create procedures object - this would typically come from your oRPC client
const procedures = orpcClient as unknown as Router;

// Create typed hooks for your procedures
export const orpc = createORPCHooks(procedures);

// Example usage in components:

/*
// Getting data (query)
export function UserList() {
  const { data: users, error, isLoading } = orpc.useQuery(
    'user.list', // Procedure name
    { limit: 10 }, // Input
    { requireAuth: true } // Options
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <ul>
      {users?.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}

// Changing data (mutation)
export function CreateUserForm() {
  const { mutate: callMutation } = orpc.useMutation();
  const { data: users, mutate: refetchUsers } = orpc.useQuery('user.list', { limit: 10 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
      await callMutation(
        'user.create', // Procedure name
        { 
          name: formData.get('name') as string,
          email: formData.get('email') as string 
        },
        {
          invalidateKeys: [['orpc-query-auth', 'user.list', { limit: 10 }]],
          optimisticData: [
            ...(users || []),
            { 
              id: 'temp-id', 
              name: formData.get('name') as string,
              email: formData.get('email') as string 
            }
          ]
        }
      );
      
      form.reset();
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit">Create User</button>
    </form>
  );
}

// Server Action usage (for mutations from Server Components)
'use server';

import { router } from '@repo/orpc/server';

// Create a server action for mutations
export const updateUserAction = router.user.update.actionable();

// Usage in a Server Component
export async function UserProfile({ userId }: { userId: string }) {
  const user = await router.user.get({ id: userId });
  
  return (
    <div>
      <h1>{user.name}</h1>
      <UpdateForm user={user} />
    </div>
  );
}

// Client component for the form
'use client';

export function UpdateForm({ user }: { user: any }) {
  const updateUser = updateUserAction.bind(null, { id: user.id });
  
  return (
    <form action={updateUser}>
      <input name="name" defaultValue={user.name} />
      <button type="submit">Update</button>
    </form>
  );
}
*/
