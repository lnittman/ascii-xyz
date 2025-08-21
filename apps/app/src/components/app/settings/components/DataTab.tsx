import { getServerClient } from '@/lib/orpc.server';
import { auth } from '@repo/auth/server';
import { DataTabClient } from './DataTabClient';

export async function DataTab() {
  const { userId: clerkId } = await auth();

  let dataSettings;
  let links;

  if (clerkId) {
    try {
      const client = await getServerClient();
      dataSettings = await client.settings.data.get();
      links = await client.share.list();
    } catch (_error) {}
  }

  return (
    <DataTabClient initialDataSettings={dataSettings} initialLinks={links} />
  );
}
