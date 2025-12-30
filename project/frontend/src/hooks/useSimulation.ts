import { useState, useEffect, useRef, useCallback } from 'react';
import type { SerializedState, WorldConfig, ServerMessage } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';

export function useSimulation() {
  const [state, setState] = useState<SerializedState | null>(null);
  const [config, setConfig] = useState<WorldConfig | null>(null);
  const [connected, setConnected] = useState(false);
  const [paused, setPaused] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Connect to WebSocket
  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('Connected to simulation server');
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message: ServerMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'state':
              setState(message.data as SerializedState);
              break;
            case 'config':
              setConfig(message.data as WorldConfig);
              break;
            case 'paused':
              setPaused(true);
              break;
            case 'resumed':
              setPaused(false);
              break;
            case 'reset':
              // State will be sent with next tick
              break;
          }
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      };

      ws.onclose = () => {
        console.log('Disconnected from server');
        setConnected(false);
        // Reconnect after a delay
        setTimeout(connect, 2000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current = ws;
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Send message to server
  const send = useCallback((type: string, data?: unknown) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, data }));
    }
  }, []);

  // Control functions
  const pause = useCallback(() => send('pause'), [send]);
  const resume = useCallback(() => send('resume'), [send]);
  const reset = useCallback((newConfig?: Partial<WorldConfig>) => send('reset', newConfig), [send]);
  const updateConfig = useCallback((updates: Partial<WorldConfig>) => send('updateConfig', updates), [send]);

  return {
    state,
    config,
    connected,
    paused,
    pause,
    resume,
    reset,
    updateConfig,
  };
}
