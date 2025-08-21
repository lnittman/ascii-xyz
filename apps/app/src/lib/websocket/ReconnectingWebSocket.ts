type WebSocketMessage = {
  type: string;
  payload?: any;
};

type ReconnectingWebSocketOptions = {
  url: string;
  protocols?: string | string[];
  reconnectInterval?: number;
  maxReconnectInterval?: number;
  reconnectDecay?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  heartbeatTimeout?: number;
  onopen?: (event: Event) => void;
  onclose?: (event: CloseEvent) => void;
  onerror?: (event: Event) => void;
  onmessage?: (event: MessageEvent) => void;
  onreconnect?: (attemptNumber: number) => void;
  onmaximum?: () => void;
};

export class ReconnectingWebSocket {
  private url: string;
  private protocols?: string | string[];
  private ws: WebSocket | null = null;
  private forcedClose = false;
  private reconnectAttempts = 0;
  private messageQueue: WebSocketMessage[] = [];

  // reconnection settings
  private reconnectInterval: number;
  private maxReconnectInterval: number;
  private reconnectDecay: number;
  private maxReconnectAttempts: number;

  // heartbeat settings
  private heartbeatInterval: number;
  private heartbeatTimeout: number;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private heartbeatResponseTimer: NodeJS.Timeout | null = null;

  // event handlers
  private onopen?: (event: Event) => void;
  private onclose?: (event: CloseEvent) => void;
  private onerror?: (event: Event) => void;
  private onmessage?: (event: MessageEvent) => void;
  private onreconnect?: (attemptNumber: number) => void;
  private onmaximum?: () => void;

  constructor(options: ReconnectingWebSocketOptions) {
    this.url = options.url;
    this.protocols = options.protocols;

    // set defaults
    this.reconnectInterval = options.reconnectInterval || 1000;
    this.maxReconnectInterval = options.maxReconnectInterval || 30000;
    this.reconnectDecay = options.reconnectDecay || 1.5;
    this.maxReconnectAttempts =
      options.maxReconnectAttempts || Number.POSITIVE_INFINITY;
    this.heartbeatInterval = options.heartbeatInterval || 30000;
    this.heartbeatTimeout = options.heartbeatTimeout || 10000;

    // set event handlers
    this.onopen = options.onopen;
    this.onclose = options.onclose;
    this.onerror = options.onerror;
    this.onmessage = options.onmessage;
    this.onreconnect = options.onreconnect;
    this.onmaximum = options.onmaximum;

    this.connect();
  }

  private connect(): void {
    try {
      this.ws = new WebSocket(this.url, this.protocols);
      this.attachEventListeners();
    } catch (_error) {
      this.scheduleReconnect();
    }
  }

  private attachEventListeners(): void {
    if (!this.ws) {
      return;
    }

    this.ws.onopen = (event) => {
      this.reconnectAttempts = 0;
      this.forcedClose = false;

      // start heartbeat
      this.startHeartbeat();

      // flush message queue
      this.flushMessageQueue();

      // call user handler
      this.onopen?.(event);
    };

    this.ws.onclose = (event) => {
      this.stopHeartbeat();

      if (this.forcedClose) {
        this.onclose?.(event);
      } else {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (event) => {
      this.onerror?.(event);
    };

    this.ws.onmessage = (event) => {
      // reset heartbeat timeout on any message
      this.resetHeartbeatTimeout();

      try {
        const message = JSON.parse(event.data);

        // handle heartbeat response
        if (message.type === 'pong') {
          return;
        }

        // pass to user handler
        this.onmessage?.(event);
      } catch (_error) {
        // if not json, pass raw message
        this.onmessage?.(event);
      }
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.onmaximum?.();
      return;
    }

    const timeout = Math.min(
      this.reconnectInterval * this.reconnectDecay ** this.reconnectAttempts,
      this.maxReconnectInterval
    );

    this.reconnectAttempts++;

    setTimeout(() => {
      this.onreconnect?.(this.reconnectAttempts);
      this.connect();
    }, timeout);
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping' });

        // set timeout for pong response
        this.heartbeatResponseTimer = setTimeout(() => {
          this.ws?.close();
        }, this.heartbeatTimeout);
      }
    }, this.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.resetHeartbeatTimeout();
  }

  private resetHeartbeatTimeout(): void {
    if (this.heartbeatResponseTimer) {
      clearTimeout(this.heartbeatResponseTimer);
      this.heartbeatResponseTimer = null;
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  public send(message: WebSocketMessage): void {
    if (this.isConnected()) {
      try {
        this.ws?.send(JSON.stringify(message));
      } catch (_error) {
        this.messageQueue.push(message);
      }
    } else {
      // queue message for later
      this.messageQueue.push(message);
    }
  }

  public close(): void {
    this.forcedClose = true;
    this.stopHeartbeat();
    this.messageQueue = [];
    if (this.ws) {
      this.ws.close();
    }
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  public getReadyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  public getBufferedAmount(): number {
    return this.ws?.bufferedAmount ?? 0;
  }

  public getQueuedMessageCount(): number {
    return this.messageQueue.length;
  }
}
