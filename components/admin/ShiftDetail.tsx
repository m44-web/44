"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { AdminNav } from "./AdminNav";

interface ShiftData {
  shift: {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    startedAt: number;
    endedAt: number | null;
    adminNote: string | null;
  };
  gps: Array<{ lat: number; lng: number; accuracy: number | null; at: number }>;
  recordings: Array<{ id: string; durationSec: number | null; recordedAt: number }>;
  activities: Array<{ id: number; activity: string; note: string | null; createdAt: number }>;
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

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString("ja-JP");
}

function formatDuration(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}時間${m}分`;
}

function haversineM(a: [number, number], b: [number, number]): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function ShiftDetail({ shiftId }: { shiftId: string }) {
  const [data, setData] = useState<ShiftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [ending, setEnding] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/shifts/${shiftId}`);
      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "取得に失敗しました");
        return;
      }
      const json: ShiftData = await res.json();
      setData(json);
      setNoteDraft(json.shift.adminNote ?? "");
    } catch {
      setError("通信エラー");
    } finally {
      setLoading(false);
    }
  }, [shiftId]);

  const saveNote = async () => {
    setNoteSaving(true);
    setNoteSaved(false);
    try {
      const res = await fetch(`/api/shifts/${shiftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNote: noteDraft }),
      });
      if (res.ok) {
        setNoteSaved(true);
        setTimeout(() => setNoteSaved(false), 2000);
      }
    } finally {
      setNoteSaving(false);
    }
  };

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

  const totalDistanceM = useMemo(() => {
    if (!data || data.gps.length < 2) return 0;
    let total = 0;
    for (let i = 0; i < data.gps.length - 1; i++) {
      total += haversineM(
        [data.gps[i].lat, data.gps[i].lng],
        [data.gps[i + 1].lat, data.gps[i + 1].lng]
      );
    }
    return total;
  }, [data]);

  const handleForceEnd = async () => {
    if (!confirm("このシフトを強制終了しますか？")) return;
    setEnding(true);
    try {
      const res = await fetch(`/api/shifts/${shiftId}`, { method: "DELETE" });
      if (res.ok) {
        await fetchData();
      }
    } finally {
      setEnding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-muted">読み込み中...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <p className="text-danger">{error || "データがありません"}</p>
          <Link href="/admin" className="text-primary text-sm mt-2 inline-block">
            ← ダッシュボードに戻る
          </Link>
        </Card>
      </div>
    );
  }

  const { shift, gps, recordings, activities } = data;
  const durationMs = (shift.endedAt ?? Date.now()) - shift.startedAt;
  const center: [number, number] =
    gps.length > 0 ? [gps[0].lat, gps[0].lng] : [35.6812, 139.7671];

  return (
    <div className="min-h-screen">
      <AdminNav />

      <Container className="py-6 space-y-6">
        <Breadcrumb items={[
          { label: "ダッシュボード", href: "/admin" },
          { label: "シフト履歴", href: "/admin/shifts" },
          { label: `${shift.userName} - ${new Date(shift.startedAt).toLocaleDateString("ja-JP")}` },
        ]} />
        {/* Overview */}
        <Card>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold">{shift.userName}</h2>
                <Link
                  href={`/admin/employees/${shift.userId}`}
                  className="text-xs text-primary hover:underline"
                >
                  従業員詳細 →
                </Link>
              </div>
              <p className="text-sm text-text-muted">{shift.userEmail}</p>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-text-muted text-xs">開始</p>
                  <p>{formatDateTime(shift.startedAt)}</p>
                </div>
                <div>
                  <p className="text-text-muted text-xs">終了</p>
                  <p>
                    {shift.endedAt ? (
                      formatDateTime(shift.endedAt)
                    ) : (
                      <span className="text-success animate-pulse">勤務中</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-text-muted text-xs">勤務時間</p>
                  <p className="font-mono">{formatDuration(durationMs)}</p>
                </div>
                <div>
                  <p className="text-text-muted text-xs">移動距離</p>
                  <p className="font-mono">
                    {totalDistanceM >= 1000
                      ? `${(totalDistanceM / 1000).toFixed(2)} km`
                      : `${Math.round(totalDistanceM)} m`}
                  </p>
                </div>
              </div>
            </div>
            {!shift.endedAt && (
              <Button
                variant="danger"
                onClick={handleForceEnd}
                loading={ending}
                className="text-sm"
              >
                強制終了
              </Button>
            )}
          </div>
        </Card>

        {/* Map */}
        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <h3 className="font-semibold">移動軌跡</h3>
            <p className="text-xs text-text-muted">
              GPS記録: {gps.length}点
            </p>
          </div>
          <div className="h-[400px] w-full">
            {mapReady && gps.length > 0 && (
              <MapContainer
                center={center}
                zoom={14}
                className="h-full w-full"
                key={`${center[0]},${center[1]}`}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {gps.length > 1 && (
                  <Polyline
                    positions={gps.map((p) => [p.lat, p.lng])}
                    pathOptions={{ color: "#3b82f6", weight: 4, opacity: 0.7 }}
                  />
                )}
                {gps.length > 0 && (
                  <CircleMarker
                    center={[gps[0].lat, gps[0].lng]}
                    radius={8}
                    pathOptions={{
                      color: "#ffffff",
                      weight: 2,
                      fillColor: "#22c55e",
                      fillOpacity: 0.9,
                    }}
                  />
                )}
                {gps.length > 1 && (
                  <CircleMarker
                    center={[gps[gps.length - 1].lat, gps[gps.length - 1].lng]}
                    radius={8}
                    pathOptions={{
                      color: "#ffffff",
                      weight: 2,
                      fillColor: "#ef4444",
                      fillOpacity: 0.9,
                    }}
                  />
                )}
              </MapContainer>
            )}
            {gps.length === 0 && (
              <div className="h-full flex items-center justify-center text-text-muted">
                GPS記録がありません
              </div>
            )}
          </div>
        </Card>

        {/* Admin Note */}
        <Card>
          <h3 className="font-semibold mb-3">管理者メモ</h3>
          <textarea
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="このシフトに関するメモを記入..."
            className="w-full px-3 py-2 bg-surface-light border border-white/10 rounded-lg text-text placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-text-muted">
              {noteDraft.length}/2000
            </span>
            <div className="flex items-center gap-3">
              {noteSaved && (
                <span className="text-xs text-success">保存しました</span>
              )}
              <Button
                onClick={saveNote}
                loading={noteSaving}
                variant="primary"
                className="text-sm"
              >
                保存
              </Button>
            </div>
          </div>
        </Card>

        {/* Recordings */}
        <Card>
          <h3 className="font-semibold mb-4">録音 ({recordings.length}件)</h3>
          {recordings.length === 0 ? (
            <p className="text-text-muted text-sm">このシフトの録音はありません</p>
          ) : (
            <div className="space-y-3">
              {recordings.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 bg-white/5 rounded-lg border border-white/5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm">{formatDateTime(rec.recordedAt)}</p>
                      {rec.durationSec && (
                        <p className="text-xs text-text-muted">
                          {rec.durationSec}秒
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        setPlaying(playing === rec.id ? null : rec.id)
                      }
                      className="px-3 py-1.5 text-xs bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors"
                    >
                      {playing === rec.id ? "閉じる" : "再生"}
                    </button>
                  </div>
                  {playing === rec.id && (
                    <audio
                      controls
                      autoPlay
                      className="w-full mt-2"
                      src={`/api/audio/${rec.id}`}
                      onEnded={() => setPlaying(null)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Activities */}
        {activities.length > 0 && (
          <Card>
            <h3 className="font-semibold mb-4">アクティビティ記録 ({activities.length}件)</h3>
            <div className="space-y-2">
              {activities.map((a) => (
                <div key={a.id} className="flex items-center gap-3 text-sm">
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {new Date(a.createdAt).toLocaleTimeString("ja-JP", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                    {a.activity}
                  </span>
                  {a.note && <span className="text-text-muted text-xs">{a.note}</span>}
                </div>
              ))}
            </div>
          </Card>
        )}
      </Container>
    </div>
  );
}
