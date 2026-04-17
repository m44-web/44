"use client";

import { useEffect, useState, useCallback } from "react";
import { useRealtime } from "./RealtimeProvider";
import { TrendChart } from "./TrendChart";

interface Stats {
  totalEmployees: number;
  activeNow: number;
  todayShifts: number;
  todayWorkedMs: number;
  todayRecordings: number;
  weekShifts: number;
  weekWorkedMs: number;
  weekUniqueUsers: number;
  trend: Array<{ date: string; workedMs: number; shifts: number }>;
}

function formatHours(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h === 0) return `${m}分`;
  return `${h}時間${m}分`;
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="bg-surface rounded-xl border border-white/10 p-4 min-w-0">
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className={`text-xl font-bold ${accent ?? ""}`}>{value}</p>
    </div>
  );
}

export function StatsBar() {
  const [stats, setStats] = useState<Stats | null>(null);
  const { lastEvent } = useRealtime();

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) setStats(await res.json());
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  useEffect(() => {
    if (
      lastEvent?.type === "shift_start" ||
      lastEvent?.type === "shift_end" ||
      lastEvent?.type === "audio_upload"
    ) {
      fetchStats();
    }
  }, [lastEvent, fetchStats]);

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="稼働中"
          value={`${stats.activeNow} / ${stats.totalEmployees}`}
          accent="text-success"
        />
        <StatCard label="本日のシフト" value={stats.todayShifts} />
        <StatCard label="本日の勤務時間" value={formatHours(stats.todayWorkedMs)} />
        <StatCard label="本日の録音数" value={stats.todayRecordings} />
        <StatCard label="今週の稼働人数" value={stats.weekUniqueUsers} />
        <StatCard label="今週の勤務時間" value={formatHours(stats.weekWorkedMs)} />
      </div>
      <TrendChart trend={stats.trend} />
    </div>
  );
}
