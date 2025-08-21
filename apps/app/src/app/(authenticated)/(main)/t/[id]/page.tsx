import { TaskDetail } from '@/components/code/TaskDetail';
import { auth } from '@repo/auth/server';
import { taskService } from '@repo/services/task';
import { userService } from '@repo/services/user';
import { workspaceService } from '@repo/services/workspace';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TaskPage({ params }: PageProps) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  try {
    // get user's internal id
    const user = await userService.getUserByClerkId(userId);

    // fetch task and verify user owns it
    const task = await taskService.getById(id);

    if (!task || task.userId !== user.id) {
      notFound();
    }

    // fetch the workspace
    const workspace = await workspaceService.getById(task.workspaceId);

    if (!workspace) {
      notFound();
    }

    return <TaskDetail task={task} workspace={workspace} />;
  } catch (_error) {
    notFound();
  }
}
