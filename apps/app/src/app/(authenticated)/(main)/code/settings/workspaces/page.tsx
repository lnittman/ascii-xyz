import { WorkspacesTab } from '@/components/code/settings/components/WorkspacesTab';
import { auth } from '@repo/auth/server';
import { workspaceService } from '@repo/services/workspace';

export default async function WorkspacesSettingsPage() {
  const { userId } = await auth();

  let initial;
  if (userId) {
    try {
      initial = await workspaceService.getWorkspaces(userId);
    } catch (_error) {}
  }

  return (
    <div className="h-full w-full overflow-auto bg-background">
      <div className="max-w-3xl p-8">
        <div className="mb-8">
          <h2 className="mb-2 font-semibold text-foreground text-xl">
            Workspaces
          </h2>
          <p className="text-muted-foreground text-sm">
            Manage your workspaces and projects
          </p>
        </div>
        <WorkspacesTab initialWorkspaces={initial} />
      </div>
    </div>
  );
}
