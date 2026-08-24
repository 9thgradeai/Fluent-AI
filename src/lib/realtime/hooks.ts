// WebSocket client hook for realtime conversations.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type WSState = "connecting" | "connected" | "disconnected" | "error";

export interface WSMessage {
  type: string;
  data?: unknown;
  timestamp?: number;
}

export interface UseRealtimeConversationOpts {
  conversationId: string;
  onMessage?: (msg: WSMessage) => void;
  onStateChange?: (state: WSState) => void;
  onError?: (error: Error) => void;
}

export function useRealtimeConversation(opts: UseRealtimeConversationOpts) {
  const wsRef = useRef<WebSocket | null>(null);
  const [state, setState] = useState<WSState>("disconnected");
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>(undefined);
  const reconnectAttempts = useRef(0);

  // Store opts in a ref to avoid stale closures
  const optsRef = useRef(opts);

  // Update optsRef after render (not during)
  useEffect(() => {
    optsRef.current = opts;
  });

  const createWebSocket = useCallback((conversationId: string): WebSocket => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/api/ws?conversationId=${conversationId}`;
    return new WebSocket(wsUrl);
  }, []);

  const updateState = useCallback((newState: WSState) => {
    setState(newState);
    optsRef.current.onStateChange?.(newState);
  }, []);

  const doConnect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      updateState("connecting");
      const ws = createWebSocket(opts.conversationId);
      wsRef.current = ws;

      ws.onopen = () => {
        updateState("connected");
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as WSMessage;
          optsRef.current.onMessage?.(msg);
        } catch {
          // Non-JSON message
        }
      };

      ws.onclose = (event) => {
        if (event.code !== 1000) {
          updateState("error");
        } else {
          updateState("disconnected");
        }
      };

      ws.onerror = () => {
        updateState("error");
        optsRef.current.onError?.(new Error("WebSocket error"));
      };
    } catch (err) {
      updateState("error");
      optsRef.current.onError?.(err instanceof Error ? err : new Error("Failed to connect"));
    }
  }, [opts.conversationId, updateState, createWebSocket]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    reconnectAttempts.current = 999; // Prevent reconnect
    wsRef.current?.close(1000, "User disconnected");
    wsRef.current = null;
    updateState("disconnected");
  }, [updateState]);

  const send = useCallback((message: WSMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    state,
    connect: doConnect,
    disconnect,
    send,
  };
}
