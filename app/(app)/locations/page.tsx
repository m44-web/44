"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { getLatestLocations, addLocation, getGuards, getSites, getShifts } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import type { LocationLog, Guard, Shift, Site } from "@/lib/types";

export default function LocationsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  if (isAdmin) return <AdminLocationView />;
  return <GuardLocationView guardId={user?.guardId ?? ""} />;
}

function GuardLocationView({ guardId }: { guardId: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [lastSent, setLastSent] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for existing location
    const locations = getLatestLocations();
    const mine = locations.find((l) => l.guardId === guardId);
    if (mine) setLastSent(mine.timestamp);
  }, [guardId]);

  const sendLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const now = new Date().toISOString();
        addLocation({
          guardId,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: now,
          type: "manual",
        });
        setLastSent(now);
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
      },
      () => {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [guardId]);

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">位置情報送信</h1>

      <Card className="text-center space-y-4 !py-8">
        <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>

        <div>
          <p className="text-sm text-text-secondary mb-1">現在地を管理者に送信します</p>
          <p className="text-xs text-text-secondary">現場への到着確認に使用されます</p>
        </div>

        <button
          onClick={sendLocation}
          disabled={status === "sending"}
          className={`w-full max-w-xs mx-auto py-4 rounded-xl font-semibold text-white cursor-pointer transition-all ${
            status === "sending" ? "bg-accent/50" :
            status === "success" ? "bg-success" :
            status === "error" ? "bg-danger" :
            "bg-accent hover:bg-accent-dark active:scale-95"
          }`}
        >
          {status === "sending" ? "送信中..." :
           status === "success" ? "送信完了!" :
           status === "error" ? "位置情報を取得できません" :
           "現在地を送信"}
        </button>

        {lastSent && (
          <p className="text-xs text-text-secondary">
            最終送信: {new Date(lastSent).toLocaleString("ja-JP")}
          </p>
        )}
      </Card>

      <Card>
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-text-primary">GPS送信について</h2>
          <ul className="text-xs text-text-secondary space-y-1">
            <li>・出勤時に現在地を送信してください</li>
            <li>・現場到着の確認に使用されます</li>
            <li>・位置情報は管理者のみ閲覧できます</li>
            <li>・ブラウザの位置情報許可が必要です</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

function AdminLocationView() {
  const [locations, setLocations] = useState<LocationLog[]>([]);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [mounted, setMounted] = useState(false);

  function refresh() {
    setLocations(getLatestLocations());
    setGuards(getGuards());
    setShifts(getShifts());
    setSites(getSites());
  }

  useEffect(() => {
    setMounted(true);
    refresh();
    // Auto-refresh every 30 seconds
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const today = new Date().toISOString().split("T")[0];
  const todayShifts = shifts.filter((s) => s.date === today && s.status !== "cancelled");
  const activeGuards = guards.filter((g) => g.status === "active");

  // Build a status view per active guard
  const guardStatuses = activeGuards.map((guard) => {
    const todayShift = todayShifts.find((s) => s.guardId === guard.id);
    const loc = locations.find((l) => l.guardId === guard.id);
    const site = todayShift ? sites.find((s) => s.id === todayShift.siteId) : undefined;

    let locationStatus: "sent" | "old" | "none" = "none";
    if (loc) {
      const locTime = new Date(loc.timestamp).getTime();
      const hoursAgo = (Date.now() - locTime) / (1000 * 60 * 60);
      locationStatus = hoursAgo < 12 ? "sent" : "old";
    }

    return { guard, todayShift, site, loc, locationStatus };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">位置確認</h1>
        <button onClick={refresh} className="text-sm px-3 py-1.5 rounded-lg border border-border text-text-secondary hover:text-accent hover:border-accent/30 cursor-pointer transition-colors">
          更新
        </button>
      </div>

      <p className="text-sm text-text-secondary">本日 {today} のシフト: {todayShifts.length}件</p>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-success" /> 位置送信済</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-warning" /> 古い位置情報</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sub-bg border border-border" /> 未送信</span>
      </div>

      <div className="space-y-2">
        {guardStatuses.map(({ guard, todayShift, site, loc, locationStatus }) => (
          <Card key={guard.id} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-3 h-3 rounded-full shrink-0 ${
                  locationStatus === "sent" ? "bg-success" :
                  locationStatus === "old" ? "bg-warning" :
                  "bg-sub-bg border border-border"
                }`} />
                <p className="font-medium text-text-primary truncate">{guard.name}</p>
              </div>
              {todayShift && (
                <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent shrink-0">
                  {todayShift.startTime}〜{todayShift.endTime}
                </span>
              )}
            </div>

            <div className="text-xs text-text-secondary space-y-0.5">
              {todayShift ? (
                <p>現場: {site?.name ?? "—"}</p>
              ) : (
                <p>本日シフトなし</p>
              )}
              {loc ? (
                <>
                  <p>
                    位置: {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                    <span className="ml-1 text-text-secondary/60">(精度 {Math.round(loc.accuracy)}m)</span>
                  </p>
                  <p>送信時刻: {new Date(loc.timestamp).toLocaleString("ja-JP")}</p>
                </>
              ) : (
                <p className="text-warning">位置情報未送信</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {guardStatuses.length === 0 && (
        <Card><p className="text-text-secondary text-center py-6 text-sm">稼働中の警備員がいません</p></Card>
      )}
    </div>
  );
}
