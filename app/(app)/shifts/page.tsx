"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getShifts, getGuards, getSites, getShiftsByGuard } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Shift, Guard, Site } from "@/lib/types";
import { SHIFT_STATUS_LABELS } from "@/lib/types";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today = todayStr();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const weekday = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  const label = `${d.getMonth() + 1}/${d.getDate()}(${weekday})`;

  if (dateStr === today) return `${label} - 今日`;
  if (dateStr === tomorrowStr) return `${label} - 明日`;
  return label;
}

const statusColors: Record<Shift["status"], string> = {
  scheduled: "bg-warning/10 text-warning",
  confirmed: "bg-accent/10 text-accent",
  completed: "bg-success/10 text-success",
  cancelled: "bg-sub-bg text-text-secondary line-through",
};

export default function ShiftsPage() {
  const { user } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setGuards(getGuards());
    setSites(getSites());
    if (user?.role === "admin") {
      setShifts(getShifts());
    } else if (user?.guardId) {
      setShifts(getShiftsByGuard(user.guardId));
    }
  }, [user]);

  if (!mounted) return null;

  const sortedShifts = [...shifts]
    .filter((s) => s.status !== "cancelled")
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  const groupedByDate = sortedShifts.reduce<Record<string, Shift[]>>((acc, shift) => {
    if (!acc[shift.date]) acc[shift.date] = [];
    acc[shift.date].push(shift);
    return acc;
  }, {});

  const dates = Object.keys(groupedByDate).sort();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">シフト管理</h1>
        {user?.role === "admin" && <Button href="/shifts/new" size="sm">シフト作成</Button>}
      </div>

      {dates.length === 0 ? (
        <Card><p className="text-text-secondary text-center py-8">シフトはありません</p></Card>
      ) : (
        <div className="space-y-5">
          {dates.map((date) => (
            <div key={date}>
              <h2 className="text-sm font-semibold text-text-secondary mb-2 sticky top-0 bg-primary py-1">
                {formatDateLabel(date)}
              </h2>
              <div className="space-y-2">
                {groupedByDate[date].map((shift) => {
                  const guard = guards.find((g) => g.id === shift.guardId);
                  const site = sites.find((s) => s.id === shift.siteId);
                  return (
                    <Card key={shift.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        {user?.role === "admin" && (
                          <p className="font-medium text-text-primary truncate">{guard?.name ?? "—"}</p>
                        )}
                        <p className="text-sm text-text-secondary truncate">{site?.name ?? "—"}</p>
                        {shift.notes && (
                          <p className="text-xs text-text-secondary mt-0.5">{shift.notes}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-mono">{shift.startTime}〜{shift.endTime}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[shift.status]}`}>
                          {SHIFT_STATUS_LABELS[shift.status]}
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
