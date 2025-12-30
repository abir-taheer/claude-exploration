import { useState, useEffect, useRef, useCallback } from 'react';
import type { SerializedState, WorldConfig, ServerMessage, HistoryPoint } from '../types';

// Construct WebSocket URL dynamically based on current host
function getWebSocketUrl(): string {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  // In production (through nginx), ws is at /ws on same host
  // In development, backend is on port 8080
  if (window.location.port === '5173' || window.location.port === '5174') {
    return 'ws://localhost:8080/ws';
  }
  return `${protocol}//${host}/ws`;
}

export function useSimulation() {
  const [state, setState] = useState<SerializedState | null>(null);
  const [config, setConfig] = useState<WorldConfig | null>(null);
  const [connected, setConnected] = useState(false);
  const [paused, setPaused] = useState(false);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [speed, setSpeed] = useState(1);
  const wsRef = useRef<WebSocket | null>(null);

  // Connect to WebSocket
  useEffect(() => {
    const connect = () => {
      const wsUrl = getWebSocketUrl();
      console.log('Connecting to:', wsUrl);
      const ws = new WebSocket(wsUrl);

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
              setHistory([]);
              break;
            case 'history':
              setHistory(message.data as HistoryPoint[]);
              break;
            case 'speed':
              setSpeed(message.data as number);
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
  const changeSpeed = useCallback((newSpeed: number) => send('setSpeed', newSpeed), [send]);

  return {
    state,
    config,
    connected,
    paused,
    history,
    speed,
    pause,
    resume,
    reset,
    updateConfig,
    changeSpeed,
  };
}
