import { DaemonTokens } from '@/components/settings/DaemonTokens';
import { auth } from '@repo/auth/server';

export default async function TokensPage() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="mb-2 font-medium text-2xl">daemon tokens</h1>
        <p className="text-muted-foreground text-sm">
          generate auth tokens to connect your arbor daemon to workspaces
        </p>
      </div>

      <DaemonTokens />
    </div>
  );
}
