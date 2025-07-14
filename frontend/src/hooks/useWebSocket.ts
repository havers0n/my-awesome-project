import { useState, useEffect, useRef, useCallback } from 'react';
import { ProcessingStatus } from '../types/forecast';

interface UseWebSocketReturn {
  status: ProcessingStatus;
  isConnected: boolean;
  error: string | null;
  reconnect: () => void;
}

export const useWebSocket = (url: string): UseWebSocketReturn => {
  const [status, setStatus] = useState<ProcessingStatus>({
    stage: 'idle',
    message: 'Ожидание...',
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
    try {
      // Создаем WebSocket соединение
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        console.log('WebSocket соединение установлено');
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
          console.error('Ошибка парсинга WebSocket сообщения:', parseError);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket соединение закрыто', event.code, event.reason);
        setIsConnected(false);
        
        // Попытка переподключения, если соединение было закрыто неожиданно
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Попытка переподключения ${reconnectAttempts.current}/${maxReconnectAttempts}`);
            connect();
          }, timeout);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket ошибка:', error);
        setError('Ошибка соединения с сервером');
        setIsConnected(false);
      };

    } catch (connectionError) {
      console.error('Ошибка создания WebSocket соединения:', connectionError);
      setError('Не удалось установить соединение');
    }
  }, [url]);

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
    // Подключаемся при монтировании компонента
    connect();

    // Cleanup при размонтировании
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Компонент размонтирован');
      }
    };
  }, [connect]);

  return {
    status,
    isConnected,
    error,
    reconnect
  };
};
