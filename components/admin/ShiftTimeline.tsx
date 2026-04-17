"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { useRealtime } from "./RealtimeProvider";

interface Shift {
  id: string;
  userId: string;
  userName: string;
  startedAt: number;
  endedAt: number | null;
}

const HOUR_LABELS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0")
);

export function ShiftTimeline() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const { lastEvent } = useRealtime();

  const fetchShifts = useCallback(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const res = await fetch(`/api/shifts?limit=100`);
      if (res.ok) {
        const data = await res.json();
        setShifts(
          data.shifts.filter(
            (s: Shift) => s.startedAt >= today.getTime()
          )
        );
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  useEffect(() => {
    if (lastEvent?.type === "shift_start" || lastEvent?.type === "shift_end") {
      fetchShifts();
    }
  }, [lastEvent, fetchShifts]);

  const dayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const dayMs = 24 * 3600 * 1000;
  const now = Date.now();

  const userShifts = useMemo(() => {
    const map = new Map<string, { name: string; shifts: Shift[] }>();
    for (const s of shifts) {
      if (!map.has(s.userId)) {
        map.set(s.userId, { name: s.userName, shifts: [] });
      }
      map.get(s.userId)!.shifts.push(s);
    }
    return Array.from(map.entries()).map(([userId, data]) => ({
      userId,
      ...data,
    }));
  }, [shifts]);

  if (userShifts.length === 0) return null;

  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10">
        <h2 className="font-semibold text-sm">本日のシフトタイムライン</h2>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="flex border-b border-white/5 text-[10px] text-text-muted">
            <div className="w-24 flex-shrink-0" />
            <div className="flex-1 flex">
              {HOUR_LABELS.map((h) => (
                <div key={h} className="flex-1 text-center py-1 border-l border-white/5">
                  {h}
                </div>
              ))}
            </div>
          </div>
          {userShifts.map((user) => (
            <div key={user.userId} className="flex items-center border-b border-white/5 h-8">
              <div className="w-24 flex-shrink-0 px-3 text-xs truncate text-text-muted">
                {user.name}
              </div>
              <div className="flex-1 relative h-full">
                {/* Current time marker */}
                <div
                  className="absolute top-0 bottom-0 w-px bg-danger/50 z-10"
                  style={{ left: `${((now - dayStart) / dayMs) * 100}%` }}
                />
                {user.shifts.map((s) => {
                  const start = Math.max(0, ((s.startedAt - dayStart) / dayMs) * 100);
                  const end = Math.min(100, (((s.endedAt ?? now) - dayStart) / dayMs) * 100);
                  const width = end - start;
                  return (
                    <div
                      key={s.id}
                      className={`absolute top-1 bottom-1 rounded-sm ${
                        s.endedAt ? "bg-primary/40" : "bg-success/50"
                      }`}
                      style={{ left: `${start}%`, width: `${width}%`, minWidth: "2px" }}
                      title={`${new Date(s.startedAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })} - ${
                        s.endedAt
                          ? new Date(s.endedAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })
                          : "勤務中"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
