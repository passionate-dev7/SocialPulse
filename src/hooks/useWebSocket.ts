import { useEffect, useRef, useCallback, useState } from 'react';
import { WebSocketMessage, WebSocketSubscription } from '../types/trading';

interface WebSocketConfig {
  url?: string;
  protocols?: string | string[];
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  maxReconnectDelay?: number;
  debug?: boolean;
}

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectCount: number;
}

const defaultConfig: Required<WebSocketConfig> = {
  url: process.env.REACT_APP_WS_URL || 'wss://ws.socialpulse.trade',
  protocols: [],
  reconnectAttempts: 10,
  reconnectInterval: 1000,
  heartbeatInterval: 30000,
  maxReconnectDelay: 30000,
  debug: false,
};

export const useWebSocket = (config: WebSocketConfig = {}) => {
  const finalConfig = { ...defaultConfig, ...config };
  
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectCount: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const subscriptionsRef = useRef<Map<string, WebSocketSubscription>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout>();
  const messageQueueRef = useRef<string[]>([]);
  const reconnectDelayRef = useRef(finalConfig.reconnectInterval);

  const log = useCallback((message: string, ...args: any[]) => {
    if (finalConfig.debug) {
      console.log(`[WebSocket] ${message}`, ...args);
    }
  }, [finalConfig.debug]);

  // Calculate exponential backoff delay
  const getReconnectDelay = useCallback(() => {
    const delay = Math.min(
      reconnectDelayRef.current,
      finalConfig.maxReconnectDelay
    );
    reconnectDelayRef.current = Math.min(
      reconnectDelayRef.current * 1.5,
      finalConfig.maxReconnectDelay
    );
    return delay;
  }, [finalConfig.maxReconnectDelay]);

  // Reset reconnect delay on successful connection
  const resetReconnectDelay = useCallback(() => {
    reconnectDelayRef.current = finalConfig.reconnectInterval;
  }, [finalConfig.reconnectInterval]);

  // Send heartbeat to keep connection alive
  const sendHeartbeat = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const heartbeat = JSON.stringify({
        type: 'ping',
        timestamp: Date.now(),
      });
      wsRef.current.send(heartbeat);
      log('Heartbeat sent');
    }
  }, [log]);

  // Start heartbeat interval
  const startHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearInterval(heartbeatTimeoutRef.current);
    }
    
    heartbeatTimeoutRef.current = setInterval(
      sendHeartbeat,
      finalConfig.heartbeatInterval
    );
    log('Heartbeat started');
  }, [sendHeartbeat, finalConfig.heartbeatInterval, log]);

  // Stop heartbeat interval
  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearInterval(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = undefined;
      log('Heartbeat stopped');
    }
  }, [log]);

  // Process queued messages
  const processMessageQueue = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && messageQueueRef.current.length > 0) {
      log(`Processing ${messageQueueRef.current.length} queued messages`);
      
      const messages = [...messageQueueRef.current];
      messageQueueRef.current = [];
      
      messages.forEach(message => {
        wsRef.current?.send(message);
      });
    }
  }, [log]);

  // Handle WebSocket messages
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      log('Message received:', message);

      // Handle pong response
      if (message.type === 'pong') {
        return;
      }

      // Route message to appropriate subscription
      const subscription = subscriptionsRef.current.get(message.channel);
      if (subscription) {
        subscription.callback(message.data);
      }
    } catch (error) {
      log('Failed to parse message:', error);
    }
  }, [log]);

  // Handle WebSocket connection open
  const handleOpen = useCallback(() => {
    log('Connection established');
    
    setState(prev => ({
      ...prev,
      isConnected: true,
      isConnecting: false,
      error: null,
      reconnectCount: 0,
    }));

    resetReconnectDelay();
    startHeartbeat();
    processMessageQueue();

    // Resubscribe to all channels
    subscriptionsRef.current.forEach((subscription, channel) => {
      const subscribeMessage = JSON.stringify({
        type: 'subscribe',
        channel,
        params: subscription.params,
      });
      wsRef.current?.send(subscribeMessage);
      log(`Resubscribed to channel: ${channel}`);
    });
  }, [log, resetReconnectDelay, startHeartbeat, processMessageQueue]);

  // Handle WebSocket connection close
  const handleClose = useCallback((event: CloseEvent) => {
    log('Connection closed:', event.code, event.reason);
    
    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
    }));

    stopHeartbeat();

    // Attempt reconnection if not manually closed
    if (event.code !== 1000 && state.reconnectCount < finalConfig.reconnectAttempts) {
      const delay = getReconnectDelay();
      log(`Reconnecting in ${delay}ms... (attempt ${state.reconnectCount + 1})`);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          reconnectCount: prev.reconnectCount + 1,
        }));
        connect();
      }, delay);
    }
  }, [log, stopHeartbeat, state.reconnectCount, finalConfig.reconnectAttempts, getReconnectDelay]);

  // Handle WebSocket errors
  const handleError = useCallback((event: Event) => {
    const error = 'WebSocket connection error';
    log('Connection error:', event);
    
    setState(prev => ({
      ...prev,
      error,
      isConnecting: false,
    }));
  }, [log]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.CONNECTING || 
        wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    log('Connecting to:', finalConfig.url);
    
    setState(prev => ({
      ...prev,
      isConnecting: true,
      error: null,
    }));

    try {
      wsRef.current = new WebSocket(finalConfig.url, finalConfig.protocols);
      
      wsRef.current.onopen = handleOpen;
      wsRef.current.onclose = handleClose;
      wsRef.current.onerror = handleError;
      wsRef.current.onmessage = handleMessage;
    } catch (error) {
      log('Failed to create WebSocket:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to create WebSocket connection',
        isConnecting: false,
      }));
    }
  }, [finalConfig.url, finalConfig.protocols, log, handleOpen, handleClose, handleError, handleMessage]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    log('Disconnecting...');
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    stopHeartbeat();
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      error: null,
      reconnectCount: 0,
    }));
  }, [log, stopHeartbeat]);

  // Send message with queuing support
  const sendMessage = useCallback((message: any) => {
    const serializedMessage = JSON.stringify(message);
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(serializedMessage);
      log('Message sent:', message);
    } else {
      messageQueueRef.current.push(serializedMessage);
      log('Message queued:', message);
    }
  }, [log]);

  // Subscribe to a channel
  const subscribe = useCallback((subscription: WebSocketSubscription) => {
    log(`Subscribing to channel: ${subscription.channel}`);
    
    subscriptionsRef.current.set(subscription.channel, subscription);

    if (state.isConnected) {
      sendMessage({
        type: 'subscribe',
        channel: subscription.channel,
        params: subscription.params,
      });
    }
  }, [state.isConnected, sendMessage, log]);

  // Unsubscribe from a channel
  const unsubscribe = useCallback((channel: string) => {
    log(`Unsubscribing from channel: ${channel}`);
    
    subscriptionsRef.current.delete(channel);

    if (state.isConnected) {
      sendMessage({
        type: 'unsubscribe',
        channel,
      });
    }
  }, [state.isConnected, sendMessage, log]);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, []); // Empty dependency array for mount/unmount only

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      stopHeartbeat();
    };
  }, [stopHeartbeat]);

  return {
    ...state,
    connect,
    disconnect,
    sendMessage,
    subscribe,
    unsubscribe,
    clearError: useCallback(() => {
      setState(prev => ({ ...prev, error: null }));
    }, []),
  };
};

// Hook for managing multiple WebSocket connections
export const useMultiWebSocket = (configs: Record<string, WebSocketConfig>) => {
  const connections = useRef<Record<string, ReturnType<typeof useWebSocket>>>({});
  
  useEffect(() => {
    // Initialize connections
    Object.entries(configs).forEach(([key, config]) => {
      if (!connections.current[key]) {
        // We can't actually call hooks dynamically, so this is a simplified version
        // In practice, you'd need to restructure this differently
        console.log(`Would initialize connection: ${key}`);
      }
    });
  }, [configs]);

  const getConnection = useCallback((key: string) => {
    return connections.current[key];
  }, []);

  return {
    getConnection,
    connections: connections.current,
  };
};

// Utility hook for WebSocket with automatic reconnection and state persistence
export const useReliableWebSocket = (
  url: string,
  options?: Partial<WebSocketConfig>
) => {
  const config = { ...options, url };
  return useWebSocket(config);
};