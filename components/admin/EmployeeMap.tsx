"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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

export function EmployeeMap() {
  const [locations, setLocations] = useState<EmployeeLocation[]>([]);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [showTrails, setShowTrails] = useState(true);
  const { lastEvent } = useRealtime();

  const fetchData = useCallback(async () => {
    try {
      const [locRes, trailRes] = await Promise.all([
        fetch("/api/gps/latest"),
        fetch("/api/gps/trail"),
      ]);
      if (locRes.ok) {
        const data = await locRes.json();
        setLocations(data.locations);
      }
      if (trailRes.ok) {
        const data = await trailRes.json();
        setTrails(data.trails);
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

  const locationsWithGps = locations.filter((l) => l.gps);
  const center = useMemo<[number, number]>(
    () =>
      locationsWithGps.length > 0
        ? [locationsWithGps[0].gps!.latitude, locationsWithGps[0].gps!.longitude]
        : [35.6812, 139.7671],
    [locationsWithGps]
  );

  const alertCount = locations.filter(
    (l) => l.activity.status === "idle" || l.activity.status === "stale"
  ).length;

  return (
    <Card className="p-0 overflow-hidden">
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
        </div>
      </div>
      <div className="h-[400px] sm:h-[450px] lg:h-[500px] w-full">
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

            {showTrails &&
              trails.map((trail) =>
                trail.points.length > 1 ? (
                  <Polyline
                    key={trail.shiftId}
                    positions={trail.points.map((p) => [p.lat, p.lng])}
                    pathOptions={{
                      color: colorForUser(trail.userId),
                      weight: 3,
                      opacity: 0.7,
                    }}
                  />
                ) : null
              )}

            {locationsWithGps.map((loc) => {
              const color = statusColors[loc.activity.status];
              return (
                <CircleMarker
                  key={loc.userId}
                  center={[loc.gps!.latitude, loc.gps!.longitude]}
                  radius={10}
                  pathOptions={{
                    color: "#ffffff",
                    weight: 2,
                    fillColor: color,
                    fillOpacity: 0.9,
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
