"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/Card";
import { useRealtime } from "./RealtimeProvider";

type ActivityStatus = "active" | "idle" | "stale" | "no_gps";

interface EmployeeLocation {
  userId: string;
  userName: string;
  shiftId: string;
  startedAt: number;
  gps: {
    latitude: number;
    longitude: number;
    accuracy: number | null;
    recordedAt: number;
  } | null;
  activity: {
    status: ActivityStatus;
    message: string;
  };
}

interface Trail {
  shiftId: string;
  userId: string;
  userName: string;
  points: Array<{ lat: number; lng: number; at: number }>;
}

const statusColors: Record<ActivityStatus, string> = {
  active: "#22c55e",
  idle: "#f59e0b",
  stale: "#ef4444",
  no_gps: "#94a3b8",
};

// Distinct colors for trails (hash userId into one of these)
const trailPalette = [
  "#3b82f6", // blue
  "#ec4899", // pink
  "#8b5cf6", // purple
  "#f97316", // orange
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#eab308", // yellow
  "#ef4444", // red
];

function colorForUser(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  return trailPalette[Math.abs(hash) % trailPalette.length];
}

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((m) => m.CircleMarker),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((m) => m.Polyline),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import("react-leaflet").then((m) => m.Tooltip),
  { ssr: false }
);
const Circle = dynamic(
  () => import("react-leaflet").then((m) => m.Circle),
  { ssr: false }
);
const MapFitBounds = dynamic(
  () => import("./MapFitBounds").then((m) => m.MapFitBounds),
  { ssr: false }
);

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("ja-JP");
}

