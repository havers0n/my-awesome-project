import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ProcessingStatus } from '../types/forecast';

interface UseWebSocketOptions {
  enabled?: boolean;
}

interface UseWebSocketReturn {
  status: ProcessingStatus;
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
}

export const useWebSocket = (url: string, options: UseWebSocketOptions = {}): UseWebSocketReturn => {
  const { enabled = true } = options;
  const { t } = useTranslation();
  const [status, setStatus] = useState<ProcessingStatus>({
    stage: 'idle',
    message: t('websocket.status.idle'),
    progress: 0,
    timestamp: Date.now()
  });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!enabled || !url) {
      console.log('WebSocket connection disabled or URL not provided.');
      return;
    }

    try {
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as ProcessingStatus;
          setStatus({
            ...data,
            timestamp: Date.now()
          });
        } catch (parseError) {
          console.error('Error parsing WebSocket message:', parseError);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket connection closed', event.code, event.reason);
        setIsConnected(false);
        
        if (enabled && event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect ${reconnectAttempts.current}/${maxReconnectAttempts}`);
            connect();
          }, timeout);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError(t('websocket.error.connectionFailed'));
        setIsConnected(false);
      };

    } catch (connectionError) {
      console.error('Error creating WebSocket connection:', connectionError);
      setError(t('websocket.error.setupFailed'));
    }
  }, [url, enabled, t]);

  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    reconnectAttempts.current = 0;
    connect();
  }, [connect]);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
      }
    };
  }, [connect, enabled]);

  return {
    status,
    isConnected,
    error,
    reconnect
  };
};
