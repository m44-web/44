"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { useRealtime } from "./RealtimeProvider";
import Link from "next/link";

interface Employee {
  id: string;
  name: string;
  email: string;
  isOnShift: boolean;
  currentShiftId: string | null;
}

interface Location {
  userId: string;
  startedAt: number;
  activity: {
    status: "active" | "idle" | "stale" | "no_gps";
    message: string;
    distanceLast10Min: number;
  };
  geofence: { violation: boolean; matches: Array<{ name: string; type: string }> } | null;
}

function elapsedLabel(startMs: number): string {
  const diff = Math.floor((Date.now() - startMs) / 60000);
  if (diff < 60) return `${diff}分`;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `${h}h${m.toString().padStart(2, "0")}m`;
}

const statusStyles: Record<
  Location["activity"]["status"],
  { bg: string; dot: string; label: string }
> = {
  active: {
    bg: "bg-success/10 border-success/20",
    dot: "bg-success",
    label: "text-success",
  },
  idle: {
    bg: "bg-warning/10 border-warning/30",
    dot: "bg-warning",
    label: "text-warning",
  },
  stale: {
    bg: "bg-danger/10 border-danger/30",
    dot: "bg-danger",
    label: "text-danger",
  },
  no_gps: {
    bg: "bg-text-muted/10 border-text-muted/20",
    dot: "bg-text-muted",
    label: "text-text-muted",
  },
};

type Filter = "all" | "active" | "alert";
type SortBy = "name" | "status";

const statusPriority: Record<string, number> = {
  stale: 0,
  idle: 1,
  no_gps: 2,
  active: 3,
};

export function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("status");
  const { lastEvent } = useRealtime();

  const fetchData = useCallback(async () => {
    try {
      const [empRes, locRes] = await Promise.all([
        fetch("/api/employees"),
        fetch("/api/gps/latest"),
      ]);
      if (empRes.ok) {
        const data = await empRes.json();
        setEmployees(data.employees);
      }
      if (locRes.ok) {
        const data = await locRes.json();
        setLocations(data.locations);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (
      lastEvent?.type === "shift_start" ||
      lastEvent?.type === "shift_end" ||
      lastEvent?.type === "gps_update"
    ) {
      fetchData();
    }
  }, [lastEvent, fetchData]);

  const locMap = new Map(locations.map((l) => [l.userId, l.activity]));
  const fenceMap = new Map(locations.map((l) => [l.userId, l.geofence]));
  const shiftStartMap = new Map(locations.map((l) => [l.userId, l.startedAt]));

  let onShift = employees.filter((e) => e.isOnShift);
  const offShift = employees.filter((e) => !e.isOnShift);

  if (filter === "alert") {
    onShift = onShift.filter((e) => {
      const a = locMap.get(e.id);
      return a?.status === "idle" || a?.status === "stale";
    });
  }

  onShift.sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name, "ja");
    const aStatus = locMap.get(a.id)?.status ?? "no_gps";
    const bStatus = locMap.get(b.id)?.status ?? "no_gps";
    return (statusPriority[aStatus] ?? 9) - (statusPriority[bStatus] ?? 9);
  });

  const alertCount = employees.filter((e) => {
    if (!e.isOnShift) return false;
    const a = locMap.get(e.id);
    return a?.status === "idle" || a?.status === "stale";
  }).length;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="font-semibold">従業員ステータス</h2>
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="text-xs bg-surface-light border border-white/10 rounded px-1.5 py-1 text-text-muted"
          >
            <option value="status">重要度順</option>
            <option value="name">名前順</option>
          </select>
          <div className="flex rounded-lg overflow-hidden border border-white/10 text-xs">
            <button
              onClick={() => setFilter("all")}
              className={`px-2 py-1 ${filter === "all" ? "bg-primary text-white" : "text-text-muted hover:bg-white/5"}`}
            >
              全て
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-2 py-1 ${filter === "active" ? "bg-primary text-white" : "text-text-muted hover:bg-white/5"}`}
            >
              稼働中
            </button>
            <button
              onClick={() => setFilter("alert")}
              className={`px-2 py-1 ${filter === "alert" ? "bg-warning text-white" : "text-text-muted hover:bg-white/5"}`}
            >
              ⚠ ({alertCount})
            </button>
          </div>
        </div>
      </div>

      {employees.length === 0 && (
        <p className="text-text-muted text-sm">
          従業員が登録されていません。「従業員管理」から登録してください。
        </p>
      )}

      {onShift.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-success mb-2">
            稼働中 ({onShift.length})
          </h3>
          <div className="space-y-2">
            {onShift.map((emp) => {
              const activity = locMap.get(emp.id);
              const fence = fenceMap.get(emp.id);
              const shiftStart = shiftStartMap.get(emp.id);
              const style = activity ? statusStyles[activity.status] : statusStyles.no_gps;
              const isWarning = activity?.status === "idle" || activity?.status === "stale";
              const isFenceViolation = fence?.violation === true;
              return (
                <Link
                  key={emp.id}
                  href={`/admin/employees/${emp.id}`}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${style.bg} hover:brightness-125 transition-all`}
                >
                  <span
                    className={`w-2.5 h-2.5 ${style.dot} rounded-full flex-shrink-0 ${
                      activity?.status === "active" ? "animate-pulse" : ""
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{emp.name}</p>
                      {shiftStart && (
                        <span className="text-[10px] text-text-muted font-mono">
                          {elapsedLabel(shiftStart)}
                        </span>
                      )}
                      {isWarning && <span className="text-xs">⚠️</span>}
                      {isFenceViolation && <span className="text-xs" title="エリア違反">🚫</span>}
                    </div>
                    <p className={`text-xs ${style.label}`}>
                      {activity?.message ?? "GPS待機中"}
                    </p>
                    {isFenceViolation && (
                      <p className="text-xs text-danger mt-0.5">
                        エリア違反
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {filter === "all" && offShift.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-text-muted mb-2">
            オフライン ({offShift.length})
          </h3>
          <div className="space-y-2">
            {offShift.map((emp) => (
              <Link
                key={emp.id}
                href={`/admin/employees/${emp.id}`}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="w-2.5 h-2.5 bg-text-muted rounded-full flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">{emp.name}</p>
                  <p className="text-xs text-text-muted">{emp.email}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
