import { NextRequest, NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@repo/backend/convex/_generated/api";

export const runtime = "edge";

/**
 * POST /api/presence/disconnect
 *
 * Called via sendBeacon when user closes tab/navigates away.
 * Disconnects the user's presence session.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionToken } = body;

    if (!sessionToken || typeof sessionToken !== "string") {
      return NextResponse.json(
        { error: "Missing sessionToken" },
        { status: 400 }
      );
    }

    await fetchMutation(api.presence.disconnect, { sessionToken });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Presence disconnect error:", error);
    // Return success anyway - sendBeacon doesn't handle errors
    return NextResponse.json({ success: true });
  }
}
