"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
          speed: pos.coords.speed,
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">位置情報送信</h1>

      <Card className="text-center space-y-5 !py-8">
        {/* Big icon */}
        <div className="w-24 h-24 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>

        <div>
          <p className="text-lg text-text-primary font-medium">現在地を管制に送信します</p>
          <p className="text-sm text-text-secondary mt-1">現場に到着したらボタンを押してください</p>
        </div>

        {/* Huge send button */}
        <button
          onClick={sendLocation}
          disabled={status === "sending"}
          className={`w-full py-6 rounded-2xl font-bold text-xl text-white cursor-pointer transition-all active:scale-[0.97] ${
            status === "sending" ? "bg-accent/50" :
            status === "success" ? "bg-success" :
            status === "error" ? "bg-danger" :
            "bg-accent hover:bg-accent-dark"
          }`}
        >
          {status === "sending" ? "送信中..." :
           status === "success" ? "送信完了！" :
           status === "error" ? "位置情報を取得できません" :
           "現在地を送信する"}
        </button>

        {lastSent && (
          <p className="text-sm text-text-secondary">
            最終送信：{new Date(lastSent).toLocaleString("ja-JP")}
          </p>
        )}
      </Card>

      <Card>
        <div className="space-y-3">
          <h2 className="text-base font-bold text-text-primary">GPS送信について</h2>
          <ul className="text-sm text-text-secondary space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">●</span>
              <span>出勤時・現場到着時に位置情報を送信してください</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">●</span>
              <span>現場への到着確認に使用されます</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-0.5">●</span>
              <span>位置情報は管理者のみ閲覧可能です</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-warning mt-0.5">●</span>
              <span>ブラウザの「位置情報の許可」が必要です</span>
            </li>
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
    let interval: ReturnType<typeof setInterval> | null = null;
    const start = () => { if (interval == null) interval = setInterval(refresh, 30000); };
    const stop = () => { if (interval != null) { clearInterval(interval); interval = null; } };
    const onVis = () => { if (document.hidden) stop(); else { refresh(); start(); } };
    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const guardStatuses = useMemo(() => {
    const todayShifts = shifts.filter((s) => s.date === today && s.status !== "cancelled");
    const shiftByGuard = new Map(todayShifts.map((s) => [s.guardId, s]));
    const locByGuard = new Map(locations.map((l) => [l.guardId, l]));
    const siteById = new Map(sites.map((s) => [s.id, s]));
    const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000;
    return guards.filter((g) => g.status === "active").map((guard) => {
      const todayShift = shiftByGuard.get(guard.id);
      const loc = locByGuard.get(guard.id);
      const site = todayShift ? siteById.get(todayShift.siteId) : undefined;
      let locationStatus: "sent" | "old" | "none" = "none";
      if (loc) locationStatus = new Date(loc.timestamp).getTime() > twelveHoursAgo ? "sent" : "old";
      return { guard, todayShift, site, loc, locationStatus };
    });
  }, [guards, shifts, locations, sites, today]);

  const todayShiftsCount = useMemo(() => shifts.filter((s) => s.date === today && s.status !== "cancelled").length, [shifts, today]);

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">位置確認</h1>
        <button onClick={refresh} className="text-sm px-3 py-1.5 rounded-lg border border-border text-text-secondary hover:text-accent hover:border-accent/30 cursor-pointer transition-colors">
          更新
        </button>
      </div>

      <p className="text-sm text-text-secondary">本日 {today} のシフト: {todayShiftsCount}件</p>

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
                  <div className="flex items-center gap-3">
                    <span>送信: {new Date(loc.timestamp).toLocaleString("ja-JP")}</span>
                    {loc.speed != null && loc.speed >= 0 && (
                      <span className={`font-medium ${loc.speed * 3.6 > 60 ? "text-danger" : loc.speed * 3.6 > 5 ? "text-warning" : "text-success"}`}>
                        速度: {(loc.speed * 3.6).toFixed(0)}km/h
                        {loc.speed * 3.6 > 5 ? " (移動中)" : " (停止)"}
                      </span>
                    )}
                    <span>{loc.type === "clock_in" ? "上番時" : loc.type === "clock_out" ? "下番時" : loc.type === "manual" ? "手動" : ""}</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline inline-flex items-center gap-1 mt-0.5"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    Google Mapで見る
                  </a>
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
