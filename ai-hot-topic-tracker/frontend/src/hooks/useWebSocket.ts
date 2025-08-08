import { useState, useEffect, useRef, useCallback } from 'react';

interface UseWebSocketOptions {
  shouldReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export const useWebSocket = (
  url: string,
  options: UseWebSocketOptions = {}
) => {
  const {
    shouldReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const reconnectAttempts = useRef(0);
  const websocket = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    try {
      setConnectionStatus('connecting');
      websocket.current = new WebSocket(url);

      websocket.current.onopen = () => {
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
      };

      websocket.current.onmessage = (event) => {
        setLastMessage(event);
      };

      websocket.current.onclose = () => {
        setConnectionStatus('disconnected');
        
        if (shouldReconnect && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          setTimeout(connect, reconnectInterval);
        }
      };

      websocket.current.onerror = () => {
        setConnectionStatus('disconnected');
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setConnectionStatus('disconnected');
    }
  }, [url, shouldReconnect, reconnectInterval, maxReconnectAttempts]);

  useEffect(() => {
    connect();

    return () => {
      websocket.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((message: any) => {
    if (websocket.current?.readyState === WebSocket.OPEN) {
      websocket.current.send(JSON.stringify(message));
    }
  }, []);

  return {
    connectionStatus,
    lastMessage,
    sendMessage,
  };
};
