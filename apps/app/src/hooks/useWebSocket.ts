'use client';

import { ReconnectingWebSocket } from '@/lib/websocket/ReconnectingWebSocket';
import { useCallback, useEffect, useRef, useState } from 'react';

export type WebSocketStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

interface UseWebSocketOptions {
  daemonId?: string;
  onMessage?: (data: any) => void;
  onStatusChange?: (status: WebSocketStatus) => void;
}

interface UseWebSocketReturn {
  status: WebSocketStatus;
  sendMessage: (message: any) => void;
  lastMessage: any | null;
}

export function useWebSocket(
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const { daemonId, onMessage, onStatusChange } = options;
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<any>(null);
  const wsRef = useRef<ReconnectingWebSocket | null>(null);
  const [connectionInfo, setConnectionInfo] = useState<any>(null);

  // get websocket url from environment or default
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

  // first authenticate and get connection token
  useEffect(() => {
    if (!daemonId) {
      return;
    }

    const setupConnection = async () => {
      try {
        // get connection token from api
        const response = await fetch(`/api/ws?daemonId=${daemonId}`);
        if (!response.ok) {
          throw new Error('failed to get connection token');
        }

        const { data } = await response.json();
        setConnectionInfo(data);
      } catch (_error) {
        setStatus('error');
        onStatusChange?.('error');
      }
    };

    setupConnection();
  }, [daemonId]);

  // then establish websocket connection with token
  useEffect(() => {
    if (!connectionInfo) {
      return;
    }

    // create websocket connection with authentication token
    const ws = new ReconnectingWebSocket({
      url: `${wsUrl}?daemonId=${connectionInfo.daemonId}&token=${connectionInfo.token}`,
      onopen: () => {
        setStatus('connected');
        onStatusChange?.('connected');
      },
      onclose: () => {
        setStatus('disconnected');
        onStatusChange?.('disconnected');
      },
      onerror: () => {
        setStatus('error');
        onStatusChange?.('error');
      },
      onmessage: (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          onMessage?.(data);
        } catch (_error) {}
      },
    });
    wsRef.current = ws;

    // set initial connecting status
    setStatus('connecting');
    onStatusChange?.('connecting');

    // cleanup on unmount
    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [daemonId, wsUrl, onMessage, onStatusChange]);

  const sendMessage = useCallback(
    (message: any) => {
      if (wsRef.current && status === 'connected') {
        wsRef.current.send(message);
      } else {
      }
    },
    [status]
  );

  return {
    status,
    sendMessage,
    lastMessage,
  };
}
