import { useEffect, useCallback, useRef } from "react";
import { useLayoutStore } from "../store/layoutStore";
import type { LayoutItem } from "../store/layoutStore";

export interface UseLayoutSyncOptions {
  enabled?: boolean;
  wsUrl?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onSync?: (layout: LayoutItem[]) => void;
}

export interface UseLayoutSyncReturn {
  isConnected: boolean;
  sync: () => Promise<void>;
  disconnect: () => void;
  connect: () => void;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
}

interface WebSocketMessage {
  type: 'layout_update' | 'layout_sync' | 'ping' | 'pong';
  data?: any;
  timestamp?: number;
}

export const useLayoutSync = (options: UseLayoutSyncOptions = {}): UseLayoutSyncReturn => {
  const {
    enabled = true,
    wsUrl = 'ws://localhost:3001/ws',
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    onConnect,
    onDisconnect,
    onError,
    onSync,
  } = options;

  const { layout, updateLayout, sync, syncStatus, setSyncStatus, setError } = useLayoutStore();

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isConnectedRef = useRef(false);
  const lastSyncedLayoutRef = useRef<LayoutItem[]>([]);

  // Send message to WebSocket
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Handle WebSocket messages
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        switch (message.type) {
          case 'layout_update':
            if (message.data && message.data.layout) {
              // Only update if the layout is different from our current one
              if (JSON.stringify(message.data.layout) !== JSON.stringify(layout)) {
                updateLayout(message.data.layout);
                lastSyncedLayoutRef.current = message.data.layout;
                onSync?.(message.data.layout);
              }
            }
            break;
          case 'layout_sync':
            setSyncStatus('success');
            break;
          case 'ping':
            sendMessage({ type: 'pong' });
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
        onError?.(error instanceof Error ? error : new Error('Message parsing failed'));
      }
    },
    [layout, updateLayout, setSyncStatus, sendMessage, onSync, onError]
  );

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        isConnectedRef.current = true;
        reconnectAttemptsRef.current = 0;
        setSyncStatus('idle');
        onConnect?.();

        // Send current layout on connect
        sendMessage({
          type: 'layout_sync',
          data: { layout },
          timestamp: Date.now(),
        });
      };

      wsRef.current.onmessage = handleMessage;

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        isConnectedRef.current = false;
        onDisconnect?.();

        // Attempt to reconnect
        if (enabled && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      wsRef.current.onerror = error => {
        console.error('WebSocket error:', error);
        setSyncStatus('error');
        setError('WebSocket connection failed');
        onError?.(new Error('WebSocket connection failed'));
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      onError?.(error instanceof Error ? error : new Error('Connection failed'));
    }
  }, [
    enabled,
    wsUrl,
    layout,
    maxReconnectAttempts,
    reconnectInterval,
    handleMessage,
    setSyncStatus,
    setError,
    onConnect,
    onDisconnect,
    onError,
    sendMessage,
  ]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    isConnectedRef.current = false;
  }, []);

  // Sync layout with backend
  const syncLayout = useCallback(async () => {
    if (!isConnectedRef.current) {
      await sync(); // Fallback to HTTP sync
      return;
    }

    // Only sync if layout has changed
    if (JSON.stringify(layout) !== JSON.stringify(lastSyncedLayoutRef.current)) {
      setSyncStatus('syncing');

      sendMessage({
        type: 'layout_update',
        data: { layout },
        timestamp: Date.now(),
      });

      lastSyncedLayoutRef.current = layout;
    }
  }, [layout, sync, setSyncStatus, sendMessage]);

  // Auto-connect on mount
  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  // Sync layout changes
  useEffect(() => {
    if (enabled && isConnectedRef.current) {
      const timeoutId = setTimeout(() => {
        syncLayout();
      }, 500); // Debounce sync

      return () => clearTimeout(timeoutId);
    }
  }, [layout, enabled, syncLayout]);

  // Heartbeat to keep connection alive
  useEffect(() => {
    if (!enabled || !isConnectedRef.current) return;

    const heartbeat = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        sendMessage({ type: 'ping' });
      }
    }, 30000); // Send ping every 30 seconds

    return () => clearInterval(heartbeat);
  }, [enabled, sendMessage]);

  return {
    isConnected: isConnectedRef.current,
    sync: syncLayout,
    disconnect,
    connect,
    syncStatus,
  };
};
