"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/Card";
import { useRealtime } from "./RealtimeProvider";

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
}

// Dynamic import for Leaflet (SSR incompatible)
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("ja-JP");
}

export function EmployeeMap() {
  const [locations, setLocations] = useState<EmployeeLocation[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const { lastEvent } = useRealtime();

  const fetchLocations = useCallback(async () => {
    try {
      const res = await fetch("/api/gps/latest");
      if (res.ok) {
        const data = await res.json();
        setLocations(data.locations);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchLocations();
    const interval = setInterval(fetchLocations, 30000);
    return () => clearInterval(interval);
  }, [fetchLocations]);

  // Refresh on GPS events
  useEffect(() => {
    if (lastEvent?.type === "gps_update" || lastEvent?.type === "shift_start" || lastEvent?.type === "shift_end") {
      fetchLocations();
    }
  }, [lastEvent, fetchLocations]);

  // Load Leaflet CSS
  useEffect(() => {
    if (typeof window !== "undefined") {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      // Fix default marker icon
      import("leaflet").then((L) => {
        delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });
        setMapReady(true);
      });
    }
  }, []);

  const locationsWithGps = locations.filter((l) => l.gps);
  const center: [number, number] =
    locationsWithGps.length > 0
      ? [locationsWithGps[0].gps!.latitude, locationsWithGps[0].gps!.longitude]
      : [35.6812, 139.7671]; // Tokyo default

  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10">
        <h2 className="font-semibold">リアルタイム位置情報</h2>
        <p className="text-xs text-text-muted">
          稼働中: {locations.length}名 / GPS取得済: {locationsWithGps.length}名
        </p>
      </div>
      <div className="h-[400px] w-full">
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
            {locationsWithGps.map((loc) => (
              <Marker
                key={loc.userId}
                position={[loc.gps!.latitude, loc.gps!.longitude]}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{loc.userName}</strong>
                    <br />
                    最終更新: {formatTime(loc.gps!.recordedAt)}
                    {loc.gps!.accuracy && (
                      <>
                        <br />
                        精度: {Math.round(loc.gps!.accuracy)}m
                      </>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </Card>
  );
}
