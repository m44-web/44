"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from "react";
import { AppEvent } from "@/lib/event-bus";

interface RealtimeContextValue {
  events: AppEvent[];
  lastEvent: AppEvent | null;
  connected: boolean;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  events: [],
  lastEvent: null,
  connected: false,
});

export function useRealtime() {
  return useContext(RealtimeContext);
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [lastEvent, setLastEvent] = useState<AppEvent | null>(null);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    const es = new EventSource("/api/events");
    esRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (e) => {
      try {
        const event: AppEvent = JSON.parse(e.data);
        setLastEvent(event);
        setEvents((prev) => [...prev.slice(-99), event]);
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
      // Reconnect after 3s
      setTimeout(connect, 3000);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
    };
  }, [connect]);

  return (
    <RealtimeContext.Provider value={{ events, lastEvent, connected }}>
      {children}
    </RealtimeContext.Provider>
  );
}
