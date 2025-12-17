"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

// Generate a unique session ID for this browser tab
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// Get or create session ID (persists for tab lifetime)
let sessionId: string | null = null;
function getSessionId(): string {
  if (!sessionId) {
    sessionId = generateSessionId();
  }
  return sessionId;
}

export interface PresenceUser {
  id: string;
  name: string;
  updated: number;
}

export interface PresenceState {
  status: "loading" | "ready";
  users: PresenceUser[];
  isConnected: boolean;
}

const HEARTBEAT_INTERVAL = 10000; // 10 seconds
const DISCONNECT_ENDPOINT = "/api/presence/disconnect"; // For sendBeacon

interface UsePresenceOptions {
  /** User display name (defaults to Clerk user name) */
  userName?: string;
  /** Heartbeat interval in ms (default: 10000) */
  heartbeatInterval?: number;
}

/**
 * Hook to manage presence in a "room" (e.g., artwork page, collection page)
 *
 * @param roomId - Unique identifier for the room (e.g., artwork ID)
 * @param options - Configuration options
 * @returns Presence state with list of users and connection status
 */
export function usePresence(
  roomId: string | undefined,
  options: UsePresenceOptions = {}
): PresenceState {
  const { user } = useUser();
  const heartbeatMutation = useMutation(api.presence.heartbeat);
  const [roomToken, setRoomToken] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTokenRef = useRef<string | null>(null);

  const {
    userName = user?.fullName || user?.username || "Anonymous",
    heartbeatInterval = HEARTBEAT_INTERVAL,
  } = options;

  const userId = user?.id;

  // Send heartbeat and get room token
  const sendHeartbeat = useCallback(async () => {
    if (!roomId || !userId) return;

    try {
      const result = await heartbeatMutation({
        roomId,
        userId,
        sessionId: getSessionId(),
        interval: heartbeatInterval,
      });

      if (result) {
        setRoomToken(result.roomToken);
        sessionTokenRef.current = result.sessionToken;
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Presence heartbeat failed:", error);
      setIsConnected(false);
    }
  }, [roomId, userId, heartbeatMutation, heartbeatInterval]);

  // Start heartbeat when room/user changes
  useEffect(() => {
    if (!roomId || !userId) {
      setIsConnected(false);
      return;
    }

    // Send initial heartbeat
    sendHeartbeat();

    // Set up interval
    intervalRef.current = setInterval(sendHeartbeat, heartbeatInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [roomId, userId, sendHeartbeat, heartbeatInterval]);

  // Handle page unload - use sendBeacon for reliable disconnect
  useEffect(() => {
    const handleUnload = () => {
      if (sessionTokenRef.current) {
        // Use sendBeacon for reliable delivery on page close
        const data = JSON.stringify({ sessionToken: sessionTokenRef.current });
        navigator.sendBeacon(DISCONNECT_ENDPOINT, data);
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
    };
  }, []);

  // Query presence list using room token
  const presenceList = useQuery(
    api.presence.list,
    roomToken ? { roomToken } : "skip"
  );

  // Transform presence data to user-friendly format
  const users: PresenceUser[] = (presenceList ?? []).map((p) => ({
    id: p.userId,
    name: p.userId === userId ? userName : `User ${p.userId.slice(-4)}`,
    updated: p.lastDisconnected,
  }));

  return {
    status: roomToken && presenceList !== undefined ? "ready" : "loading",
    users,
    isConnected,
  };
}

/**
 * Hook to check if a specific user is online anywhere
 */
export function useUserOnline(userId: string | undefined) {
  const result = useQuery(
    api.presence.isUserOnline,
    userId ? { userId } : "skip"
  );

  return {
    isOnline: result && result.length > 0,
    rooms: result ?? [],
  };
}