function relativeTime(ts: number): string {
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 5) return "たった今";
  if (diffSec < 60) return `${diffSec}秒前`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}分前`;
  const diffHour = Math.floor(diffMin / 60);
  return `${diffHour}時間前`;
}

interface Geofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusM: number;
  type: "allowed" | "forbidden";
}

export function EmployeeMap() {
  const [locations, setLocations] = useState<EmployeeLocation[]>([]);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [showTrails, setShowTrails] = useState(true);
  const [showGeofences, setShowGeofences] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [fitTrigger, setFitTrigger] = useState(0);
  const [highlightUser, setHighlightUser] = useState("");
  const { lastEvent } = useRealtime();

  const fetchData = useCallback(async () => {
    try {
      const [locRes, trailRes, fenceRes] = await Promise.all([
        fetch("/api/gps/latest"),
        fetch("/api/gps/trail"),
        fetch("/api/geofences"),
      ]);
      if (locRes.ok) {
        const data = await locRes.json();
        setLocations(data.locations);
      }
      if (trailRes.ok) {
        const data = await trailRes.json();
        setTrails(data.trails);
      }
      if (fenceRes.ok) {
        const data = await fenceRes.json();
        setGeofences(data.geofences);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (
      lastEvent?.type === "gps_update" ||
      lastEvent?.type === "shift_start" ||
      lastEvent?.type === "shift_end"
    ) {
      fetchData();
    }
  }, [lastEvent, fetchData]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const existing = document.querySelector('link[href*="leaflet.css"]');
      if (!existing) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      setMapReady(true);
    }
  }, []);

  useEffect(() => {
    if (!fullscreen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [fullscreen]);

  const locationsWithGps = locations.filter((l) => l.gps);
  const center = useMemo<[number, number]>(
    () =>
      locationsWithGps.length > 0
        ? [locationsWithGps[0].gps!.latitude, locationsWithGps[0].gps!.longitude]
        : [35.6812, 139.7671],
    [locationsWithGps]
  );

  const fitBounds = useMemo<Array<[number, number]>>(
    () => locationsWithGps.map((l) => [l.gps!.latitude, l.gps!.longitude]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locationsWithGps, fitTrigger]
  );

  const alertCount = locations.filter(
    (l) => l.activity.status === "idle" || l.activity.status === "stale"
  ).length;

  return (
    <Card className={`p-0 overflow-hidden ${fullscreen ? "fixed inset-0 z-[9999] rounded-none" : ""}`}>
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-semibold">リアルタイム位置情報</h2>
          <p className="text-xs text-text-muted">
            稼働中: {locations.length}名 / GPS取得済: {locationsWithGps.length}名
          </p>
        </div>
        <div className="flex items-center gap-3">
          {alertCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-warning/20 text-warning rounded-full text-xs font-medium">
              ⚠️ アラート {alertCount}件
            </span>
          )}
          <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showTrails}
              onChange={(e) => setShowTrails(e.target.checked)}
              className="accent-primary"
            />
            移動軌跡
          </label>
          {geofences.length > 0 && (
            <label className="flex items-center gap-2 text-xs text-text-muted cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showGeofences}
                onChange={(e) => setShowGeofences(e.target.checked)}
                className="accent-primary"
              />
              エリア
            </label>
          )}
          {locationsWithGps.length > 1 && (
            <select
              value={highlightUser}
              onChange={(e) => setHighlightUser(e.target.value)}
              className="text-xs bg-surface-light border border-white/10 rounded px-1.5 py-1 text-text-muted"
            >
              <option value="">全員表示</option>
              {locationsWithGps.map((l) => (
                <option key={l.userId} value={l.userId}>{l.userName}</option>
              ))}
            </select>
          )}
          {locationsWithGps.length > 0 && (
            <button
              onClick={() => setFitTrigger((t) => t + 1)}
              className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-text-muted"
              title="全員を表示"
            >
              ◎ 全員
            </button>
          )}
          <button
            onClick={() => setFullscreen((f) => !f)}
            className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-text-muted"
            title={fullscreen ? "通常表示" : "全画面"}
          >
            {fullscreen ? "✕ 閉じる" : "⛶ 全画面"}
          </button>
        </div>
      </div>
      <div className={fullscreen ? "h-[calc(100vh-52px)] w-full" : "h-[400px] sm:h-[450px] lg:h-[500px] w-full"}>
        {mapReady && (
          <MapContainer
            center={center}
            zoom={12}
            className="h-full w-full"
            key={center.join(",")}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {fitTrigger > 0 && fitBounds.length > 0 && (
              <MapFitBounds bounds={fitBounds} key={fitTrigger} />
            )}

            {showGeofences &&
              geofences.map((fence) => (
                <Circle
                  key={fence.id}
                  center={[fence.latitude, fence.longitude]}
                  radius={fence.radiusM}
                  pathOptions={{
                    color: fence.type === "allowed" ? "#22c55e" : "#ef4444",
                    fillColor: fence.type === "allowed" ? "#22c55e" : "#ef4444",
                    fillOpacity: 0.08,
                    weight: 2,
                    dashArray: fence.type === "forbidden" ? "8 4" : undefined,
                  }}
                >
                  <Tooltip direction="center" className="employee-map-label">
                    {fence.name} ({fence.type === "allowed" ? "許可" : "禁止"})
                  </Tooltip>
                </Circle>
              ))}

            {showTrails &&
              trails.map((trail) =>
                trail.points.length > 1 ? (
                  <Polyline
                    key={trail.shiftId}
                    positions={trail.points.map((p) => [p.lat, p.lng])}
                    pathOptions={{
                      color: colorForUser(trail.userId),
                      weight: highlightUser && highlightUser !== trail.userId ? 1 : 3,
                      opacity: highlightUser && highlightUser !== trail.userId ? 0.2 : 0.7,
                    }}
                  />
                ) : null
              )}

            {locationsWithGps.map((loc) => {
              const color = statusColors[loc.activity.status];
              const dimmed = highlightUser && highlightUser !== loc.userId;
              return (
                <CircleMarker
                  key={loc.userId}
                  center={[loc.gps!.latitude, loc.gps!.longitude]}
                  radius={dimmed ? 6 : 10}
                  pathOptions={{
                    color: "#ffffff",
                    weight: dimmed ? 1 : 2,
                    fillColor: color,
                    fillOpacity: dimmed ? 0.3 : 0.9,
                  }}
                >
                  <Tooltip
                    permanent
                    direction="top"
                    offset={[0, -8]}
                    className="employee-map-label"
                  >
                    {loc.userName}
                  </Tooltip>
                  <Popup>
                    <div className="text-sm">
                      <strong>{loc.userName}</strong>
                      <br />
                      <span style={{ color }}>● {loc.activity.message}</span>
                      <br />
                      最終更新: {relativeTime(loc.gps!.recordedAt)} ({formatTime(loc.gps!.recordedAt)})
                      {loc.gps!.accuracy && (
                        <>
                          <br />
                          精度: {Math.round(loc.gps!.accuracy)}m
                        </>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        )}
      </div>
    </Card>
  );
}
