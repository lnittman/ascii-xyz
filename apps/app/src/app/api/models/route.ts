import { auth } from '@repo/auth/server';
import { createServerClient } from '@repo/orpc/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = createServerClient({ clerkId });
    const models = await client.models.list();

    return NextResponse.json({ success: true, data: models });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch models' },
      { status: 500 }
    );
  }
}
