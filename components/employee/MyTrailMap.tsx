"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/Card";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((m) => m.Polyline),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((m) => m.CircleMarker),
  { ssr: false }
);

interface Point {
  lat: number;
  lng: number;
  at: number;
}

export function MyTrailMap() {
  const [points, setPoints] = useState<Point[]>([]);
  const [mapReady, setMapReady] = useState(false);

  const fetchTrail = useCallback(async () => {
    try {
      const res = await fetch("/api/my/trail");
      if (res.ok) {
        const data = await res.json();
        setPoints(data.points);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchTrail();
    const interval = setInterval(fetchTrail, 30000);
    return () => clearInterval(interval);
  }, [fetchTrail]);

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

  if (!mapReady || points.length === 0) return null;

  const center: [number, number] = [
    points[points.length - 1].lat,
    points[points.length - 1].lng,
  ];

  return (
    <Card className="w-full max-w-sm p-0 overflow-hidden">
      <div className="px-3 py-2 border-b border-white/10">
        <p className="text-xs text-text-muted">
          本日の移動軌跡（{points.length}ポイント）
        </p>
      </div>
      <div className="h-[200px] w-full">
        <MapContainer
          center={center}
          zoom={14}
          className="h-full w-full"
          key={center.join(",")}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.length > 1 && (
            <Polyline
              positions={points.map((p) => [p.lat, p.lng])}
              pathOptions={{ color: "#3b82f6", weight: 3, opacity: 0.8 }}
            />
          )}
          <CircleMarker
            center={center}
            radius={8}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: "#22c55e",
              fillOpacity: 1,
            }}
          />
        </MapContainer>
      </div>
    </Card>
  );
}
