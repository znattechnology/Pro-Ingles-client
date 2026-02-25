import { useCallback, useEffect, useRef, useState } from 'react';

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
}

export interface WebSocketHookReturn {
  isConnected: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  lastMessage: WebSocketMessage | null;
  send: (message: any) => void;
  reconnect: () => void;
  close: () => void;
}

export interface UseWebSocketOptions {
  url: string;
  protocols?: string[];
  onOpen?: () => void;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  onClose?: () => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
}

export function useWebSocket(options: UseWebSocketOptions): WebSocketHookReturn {
  const {
    url,
    protocols,
    onOpen,
    onMessage,
    onError,
    onClose,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    heartbeatInterval = 30000
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'disconnected'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  const ws = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const heartbeatTimeout = useRef<NodeJS.Timeout>();
  const lastPongTime = useRef<number>(Date.now());

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(url, protocols);
      
      ws.current.onopen = () => {
        console.log('📡 WebSocket connected');
        setIsConnected(true);
        setConnectionQuality('excellent');
        reconnectCount.current = 0;
        
        // Start heartbeat
        startHeartbeat();
        
        onOpen?.();
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const message: WebSocketMessage = {
            type: data.type || 'message',
            payload: data,
            timestamp: new Date().toISOString()
          };

          setLastMessage(message);
          
          // Handle pong for connection quality
          if (data.type === 'pong') {
            lastPongTime.current = Date.now();
            updateConnectionQuality();
          }
          
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionQuality('poor');
        onError?.(error);
      };

      ws.current.onclose = () => {
        console.log('📡 WebSocket disconnected');
        setIsConnected(false);
        setConnectionQuality('disconnected');
        
        stopHeartbeat();
        
        // Attempt reconnection
        if (reconnectCount.current < reconnectAttempts) {
          console.log(`🔄 Reconnecting... (${reconnectCount.current + 1}/${reconnectAttempts})`);
          reconnectCount.current++;
          
          reconnectTimeout.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else {
          console.log('❌ Max reconnection attempts reached');
        }
        
        onClose?.();
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionQuality('disconnected');
    }
  }, [url, protocols, onOpen, onMessage, onError, onClose, reconnectAttempts, reconnectInterval]);

  const startHeartbeat = useCallback(() => {
    heartbeatTimeout.current = setInterval(() => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        
        // Check if we received pong recently
        setTimeout(() => {
          updateConnectionQuality();
        }, 1000);
      }
    }, heartbeatInterval);
  }, [heartbeatInterval]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimeout.current) {
      clearInterval(heartbeatTimeout.current);
    }
  }, []);

  const updateConnectionQuality = useCallback(() => {
    const now = Date.now();
    const pongAge = now - lastPongTime.current;
    
    if (pongAge < 1000) {
      setConnectionQuality('excellent');
    } else if (pongAge < 3000) {
      setConnectionQuality('good');
    } else if (pongAge < 10000) {
      setConnectionQuality('poor');
    } else {
      setConnectionQuality('disconnected');
    }
  }, []);

  const send = useCallback((message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      try {
        const messageWithTimestamp = {
          ...message,
          timestamp: new Date().toISOString()
        };
        ws.current.send(JSON.stringify(messageWithTimestamp));
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
      }
    } else {
      console.warn('WebSocket is not connected. Cannot send message.');
    }
  }, []);

  const reconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    reconnectCount.current = 0;
    connect();
  }, [connect]);

  const close = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    stopHeartbeat();
    ws.current?.close();
  }, [stopHeartbeat]);

  useEffect(() => {
    connect();
    
    return () => {
      close();
    };
  }, [connect, close]);

  return {
    isConnected,
    connectionQuality,
    lastMessage,
    send,
    reconnect,
    close
  };
}