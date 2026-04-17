"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { AdminNav } from "./AdminNav";

interface Geofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusM: number;
  type: "allowed" | "forbidden";
  createdAt: number;
}

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Circle = dynamic(() => import("react-leaflet").then((m) => m.Circle), {
  ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
  ssr: false,
});

export function GeofenceManagement() {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [form, setForm] = useState({
    name: "",
    latitude: "",
    longitude: "",
    radiusM: "500",
    type: "allowed" as "allowed" | "forbidden",
  });
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/geofences");
    if (res.ok) {
      const json = await res.json();
      setGeofences(json.geofences);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      const res = await fetch("/api/geofences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
          radiusM: parseFloat(form.radiusM),
          type: form.type,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErr(json.error || "登録に失敗しました");
        return;
      }
      setForm({ name: "", latitude: "", longitude: "", radiusM: "500", type: "allowed" });
      fetchData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("このエリアを削除しますか？")) return;
    await fetch(`/api/geofences/${id}`, { method: "DELETE" });
    fetchData();
  };

  const center: [number, number] =
    geofences.length > 0
      ? [geofences[0].latitude, geofences[0].longitude]
      : [35.6812, 139.7671];

  return (
    <div className="min-h-screen">
      <AdminNav />

      <Container className="py-6 space-y-6">
        <h1 className="font-semibold text-lg">エリア管理（ジオフェンス）</h1>
        <Card>
          <p className="text-sm text-text-muted mb-3">
            営業区域を登録すると、従業員が指定エリアの外に出たり、禁止エリアに入った場合にアラートを発します。
            <br />
            <strong>許可エリア:</strong> 1つ以上登録すると、そのどれにも含まれない場所は違反扱い。
            <br />
            <strong>禁止エリア:</strong> 入ると違反。
          </p>
          <form onSubmit={add} className="grid grid-cols-1 sm:grid-cols-6 gap-3">
            <div className="sm:col-span-2">
              <label htmlFor="geo-name" className="sr-only">エリア名</label>
              <input
                id="geo-name"
                type="text"
                placeholder="エリア名"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="geo-lat" className="sr-only">緯度</label>
              <input
                id="geo-lat"
                type="number"
                step="any"
                placeholder="緯度"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                className="w-full px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="geo-lng" className="sr-only">経度</label>
              <input
                id="geo-lng"
                type="number"
                step="any"
                placeholder="経度"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                className="w-full px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="geo-radius" className="sr-only">半径(m)</label>
              <input
                id="geo-radius"
                type="number"
                placeholder="半径(m)"
                value={form.radiusM}
                onChange={(e) => setForm({ ...form, radiusM: e.target.value })}
                className="w-full px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="geo-type" className="sr-only">エリア種別</label>
              <select
                id="geo-type"
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as "allowed" | "forbidden" })
                }
                className="w-full px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-sm"
              >
                <option value="allowed">許可エリア</option>
                <option value="forbidden">禁止エリア</option>
              </select>
            </div>
            {err && (
              <div role="alert" className="sm:col-span-6 p-2 bg-danger/10 border border-danger/30 rounded text-danger text-sm">
                {err}
              </div>
            )}
            <div className="sm:col-span-6 flex items-center gap-3">
              <Button type="submit" loading={saving}>
                エリアを追加
              </Button>
              <button
                type="button"
                onClick={() => {
                  if (!navigator.geolocation) return;
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      setForm((f) => ({
                        ...f,
                        latitude: pos.coords.latitude.toFixed(6),
                        longitude: pos.coords.longitude.toFixed(6),
                      }));
                    },
                    () => setErr("位置情報を取得できませんでした"),
                    { enableHighAccuracy: true }
                  );
                }}
                className="text-xs px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted"
              >
                📍 現在地を使用
              </button>
            </div>
          </form>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="h-[400px] w-full">
            {mapReady && (
              <MapContainer
                center={center}
                zoom={12}
                className="h-full w-full"
                key={`${center[0]},${center[1]}`}
              >
                <TileLayer
                  attribution='&copy; OSM'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {geofences.map((g) => (
                  <Circle
                    key={g.id}
                    center={[g.latitude, g.longitude]}
                    radius={g.radiusM}
                    pathOptions={{
                      color: g.type === "allowed" ? "#22c55e" : "#ef4444",
                      fillColor: g.type === "allowed" ? "#22c55e" : "#ef4444",
                      fillOpacity: 0.15,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <strong>{g.name}</strong>
                      <br />
                      {g.type === "allowed" ? "許可エリア" : "禁止エリア"}
                      <br />
                      半径 {g.radiusM}m
                    </Popup>
                  </Circle>
                ))}
              </MapContainer>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-3">登録済みエリア ({geofences.length}件)</h3>
          {geofences.length === 0 ? (
            <p className="text-text-muted text-sm">まだ登録されていません</p>
          ) : (
            <div className="divide-y divide-white/5">
              {geofences.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          g.type === "allowed"
                            ? "bg-success/20 text-success"
                            : "bg-danger/20 text-danger"
                        }`}
                      >
                        {g.type === "allowed" ? "許可" : "禁止"}
                      </span>
                      <span className="font-medium text-sm">{g.name}</span>
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      {g.latitude.toFixed(5)}, {g.longitude.toFixed(5)} / 半径 {g.radiusM}m
                    </p>
                  </div>
                  <button
                    onClick={() => remove(g.id)}
                    className="text-xs px-2 py-1 rounded bg-danger/20 hover:bg-danger/30 text-danger"
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </Container>
    </div>
  );
}
