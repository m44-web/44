"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ShiftTimer } from "./ShiftTimer";
import { StatusIndicator } from "./StatusIndicator";

function getGpsIntervalMs(): number {
  if (typeof window === "undefined") return 30_000;
  const stored = localStorage.getItem("gps_interval_sec");
  return stored ? parseInt(stored, 10) * 1000 : 30_000;
}

function getAudioChunkMs(): number {
  if (typeof window === "undefined") return 5 * 60 * 1000;
  const stored = localStorage.getItem("audio_chunk_min");
  return stored ? parseInt(stored, 10) * 60 * 1000 : 5 * 60 * 1000;
}

interface ShiftState {
  id: string;
  startedAt: number;
}

export function ShiftController({ userName }: { userName: string }) {
  const [shift, setShift] = useState<ShiftState | null>(null);
  const [loading, setLoading] = useState(false);
  const [gpsActive, setGpsActive] = useState(false);
  const [recordingActive, setRecordingActive] = useState(false);
  const [error, setError] = useState("");

  const watchIdRef = useRef<number | null>(null);
  const gpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const latestPositionRef = useRef<{ lat: number; lng: number; acc?: number } | null>(null);
  const queueRef = useRef<
    Array<{ shiftId: string; latitude: number; longitude: number; accuracy?: number; at: number }>
  >([]);
  const [queuedCount, setQueuedCount] = useState(0);
  const [permState, setPermState] = useState<PermissionState | "unknown">(
    "unknown"
  );
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [myStats, setMyStats] = useState<{
    todayShifts: Array<{ id: string; startedAt: number; endedAt: number | null }>;
    todayWorkedMs: number;
    weekWorkedMs: number;
    weekShiftsCount: number;
  } | null>(null);

  const fetchMyStats = useCallback(async () => {
    try {
      const res = await fetch("/api/my");
      if (res.ok) setMyStats(await res.json());
    } catch {
      // ignore
    }
  }, []);

  const flushQueue = useCallback(async () => {
    while (queueRef.current.length > 0) {
      const entry = queueRef.current[0];
      try {
        const res = await fetch("/api/gps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        });
        if (!res.ok) break;
        queueRef.current.shift();
      } catch {
        break;
      }
    }
    setQueuedCount(queueRef.current.length);
  }, []);

  const sendGps = useCallback(
    async (shiftId: string) => {
      const pos = latestPositionRef.current;
      if (!pos) return;
      const entry = {
        shiftId,
        latitude: pos.lat,
        longitude: pos.lng,
        accuracy: pos.acc,
        at: Date.now(),
      };
      try {
        const res = await fetch("/api/gps", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        });
        if (!res.ok) throw new Error("send failed");
        // Successful send: also flush any backlog
        if (queueRef.current.length > 0) await flushQueue();
      } catch {
        queueRef.current.push(entry);
        setQueuedCount(queueRef.current.length);
      }
    },
    [flushQueue]
  );

  // Retry queued on online + track network state
  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
      flushQueue();
    };
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [flushQueue]);

  // Battery API
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const nav = navigator as Navigator & {
      getBattery?: () => Promise<{ level: number; addEventListener: (e: string, fn: () => void) => void; removeEventListener: (e: string, fn: () => void) => void }>;
    };
    if (!nav.getBattery) return;
    let battery: { level: number; addEventListener: (e: string, fn: () => void) => void; removeEventListener: (e: string, fn: () => void) => void } | null = null;
    const update = () => {
      if (battery) setBatteryLevel(Math.round(battery.level * 100));
    };
    nav.getBattery().then((b) => {
      battery = b;
      update();
      b.addEventListener("levelchange", update);
    });
    return () => {
      battery?.removeEventListener("levelchange", update);
    };
  }, []);

  // Hydrate from current active shift (in case of page reload mid-shift)
  useEffect(() => {
    fetchMyStats();
  }, [fetchMyStats]);

  // Check geolocation permission state
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions) return;
    navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((status) => {
        setPermState(status.state);
        status.onchange = () => setPermState(status.state);
      })
      .catch(() => setPermState("unknown"));
  }, []);

  const startGps = useCallback(
    (shiftId: string) => {
      if (!navigator.geolocation) return;

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          latestPositionRef.current = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            acc: position.coords.accuracy,
          };
          setGpsActive(true);
        },
        () => setGpsActive(false),
        { enableHighAccuracy: true, maximumAge: 10000 }
      );

      // Send GPS immediately and then every N seconds
      setTimeout(() => sendGps(shiftId), 2000);
      gpsIntervalRef.current = setInterval(
        () => sendGps(shiftId),
        getGpsIntervalMs()
      );
    },
    [sendGps]
  );

  const stopGps = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (gpsIntervalRef.current) {
      clearInterval(gpsIntervalRef.current);
      gpsIntervalRef.current = null;
    }
    setGpsActive(false);
  }, []);

  const uploadChunk = useCallback(
    async (blob: Blob, shiftId: string) => {
      const formData = new FormData();
      formData.append("audio", blob);
      formData.append("shiftId", shiftId);
      try {
        await fetch("/api/audio", { method: "POST", body: formData });
      } catch {
        // silently ignore
      }
    },
    []
  );

  const startRecording = useCallback(
    async (shiftId: string) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/mp4";

        const recorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            uploadChunk(e.data, shiftId);
          }
        };

        // N minute chunks (default 5)
        recorder.start(getAudioChunkMs());
        setRecordingActive(true);
      } catch {
        setRecordingActive(false);
      }
    },
    [uploadChunk]
  );

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    setRecordingActive(false);
  }, []);

  const requestWakeLock = useCallback(async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      }
    } catch {
      // not supported or denied
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    wakeLockRef.current?.release();
    wakeLockRef.current = null;
  }, []);

  const handleStartShift = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/shifts/start", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error);
        return;
      }
      const newShift: ShiftState = {
        id: json.shift.id,
        startedAt: json.shift.startedAt,
      };
      setShift(newShift);
      startGps(newShift.id);
      startRecording(newShift.id);
      requestWakeLock();
      fetchMyStats();
    } catch {
      setError("勤務開始に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleEndShift = async () => {
    setLoading(true);
    setError("");
    try {
      // Send final GPS position
      if (shift) await sendGps(shift.id);
      stopGps();
      stopRecording();
      releaseWakeLock();

      const res = await fetch("/api/shifts/end", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error);
        return;
      }
      setShift(null);
      fetchMyStats();
    } catch {
      setError("勤務終了に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (shift) {
      await handleEndShift();
    }
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopGps();
      stopRecording();
      releaseWakeLock();
    };
  }, [stopGps, stopRecording, releaseWakeLock]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-surface border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-semibold">営業監視システム</h1>
          <p className="text-sm text-text-muted">{userName}</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="/settings"
            className="text-sm text-text-muted hover:text-text px-2 py-1"
          >
            設定
          </a>
          <Button variant="ghost" onClick={handleLogout}>
            ログアウト
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        {error && (
          <div className="w-full max-w-sm p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm text-center">
            {error}
          </div>
        )}

        {permState === "denied" && (
          <div className="w-full max-w-sm p-3 bg-warning/10 border border-warning/30 rounded-lg text-warning text-sm">
            <p className="font-semibold">⚠️ 位置情報の許可が必要です</p>
            <p className="text-xs mt-1 text-warning/80">
              ブラウザの設定から位置情報を許可してください。設定 → プライバシーとセキュリティ → 位置情報。
            </p>
          </div>
        )}

        {permState === "prompt" && !shift && (
          <div className="w-full max-w-sm p-3 bg-primary/10 border border-primary/30 rounded-lg text-primary text-sm">
            <p className="font-semibold">📍 位置情報とマイクを使用します</p>
            <p className="text-xs mt-1 text-primary/80">
              勤務開始ボタンを押すと、GPS追跡とマイク録音の許可を求められます。どちらも許可してください。
            </p>
          </div>
        )}

        {/* Timer */}
        {shift && (
          <Card className="w-full max-w-sm">
            <ShiftTimer startedAt={shift.startedAt} />
          </Card>
        )}

        {/* Status Indicators */}
        {shift && (
          <Card className="w-full max-w-sm">
            <div className="flex justify-around">
              <StatusIndicator active={gpsActive} label="GPS追跡中" />
              <StatusIndicator active={recordingActive} label="録音中" />
            </div>
            <div className="flex justify-center gap-4 mt-3 text-xs text-text-muted">
              <span className={isOnline ? "text-success" : "text-danger"}>
                {isOnline ? "● オンライン" : "● オフライン"}
              </span>
              {batteryLevel !== null && (
                <span className={batteryLevel <= 15 ? "text-danger" : batteryLevel <= 30 ? "text-warning" : "text-text-muted"}>
                  🔋 {batteryLevel}%
                </span>
              )}
            </div>
            {!isOnline && (
              <p className="text-xs text-warning text-center mt-2">
                ⚠️ オフラインです。GPSデータはキューに保存されています。
              </p>
            )}
            {batteryLevel !== null && batteryLevel <= 15 && (
              <p className="text-xs text-danger text-center mt-2">
                ⚠️ バッテリー残量が少なくなっています。充電してください。
              </p>
            )}
            {queuedCount > 0 && (
              <p className="text-xs text-warning text-center mt-2">
                ⚠️ 未送信 {queuedCount}件（オンライン復帰後に自動送信）
              </p>
            )}
          </Card>
        )}

        {/* Main Action Button */}
        <div className="w-full max-w-sm">
          {!shift ? (
            <Button
              onClick={handleStartShift}
              loading={loading}
              variant="success"
              className="w-full py-6 text-xl"
            >
              勤務開始
            </Button>
          ) : (
            <Button
              onClick={handleEndShift}
              loading={loading}
              variant="danger"
              className="w-full py-6 text-xl"
            >
              勤務終了
            </Button>
          )}
        </div>

        {!shift && (
          <div className="text-center space-y-2 max-w-sm">
            <p className="text-text-muted text-sm">
              勤務開始するとGPS追跡と音声録音が自動的に開始されます
            </p>
            <p className="text-xs text-text-muted/60">
              💡 ブラウザのタブを閉じるとGPS追跡は止まります。画面を点けたまま、このタブを開いたままにしてください。
            </p>
          </div>
        )}

        {shift && (
          <div className="max-w-sm w-full bg-success/5 border border-success/20 rounded-lg p-3 text-xs text-success/80 space-y-1">
            <p>✓ 画面を消さないでください（WakeLock有効）</p>
            <p>✓ ブラウザを閉じるとGPS追跡が止まります</p>
            <p>✓ 電波が弱い場所ではGPSデータは自動的にキューされ、オンライン復帰時に送信されます</p>
          </div>
        )}

        {/* My Stats */}
        {myStats && (
          <Card className="w-full max-w-sm">
            <h3 className="text-sm font-medium text-text-muted mb-3">
              勤務実績
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-text-muted text-xs">本日の勤務時間</p>
                <p className="font-mono font-bold">
                  {formatMs(myStats.todayWorkedMs)}
                </p>
              </div>
              <div>
                <p className="text-text-muted text-xs">今週の勤務時間</p>
                <p className="font-mono font-bold">
                  {formatMs(myStats.weekWorkedMs)}
                </p>
              </div>
              <div>
                <p className="text-text-muted text-xs">本日のシフト</p>
                <p className="font-bold">{myStats.todayShifts.length}回</p>
              </div>
              <div>
                <p className="text-text-muted text-xs">今週のシフト</p>
                <p className="font-bold">{myStats.weekShiftsCount}回</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function formatMs(ms: number) {
  if (ms < 60000) return `${Math.floor(ms / 1000)}秒`;
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}分`;
  return `${h}時間${m}分`;
}
