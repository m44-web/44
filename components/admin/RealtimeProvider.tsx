"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from "react";
import { AppEvent } from "@/lib/event-bus";

interface RealtimeContextValue {
  events: AppEvent[];
  lastEvent: AppEvent | null;
  connected: boolean;
  reconnectCount: number;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  events: [],
  lastEvent: null,
  connected: false,
  reconnectCount: 0,
});

export function useRealtime() {
  return useContext(RealtimeContext);
}

const MAX_BACKOFF_MS = 30000;
const HEARTBEAT_TIMEOUT_MS = 45000;

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [lastEvent, setLastEvent] = useState<AppEvent | null>(null);
  const [connected, setConnected] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  const esRef = useRef<EventSource | null>(null);
  const retryRef = useRef(0);
  const heartbeatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
    heartbeatTimerRef.current = setTimeout(() => {
      esRef.current?.close();
      setConnected(false);
      scheduleReconnect();
    }, HEARTBEAT_TIMEOUT_MS);
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    const delay = Math.min(1000 * Math.pow(2, retryRef.current), MAX_BACKOFF_MS);
    retryRef.current++;
    setReconnectCount((c) => c + 1);
    reconnectTimerRef.current = setTimeout(() => connect(), delay);
  }, []);

  const connect = useCallback(() => {
    esRef.current?.close();
    if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);

    const es = new EventSource("/api/events");
    esRef.current = es;

    es.onopen = () => {
      setConnected(true);
      retryRef.current = 0;
      resetHeartbeat();
    };

    es.onmessage = (e) => {
      resetHeartbeat();
      try {
        const event: AppEvent = JSON.parse(e.data);
        setLastEvent(event);
        setEvents((prev) => [...prev.slice(-99), event]);
      } catch {
        // keepalive comments won't parse — that's expected
      }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
      scheduleReconnect();
    };
  }, [resetHeartbeat, scheduleReconnect]);

  useEffect(() => {
    connect();

    const handleOnline = () => {
      retryRef.current = 0;
      connect();
    };
    window.addEventListener("online", handleOnline);

    return () => {
      esRef.current?.close();
      window.removeEventListener("online", handleOnline);
      if (heartbeatTimerRef.current) clearTimeout(heartbeatTimerRef.current);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, [connect]);

  return (
    <RealtimeContext.Provider value={{ events, lastEvent, connected, reconnectCount }}>
      {children}
    </RealtimeContext.Provider>
  );
}
